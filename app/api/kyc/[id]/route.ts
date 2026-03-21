import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await prisma.kYCRecord.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ status: 200, data: record });
  } catch (err) {
    console.error("[GET /api/kyc/:id]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const record = await prisma.kYCRecord.update({
      where: { id },
      data: {
        status: body.status,
        shuftiEventType: body.shuftiEventType,
        declineReason: body.declineReason,
        reviewNotes: body.reviewNotes,
        reviewedAt: body.status === "approved" || body.status === "declined"
          ? new Date()
          : undefined,
      },
      include: { user: true },
    });

    return NextResponse.json({ status: 200, data: record });
  } catch (err) {
    console.error("[PATCH /api/kyc/:id]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
