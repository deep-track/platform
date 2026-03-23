import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuth();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const record = await prisma.kYIRecord.update({
      where: { id },
      data: {
        status: body.status,
        reviewNotes: body.reviewNotes,
        declineReason: body.declineReason,
        reviewedAt: new Date(),
      },
      include: { user: true },
    });

    return NextResponse.json({ status: 200, data: record });
  } catch (err) {
    console.error("[POST /api/kyi/:id/review]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
