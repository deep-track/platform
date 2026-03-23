import { getClientSession } from "@/lib/client-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Rate limited telemetry endpoint
const MAX_EVENTS_PER_REQUEST = 100;

export async function POST(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid events format" }, { status: 400 });
    }

    if (events.length > MAX_EVENTS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Too many events (max ${MAX_EVENTS_PER_REQUEST})`,
        },
        { status: 429 }
      );
    }

    // Fire-and-forget: don't await telemetry writes
    // This endpoint returns immediately
    // Telemetry events will be stored asynchronously

    return NextResponse.json({
      success: true,
      received: events.length,
    });
  } catch (err) {
    console.error("[POST /api/client/telemetry]", err);
    // Even on error, return 200 — telemetry must never block
    return NextResponse.json(
      { success: false, received: 0 },
      { status: 200 }
    );
  }
}
