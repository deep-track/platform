import type { ShuftiWebhookPayload } from "@/lib/kyc-types";
import { mapShuftiEventToStatus } from "@/lib/shufti";
import { mapShuftiEventToKYBStatus } from "@/lib/shufti-kyb";
import { type NextRequest, NextResponse } from "next/server";

const APP_URL =
	process.env.NEXT_PUBLIC_APP_URL ?? "https://deeptrack-platform.onrender.com";

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const body = await req.text();

		console.log("[Shufti Webhook] Raw body received");

		let payload: ShuftiWebhookPayload;
		try {
			payload = JSON.parse(body);
		} catch {
			console.error("[Shufti Webhook] Invalid JSON");
			return NextResponse.json(
				{ error: "Invalid JSON" },
				{ status: 400 }
			);
		}

		console.log(
			"[Shufti Webhook] Event:",
			payload.event,
			"Reference:",
			payload.reference
		);
		console.log(
			"[Shufti Webhook] Declined codes:",
			payload.declined_codes
		);
		console.log(
			"[Shufti Webhook] Has verification_data:",
			!!payload.verification_data
		);

		if (!payload.reference || !payload.event) {
			console.error("[Shufti Webhook] Missing reference or event");
			return NextResponse.json(
				{ error: "Invalid payload" },
				{ status: 400 }
			);
		}

		const appUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || APP_URL;
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

		console.log("[Shufti Webhook] Calling:", endpoint);

		const updateBody = {
			status: newStatus,
			shuftiEventType: payload.event,
			declineReason: payload.declined_reason ?? null,
			// CRITICAL — pass declined codes array
			declinedCodes: declinedCodes,
			// CRITICAL — pass full extracted data
			extractedData: payload.verification_data ?? null,
			verificationResult: payload.verification_result ?? null,
		};

		console.log(
			"[Shufti Webhook] Update body:",
			JSON.stringify({
				status: newStatus,
				codesCount: updateBody.declinedCodes.length,
				hasExtractedData: !!updateBody.extractedData,
			})
		);

		const response = await fetch(endpoint, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updateBody),
		});

		if (!response.ok) {
			const text = await response.text();
			console.error("[Shufti Webhook] Failed to update record:", response.status, text);
		} else {
			console.log("[Shufti Webhook] Successfully updated to status:", newStatus);
		}

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (err) {
		console.error("[Shufti Webhook] Unhandled error:", err);
		return NextResponse.json({ received: true }, { status: 200 });
	}
}
