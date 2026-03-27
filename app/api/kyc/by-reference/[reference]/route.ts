import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const body = await req.json();

    console.log("[KYC by-reference PATCH]", reference, {
      status: body.status,
      codesCount: body.declinedCodes?.length,
      hasExtractedData: !!body.extractedData,
    });

    // Verify the record exists first
    const existing = await prisma.kYCRecord.findUnique({
      where: { reference },
    });

    if (!existing) {
      console.error("[KYC by-reference] Record not found:", reference);
      return NextResponse.json(
        { error: "KYC record not found" },
        { status: 404 }
      );
    }

    const record = await prisma.kYCRecord.update({
      where: { reference },
      data: {
        status: body.status ?? existing.status,
        shuftiEventType: body.shuftiEventType ?? existing.shuftiEventType,
        declineReason: body.declineReason ?? existing.declineReason,
        // Save declined codes array
        declinedCodes: Array.isArray(body.declinedCodes)
          ? body.declinedCodes
          : [],
        // Save full Shufti extracted data
        extractedData: body.extractedData ?? existing.extractedData,
        verificationResult:
          body.verificationResult ?? existing.verificationResult,
        // Set reviewedAt when terminal status reached
        reviewedAt:
          body.status === "approved" || body.status === "declined"
            ? new Date()
            : existing.reviewedAt,
      },
    });

    console.log(
      "[KYC by-reference] Updated record:",
      record.id,
      "status:",
      record.status,
      "codes:",
      record.declinedCodes
    );

    return NextResponse.json({ status: 200, data: record });
  } catch (err) {
    console.error("[KYC by-reference PATCH] Error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
