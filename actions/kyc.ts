"use server";

import { randomUUID } from "crypto";
import {
  buildShuftiRequest,
  createShuftiVerification,
  getShuftiVerificationStatus,
  mapShuftiEventToStatus,
} from "@/lib/shufti";
import type {
  KYCActionResult,
  KYCInvitation,
  KYCRecord,
  KYCSubmitPayload,
  KYCStatus,
} from "@/lib/kyc-types";
import { getAuth } from "@/lib/auth";

const BACKEND = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function requireBackend() {
  if (!BACKEND) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }
}

export async function submitKYC(
  payload: KYCSubmitPayload,
): Promise<KYCActionResult<{ kycId: string; reference: string; verificationUrl: string | null }>> {
  try {
    requireBackend();
    const auth = await getAuth();
    if (!auth?.userId) return { success: false, error: "Not authenticated" };

    const reference = `KYC-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    const shuftiRequest = buildShuftiRequest({
      reference,
      email: payload.personalInfo.email,
      country: payload.personalInfo.address.country,
      documentType: payload.document.documentType,
      documentFrontUrl: payload.document.documentFrontUrl,
      documentBackUrl: payload.document.documentBackUrl,
      documentFrontBase64: payload.document.documentFrontBase64,
      documentBackBase64: payload.document.documentBackBase64,
      selfieUrl: payload.selfie.selfieUrl,
      selfieBase64: payload.selfie.selfieBase64,
      firstName: payload.personalInfo.firstName,
      lastName: payload.personalInfo.lastName,
      middleName: payload.personalInfo.middleName,
      dateOfBirth: payload.personalInfo.dateOfBirth,
      gender: payload.personalInfo.gender,
      documentNumber: payload.document.documentNumber,
      expiryDate: payload.document.expiryDate,
      issueDate: payload.document.issueDate,
    });

    const shuftiResponse = await createShuftiVerification(shuftiRequest);

    const res = await fetch(`${BACKEND}/api/kyc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        userId: auth.userId,
        personalInfo: payload.personalInfo,
        documentType: payload.document.documentType,
        documentFrontUrl: payload.document.documentFrontUrl,
        documentBackUrl: payload.document.documentBackUrl,
        selfieUrl: payload.selfie.selfieUrl,
        status:
          shuftiResponse.event === "verification.accepted"
            ? "approved"
            : "processing",
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
    const data = responseBody?.data;
    return {
      success: true,
      data: {
        kycId: data.id,
        reference,
        verificationUrl: shuftiResponse.verification_url ?? null,
      },
    };
  } catch (err) {
    console.error("[submitKYC]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Submission failed",
    };
  }
}

export async function getKYCList(params?: {
  status?: KYCStatus;
  page?: number;
  limit?: number;
}): Promise<KYCActionResult<{ records: KYCRecord[]; total: number }>> {
  try {
    if (!BACKEND) {
      return { success: true, data: { records: [], total: 0 } };
    }
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit ?? 20));

    const res = await fetch(`${BACKEND}/api/kyc?${qs.toString()}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status >= 500) {
        console.info(`[getKYCList] upstream unavailable (${res.status})`);
        return { success: true, data: { records: [], total: 0 } };
      }
      throw new Error(`Backend ${res.status}`);
    }
    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[getKYCList]", err);
    return { success: false, error: "Failed to fetch KYC records" };
  }
}

export async function getKYCRecord(id: string): Promise<KYCActionResult<KYCRecord>> {
  try {
    requireBackend();
    const res = await fetch(`${BACKEND}/api/kyc/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[getKYCRecord]", err);
    return { success: false, error: "Failed to fetch KYC record" };
  }
}

export async function getMyKYCStatus(): Promise<KYCActionResult<KYCRecord | null>> {
  try {
    requireBackend();
    const auth = await getAuth();
    if (!auth?.userId) return { success: false, error: "Not authenticated" };

    const res = await fetch(`${BACKEND}/api/kyc/me?userId=${encodeURIComponent(auth.userId)}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.status === 404) return { success: true, data: null };
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[getMyKYCStatus]", err);
    return { success: false, error: "Failed to fetch your KYC status" };
  }
}

export async function refreshKYCFromShufti(
  id: string,
  reference: string,
): Promise<KYCActionResult<KYCRecord>> {
  try {
    requireBackend();
    const shuftiStatus = await getShuftiVerificationStatus(reference);
    const newStatus = mapShuftiEventToStatus(shuftiStatus.event);

    const res = await fetch(`${BACKEND}/api/kyc/${id}`, {
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
    console.error("[refreshKYCFromShufti]", err);
    return { success: false, error: "Failed to refresh verification status" };
  }
}

export async function reviewKYC(params: {
  id: string;
  decision: "approved" | "declined";
  notes?: string;
  declineReason?: string;
}): Promise<KYCActionResult<KYCRecord>> {
  try {
    requireBackend();
    const res = await fetch(`${BACKEND}/api/kyc/${params.id}/review`, {
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
    console.error("[reviewKYC]", err);
    return { success: false, error: "Failed to submit review decision" };
  }
}

export async function inviteUserForKYC(params: {
  email: string;
  name?: string;
}): Promise<KYCActionResult<KYCInvitation>> {
  try {
    requireBackend();
    const auth = await getAuth();
    if (!auth?.userId) return { success: false, error: "Not authenticated" };

    const res = await fetch(`${BACKEND}/api/kyc/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.email,
        name: params.name,
        invitedBy: auth.userId,
      }),
    });

    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const responseBody = await res.json();
    return { success: true, data: responseBody?.data };
  } catch (err) {
    console.error("[inviteUserForKYC]", err);
    return { success: false, error: "Failed to send KYC invitation" };
  }
}

export async function getKYCStats(): Promise<
  KYCActionResult<{
    total: number;
    approved: number;
    declined: number;
    pending: number;
    processing: number;
    requires_review: number;
  }>
> {
  try {
    if (!BACKEND) {
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
    const res = await fetch(`${BACKEND}/api/kyc/stats`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status >= 500) {
        console.info(`[getKYCStats] upstream unavailable (${res.status})`);
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
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("[getKYCStats]", err);
    return { success: false, error: "Failed to fetch KYC stats" };
  }
}
