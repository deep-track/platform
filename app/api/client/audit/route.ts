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

    const searchParams = req.nextUrl.searchParams;
    const eventType = searchParams.get("eventType");
    const actorId = searchParams.get("actorId");
    const targetType = searchParams.get("targetType");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where: Record<string, unknown> = { orgId: session.orgId };

    if (eventType) where.eventType = eventType;
    if (actorId) where.actorId = actorId;
    if (targetType) where.targetType = targetType;

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) (where.timestamp as any).gte = new Date(dateFrom);
      if (dateTo) (where.timestamp as any).lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("[GET /api/client/audit]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
