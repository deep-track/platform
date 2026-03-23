import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const body = await req.json();

    const record = await prisma.kYCRecord.update({
      where: { reference },
      data: {
        status: body.status,
        shuftiEventType: body.shuftiEventType,
        extractedData: body.extractedData,
        verificationResult: body.verificationResult,
        declineReason: body.declineReason,
      },
    });

    return NextResponse.json({ status: 200, data: record });
  } catch (err) {
    console.error("[PATCH /api/kyc/by-reference/:reference]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
