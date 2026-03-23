import { getClientSession, ROLES, requireRoles } from "@/lib/client-auth";
import { auditLog } from "@/lib/telemetry";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getClientSession();
    if (!session || !requireRoles(session, ROLES.ADMIN_ONLY)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { role, isActive } = body;

    const updated = await prisma.clientMember.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    auditLog({
      orgId: session.orgId,
      eventType: isActive === false ? "user.deactivated" : "user.role_changed",
      actorId: session.userId,
      actorRole: session.role,
      targetType: "user",
      targetId: id,
      after: { role, isActive },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[PATCH /api/client/members/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
