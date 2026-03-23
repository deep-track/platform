import { getClientSession, ROLES, requireRoles } from "@/lib/client-auth";
import { auditLog } from "@/lib/telemetry";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await prisma.clientAPIKey.findMany({
      where: {
        orgId: session.orgId,
        isRevoked: false,
      },
      select: {
        id: true,
        name: true,
        key: false,
        lastUsedAt: true,
        usageCount: true,
        errorCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: keys });
  } catch (err) {
    console.error("[GET /api/client/api-keys]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (
      !session ||
      !requireRoles(session, ROLES.CAN_DEV)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name } = body;

    const key = `sk_${randomUUID().replace(/-/g, "")}`;

    const created = await prisma.clientAPIKey.create({
      data: {
        orgId: session.orgId,
        name,
        key,
        createdBy: session.userId,
      },
    });

    auditLog({
      orgId: session.orgId,
      eventType: "api.key_created",
      actorId: session.userId,
      actorRole: session.role,
      targetType: "api_key",
      targetId: created.id,
    });

    return NextResponse.json({ data: { ...created, key } }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/client/api-keys]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
