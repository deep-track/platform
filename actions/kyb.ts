"use server";

import { getAuth, getCurrentUser } from "@/lib/auth";
import type { Position, UploadedDocument } from "@/lib/kyb-types";

const BACKEND = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface KYBSubmitPayload {
	businessName: string;
	registrationNumber: string;
	country: string;
	documents: UploadedDocument[];
	ubos: Array<{
		firstName: string;
		lastName: string;
		dateOfBirth: string;
		email: string;
		position: Position;
		shareholding?: string;
	}>;
}

export interface KYBSubmitResult {
	success: boolean;
	data?: {
		kybId: string;
		reference: string;
		status: string;
	};
	error?: string;
}

export interface KYBRecord {
	id: string;
	reference: string;
	status: string;
	businessName: string | null;
	registrationNumber: string | null;
	country: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface KYBActionResult<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
}

export async function submitKYB(
	payload: KYBSubmitPayload,
): Promise<KYBSubmitResult> {
	try {
		const auth = await getAuth();
		if (!auth?.userId) return { success: false, error: "Not authenticated" };

		const appUrl =
			process.env.APP_BASE_URL ||
			process.env.NEXT_PUBLIC_APP_URL ||
			"https://deeptrack-platform.onrender.com";

		const res = await fetch(`${appUrl}/api/kyb/submit`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				businessName: payload.businessName,
				registrationNumber: payload.registrationNumber,
				country: payload.country,
				documents: payload.documents.map((doc) => ({
					type: doc.type,
					fileName: doc.fileName,
					mimeType: doc.mimeType,
					base64: doc.base64,
				})),
				ubos: payload.ubos,
				userId: auth.userId,
			}),
		});

		if (!res.ok) {
			const errorData = await res.json();
			throw new Error(errorData.error || `Backend error: ${res.status}`);
		}

		const responseBody = await res.json();
		return {
			success: true,
			data: {
				kybId: responseBody.kybId,
				reference: responseBody.reference,
				status: responseBody.status,
			},
		};
	} catch (err) {
		console.error("[submitKYB]", err);
		return {
			success: false,
			error: err instanceof Error ? err.message : "Submission failed",
		};
	}
}

export async function getKYBList(params?: {
	status?: string;
	page?: number;
	limit?: number;
}): Promise<KYBActionResult<{ records: KYBRecord[]; total: number }>> {
	try {
		if (!BACKEND) {
			return { success: true, data: { records: [], total: 0 } };
		}
		const auth = await getAuth();
		if (!auth?.userId) return { success: false, error: "Not authenticated" };

		const qs = new URLSearchParams();
		if (params?.status) qs.set("status", params.status);
		if (params?.page) qs.set("page", String(params.page));
		if (params?.limit) qs.set("limit", String(params?.limit ?? 20));
		qs.set("userId", auth.userId);

		const res = await fetch(`${BACKEND}/api/kyb?${qs.toString()}`, {
			headers: { "Content-Type": "application/json" },
			cache: "no-store",
		});

		if (!res.ok) {
			if (res.status >= 500) {
				console.info(`[getKYBList] upstream unavailable (${res.status})`);
				return { success: true, data: { records: [], total: 0 } };
			}
			throw new Error(`Backend ${res.status}`);
		}
		const responseBody = await res.json();
		return { success: true, data: responseBody?.data };
	} catch (err) {
		console.error("[getKYBList]", err);
		return { success: false, error: "Failed to fetch KYB records" };
	}
}

export async function getKYBRecord(
	id: string,
): Promise<KYBActionResult<KYBRecord>> {
	try {
		if (!BACKEND) {
			return { success: false, error: "Backend URL not configured" };
		}
		const res = await fetch(`${BACKEND}/api/kyb/${id}`, {
			headers: { "Content-Type": "application/json" },
			cache: "no-store",
		});

		if (!res.ok) throw new Error(`Backend ${res.status}`);
		const responseBody = await res.json();
		return { success: true, data: responseBody?.data };
	} catch (err) {
		console.error("[getKYBRecord]", err);
		return { success: false, error: "Failed to fetch KYB record" };
	}
}

export async function getKYBStats(): Promise<
	KYBActionResult<{
		total: number;
		approved: number;
		declined: number;
		pending: number;
		processing: number;
		requires_review: number;
	}>
> {
	try {
		const appUrl =
			process.env.APP_BASE_URL ||
			process.env.NEXT_PUBLIC_APP_URL ||
			"https://deeptrack-platform.onrender.com";

		const res = await fetch(`${appUrl}/api/kyb/stats`, {
			cache: "no-store",
		});

		if (!res.ok) throw new Error(`Stats failed: ${res.status}`);
		const data = await res.json();
		return { success: true, data: data.data };
	} catch (err) {
		console.error("[getKYBStats]", err);
		return { success: false, error: "Failed to fetch KYB stats" };
	}
}
