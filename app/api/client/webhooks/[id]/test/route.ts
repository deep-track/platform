import { getClientSession } from "@/lib/client-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = {
      eventType: "test.webhook",
      orgId: session.orgId,
      timestamp: new Date().toISOString(),
      data: { testEvent: true },
    };

    // In a real implementation, you'd fetch the webhook and send the payload
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: "Test payload sent",
      payload,
    });
  } catch (err) {
    console.error("[POST /api/client/webhooks/[id]/test]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
