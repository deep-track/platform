import { type NextRequest, NextResponse } from "next/server";
import { mapShuftiEventToStatus } from "@/lib/shufti";
import type { ShuftiWebhookPayload } from "@/lib/kyc-types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.text();
    const payload = JSON.parse(body) as ShuftiWebhookPayload;

    if (!payload.reference || !payload.event) {
      console.warn("[Shufti Webhook] Invalid payload", payload);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const newStatus = mapShuftiEventToStatus(payload.event);

    const response = await fetch(`${APP_URL}/api/kyc/by-reference/${payload.reference}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
        shuftiEventType: payload.event,
        declineReason: payload.declined_reason,
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
