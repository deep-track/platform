import { type NextRequest, NextResponse } from "next/server";
import { mapShuftiEventToStatus } from "@/lib/shufti";
import type { ShuftiWebhookPayload } from "@/lib/kyc-types";

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

    const newStatus = mapShuftiEventToStatus(payload.event);

    const appUrl =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // Route to correct handler based on reference prefix
    const isKYI = payload.reference.startsWith("KYI-");
    const endpoint = isKYI
      ? `${appUrl}/api/kyi/by-reference/${payload.reference}`
      : `${appUrl}/api/kyc/by-reference/${payload.reference}`;

    console.log("[Shufti Webhook] Calling:", endpoint);

    const updateBody = {
      status: newStatus,
      shuftiEventType: payload.event,
      declineReason: payload.declined_reason ?? null,
      // CRITICAL — pass declined codes array
      declinedCodes: payload.declined_codes ?? [],
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

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[Shufti Webhook] Failed to update record:",
        res.status,
        text
      );
    } else {
      console.log(
        "[Shufti Webhook] Successfully updated to status:",
        newStatus
      );
    }

    // Always return 200 to Shufti
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[Shufti Webhook] Unhandled error:", err);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
