import { getClientSession } from "@/lib/client-auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = await prisma.verification.findFirst({
      where: {
        id: params.id,
        orgId: session.orgId,
      },
      include: {
        telemetryEvents: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: verification });
  } catch (err) {
    console.error("[GET /api/client/verifications/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = await prisma.verification.findFirst({
      where: {
        id: params.id,
        orgId: session.orgId,
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { assignedTo, reviewNotes } = body;

    const updated = await prisma.verification.update({
      where: { id: params.id },
      data: {
        ...(assignedTo !== undefined && { assignedTo }),
        ...(reviewNotes !== undefined && { reviewNotes }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[PATCH /api/client/verifications/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
