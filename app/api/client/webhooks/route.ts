import { getClientSession } from "@/lib/client-auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhooks = await prisma.clientWebhook.findMany({
      where: { orgId: session.orgId },
      select: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        lastStatus: true,
        lastDelivery: true,
        failCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: webhooks });
  } catch (err) {
    console.error("[GET /api/client/webhooks]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url, events, retryCount = 3 } = body;

    if (!url || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Invalid webhook configuration" },
        { status: 400 }
      );
    }

    const secret = `whsec_${Buffer.from(Date.now().toString()).toString("base64")}`;

    const webhook = await prisma.clientWebhook.create({
      data: {
        orgId: session.orgId,
        url,
        events,
        retryCount,
        secret,
      },
    });

    return NextResponse.json(
      { data: { ...webhook, secret } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/client/webhooks]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
