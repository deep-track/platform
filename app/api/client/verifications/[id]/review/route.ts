import { getClientSession, ROLES, requireRoles } from "@/lib/client-auth";
import { auditLog } from "@/lib/telemetry";
import prisma from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getClientSession();
    if (
      !session ||
      !requireRoles(session, ROLES.CAN_REVIEW)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const verification = await prisma.verification.findFirst({
      where: {
        id: id,
        orgId: session.orgId,
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { decision, notes, reason } = body;

    const validDecisions = ["approve", "reject", "escalate", "request_resubmission"];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision" },
        { status: 400 }
      );
    }

    if ((decision === "reject" || decision === "escalate") && !notes) {
      return NextResponse.json(
        { error: "Notes required for reject and escalate" },
        { status: 400 }
      );
    }

    const statusMap: Record<string, VerificationStatus> = {
      approve: VerificationStatus.APPROVED,
      reject: VerificationStatus.REJECTED,
      escalate: VerificationStatus.ESCALATED,
      request_resubmission: VerificationStatus.STARTED,
    };

    const updated = await prisma.verification.update({
      where: { id: id },
      data: {
        status: statusMap[decision],
        reviewedBy: session.userId,
        reviewNotes: notes,
        declineReason: reason,
        completedAt: decision !== "request_resubmission" ? new Date() : null,
      },
    });

    // Write audit log
    auditLog({
      orgId: session.orgId,
      eventType: `verification.${decision}`,
      actorId: session.userId,
      actorRole: session.role,
      targetType: "verification",
      targetId: id,
      after: { status: statusMap[decision], reviewNotes: notes },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[POST /api/client/verifications/[id]/review]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
