import type { ShuftiWebhookPayload } from "@/lib/kyc-types";
import { mapShuftiEventToStatus } from "@/lib/shufti";
import { mapShuftiEventToKYBStatus } from "@/lib/shufti-kyb";
import { type NextRequest, NextResponse } from "next/server";

const APP_URL =
	process.env.NEXT_PUBLIC_APP_URL ?? "https://deeptrack-platform.onrender.com";

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const body = await req.text();
		const payload = JSON.parse(body) as ShuftiWebhookPayload;

		if (!payload.reference || !payload.event) {
			console.warn("[Shufti Webhook] Invalid payload", payload);
			return NextResponse.json({ received: true }, { status: 200 });
		}

		const appUrl =
			process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || APP_URL;
		const isKYI = payload.reference.startsWith("KYI-");
		const isKYC = payload.reference.startsWith("KYC-");
		const isKYB = payload.reference.startsWith("KYB-");

		const endpoint = isKYI
			? `${appUrl}/api/kyi/by-reference/${payload.reference}`
			: isKYC
				? `${appUrl}/api/kyc/by-reference/${payload.reference}`
				: isKYB
					? `${appUrl}/api/kyb/by-reference/${payload.reference}`
					: `${appUrl}/api/kyc/by-reference/${payload.reference}`;

		const newStatus = isKYB
			? mapShuftiEventToKYBStatus(payload.event)
			: mapShuftiEventToStatus(payload.event);

		// Extract declined codes from payload if verification was declined
		const declinedCodes = Array.isArray(payload.declined_codes)
			? payload.declined_codes
			: payload.declined_codes
				? [payload.declined_codes]
				: [];

		const response = await fetch(endpoint, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				status: newStatus,
				shuftiEventType: payload.event,
				declineReason: payload.declined_reason ?? null,
				declinedCodes: declinedCodes,
				extractedData: payload.verification_data,
				verificationResult: payload.verification_result,
			}),
		});

		if (!response.ok) {
			const text = await response.text();
			console.error("[Shufti Webhook] Backend PATCH failed", text);
		}

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (err) {
		console.error("[Shufti Webhook] Error:", err);
		return NextResponse.json({ received: true }, { status: 200 });
	}
}
