"use server";

import { randomUUID } from "crypto";
import { getAuth, getCurrentUser } from "@/lib/auth";
import {
  createShuftiVerification,
  getShuftiVerificationStatus,
  mapShuftiEventToStatus,
} from "@/lib/shufti";
import type {
  KYIActionResult,
  KYIInvitation,
  KYIRecord,
  KYIStatus,
  KYISubmitPayload,
} from "@/lib/kyi-types";

const APP_URL =
  process.env.APP_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://platform-one-sable.vercel.app";

export async function submitKYI(
  payload: KYISubmitPayload,
): Promise<KYIActionResult<{ kyiId: string; reference: string; verificationUrl: string | null }>> {
  try {
    const auth = await getAuth();
    if (!auth?.userId) return { success: false, error: "Not authenticated" };

    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "User not found" };

    const reference = `KYI-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    const shuftiResponse = await createShuftiVerification({
      reference,
      callback_url: `${APP_URL}/api/webhooks/shufti`,
      redirect_url: `${APP_URL}/kyi`,
      country: payload.institutionInfo.countryOfIncorporation.toUpperCase().slice(0, 2),
      language: "EN",
      email: payload.institutionInfo.email,
      verification_mode: "any",
      document: {
        proof: "",
        supported_types: ["id_card"],
        name: {
          first_name: payload.institutionInfo.institutionName,
          last_name: payload.institutionInfo.registrationNumber,
          middle_name: payload.representative.jobTitle,
        },
      },
      face: {
        proof: "",
      },
    });

    const res = await fetch(`${APP_URL}/api/kyi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        userId: auth.userId,
        userEmail: currentUser.email,
        userName: currentUser.fullName,
        institutionInfo: payload.institutionInfo,
        representative: payload.representative,
        documents: payload.documents,
        status: "pending",
        shuftiEventType: shuftiResponse.event,
        shuftiVerificationUrl: shuftiResponse.verification_url,
        invitationToken: payload.invitationToken,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend error: ${text}`);
    }

    const responseBody = await res.json();
    return {
      success: true,
      data: {
        kyiId: responseBody?.data?.id,
        reference,
        verificationUrl: shuftiResponse.verification_url ?? null,
      },
    };
  } catch (err) {
    console.error("[submitKYI]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Submission failed",
    };
  }
}

export async function getKYIList(params?: {
  status?: KYIStatus;
  page?: number;
  limit?: number;
}): Promise<KYIActionResult<{ records: KYIRecord[]; total: number }>> {
  try {
    const auth = await getAuth();
    if (!auth?.userId) return { success: false, error: "Not authenticated" };

    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit ?? 20));
    qs.set("userId", auth.userId);

    const res = await fetch(`${APP_URL}/api/kyi?${qs.toString()}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status >= 500) {
        return { success: true, data: { records: [], total: 0 } };
      }
      throw new Error(`Backend ${res.status}`);
    }

    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[getKYIList]", err);
    return { success: false, error: "Failed to fetch KYI records" };
  }
}

export async function getKYIRecord(id: string): Promise<KYIActionResult<KYIRecord>> {
  try {
    const res = await fetch(`${APP_URL}/api/kyi/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[getKYIRecord]", err);
    return { success: false, error: "Failed to fetch KYI record" };
  }
}

export async function getKYIStats(): Promise<
  KYIActionResult<{
    total: number;
    approved: number;
    declined: number;
    pending: number;
    processing: number;
    requires_review: number;
  }>
> {
  try {
    const res = await fetch(`${APP_URL}/api/kyi/stats`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          success: true,
          data: {
            total: 0,
            approved: 0,
            declined: 0,
            pending: 0,
            processing: 0,
            requires_review: 0,
          },
        };
      }
      throw new Error(`Backend ${res.status}`);
    }

    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[getKYIStats]", err);
    return { success: false, error: "Failed to fetch KYI stats" };
  }
}

export async function reviewKYI(params: {
  id: string;
  decision: "approved" | "declined";
  notes?: string;
  declineReason?: string;
}): Promise<KYIActionResult<KYIRecord>> {
  try {
    const res = await fetch(`${APP_URL}/api/kyi/${params.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: params.decision,
        reviewNotes: params.notes,
        declineReason: params.declineReason,
      }),
    });

    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[reviewKYI]", err);
    return { success: false, error: "Failed to submit review decision" };
  }
}

export async function inviteInstitutionForKYI(params: {
  email: string;
  institutionName?: string;
}): Promise<KYIActionResult<KYIInvitation>> {
  try {
    const auth = await getAuth();
    if (!auth?.userId) return { success: false, error: "Not authenticated" };

    const res = await fetch(`${APP_URL}/api/kyi/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.email,
        institutionName: params.institutionName,
        invitedBy: auth.userId,
      }),
    });

    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[inviteInstitutionForKYI]", err);
    return { success: false, error: "Failed to send KYI invitation" };
  }
}

export async function refreshKYIFromShufti(
  id: string,
  reference: string,
): Promise<KYIActionResult<KYIRecord>> {
  try {
    const shuftiStatus = await getShuftiVerificationStatus(reference);
    const newStatus = mapShuftiEventToStatus(shuftiStatus.event);

    const res = await fetch(`${APP_URL}/api/kyi/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        shuftiEventType: shuftiStatus.event,
      }),
    });

    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[refreshKYIFromShufti]", err);
    return { success: false, error: "Failed to refresh verification status" };
  }
}
