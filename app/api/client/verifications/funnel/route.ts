import { getClientSession } from "@/lib/client-auth";
import prisma from "@/lib/prisma";
import { VerificationStatus, VerificationType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") ?? "7d";
    const typeParam = searchParams.get("type");
    
    // Validate type is a valid verification type
    const validTypes: VerificationType[] = [VerificationType.KYC, VerificationType.KYB, VerificationType.KYI];
    const type = typeParam && (validTypes as string[]).includes(typeParam) ? (typeParam as VerificationType) : undefined;

    let fromDate = new Date();
    if (timeRange === "today") {
      fromDate.setHours(0, 0, 0, 0);
    } else if (timeRange === "7d") {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (timeRange === "30d") {
      fromDate.setDate(fromDate.getDate() - 30);
    }

    const where = {
      orgId: session.orgId,
      createdAt: { gte: fromDate },
      ...(type && { type }),
    };

    const started = await prisma.verification.count({
      where: { ...where, status: VerificationStatus.STARTED },
    });

    const submitted = await prisma.verification.count({
      where: {
        ...where,
        status: { in: [VerificationStatus.PENDING_REVIEW, VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.ESCALATED] },
      },
    });

    const scanCompleted = await prisma.verification.count({
      where: {
        ...where,
        status: { in: [VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.ESCALATED] },
      },
    });

    const approved = await prisma.verification.count({
      where: { ...where, status: VerificationStatus.APPROVED },
    });

    const dropped1 = started - submitted;
    const dropped2 = submitted - scanCompleted;
    const dropped3 = scanCompleted - approved;

    return NextResponse.json({
      stages: [
        { name: "Started", count: started || 0, drop: "0" },
        {
          name: "Submitted",
          count: submitted || 0,
          drop: started > 0 ? ((dropped1 / started) * 100).toFixed(1) : "0",
        },
        {
          name: "Scan Complete",
          count: scanCompleted || 0,
          drop: submitted > 0 ? ((dropped2 / submitted) * 100).toFixed(1) : "0",
        },
        {
          name: "Approved",
          count: approved || 0,
          drop: scanCompleted > 0 ? ((dropped3 / scanCompleted) * 100).toFixed(1) : "0",
        },
      ],
    });
  } catch (err) {
    console.error("[GET /api/client/verifications/funnel]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
