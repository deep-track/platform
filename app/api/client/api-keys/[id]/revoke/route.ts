import { getClientSession, ROLES, requireRoles } from "@/lib/client-auth";
import { auditLog } from "@/lib/telemetry";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getClientSession();
    if (!session || !requireRoles(session, ROLES.ADMIN_ONLY)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.clientAPIKey.update({
      where: { id: params.id },
      data: { isRevoked: true },
    });

    auditLog({
      orgId: session.orgId,
      eventType: "api.key_revoked",
      actorId: session.userId,
      actorRole: session.role,
      targetType: "api_key",
      targetId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/client/api-keys/[id]/revoke]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
