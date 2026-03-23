import { getClientSession, ROLES, requireRoles } from "@/lib/client-auth";
import { auditLog } from "@/lib/telemetry";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session || !requireRoles(session, ROLES.ADMIN_ONLY)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await prisma.clientMember.findMany({
      where: { orgId: session.orgId, isActive: true },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: members });
  } catch (err) {
    console.error("[GET /api/client/members]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session || !requireRoles(session, ROLES.ADMIN_ONLY)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, role } = body;

    // In a real implementation, you'd send an invitation email here
    // For now, we'll just record the intent

    auditLog({
      orgId: session.orgId,
      eventType: "user.invited",
      actorId: session.userId,
      actorRole: session.role,
      after: { email, role },
    });

    return NextResponse.json({
      data: { email, role, invitedAt: new Date() },
    });
  } catch (err) {
    console.error("[POST /api/client/members]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
