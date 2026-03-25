import { getClientSession } from "@/lib/client-auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/client/verifications/declined-reasons
 * Returns detailed feedback for declined/rejected verifications
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") ?? "7d";
    const limit = parseInt(searchParams.get("limit") ?? "10");

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
      status: "REJECTED" as const,
      createdAt: { gte: fromDate },
    };

    // Get rejected verifications with their feedback
    const rejectedVerifications = await prisma.verification.findMany({
      where,
      select: {
        id: true,
        type: true,
        declineReason: true,
        reviewNotes: true,
        metadata: true,
        completedAt: true,
      },
      orderBy: { completedAt: "desc" },
      take: limit,
    });

    // Parse rejection reasons and count by type
    const reasons: Record<string, number> = {};
    const detailedReasons = rejectedVerifications.map((v: typeof rejectedVerifications[number]) => {
      let reason = v.declineReason || v.reviewNotes || "Unknown reason";

      // If metadata contains rejection details, use those
      if (v.metadata) {
        try {
          const meta = typeof v.metadata === "string" ? JSON.parse(v.metadata) : v.metadata;
          if (meta.rejectionDetails) {
            reason = meta.rejectionDetails;
          } else if (meta.failureReason) {
            reason = meta.failureReason;
          }
        } catch (e) {
          // Keep original reason if JSON parsing fails
        }
      }

      // Count reasons
      reasons[reason] = (reasons[reason] || 0) + 1;

      return {
        verificationId: v.id,
        type: v.type,
        reason,
        completedAt: v.completedAt?.toISOString(),
      };
    });

    // Get summary by reason type
    const reasonSummary = Object.entries(reasons)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: ((count / rejectedVerifications.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    // Get common rejection categories
    const categories = {
      documentIssues: rejectedVerifications.filter(
        (v: typeof rejectedVerifications[number]) =>
          (v.declineReason || "").toLowerCase().includes("document") ||
          (v.declineReason || "").toLowerCase().includes("image") ||
          (v.declineReason || "").toLowerCase().includes("quality") ||
          (v.reviewNotes || "").toLowerCase().includes("document") ||
          (v.reviewNotes || "").toLowerCase().includes("image") ||
          (v.reviewNotes || "").toLowerCase().includes("quality")
      ).length,
      identityMismatch: rejectedVerifications.filter(
        (v: typeof rejectedVerifications[number]) =>
          (v.declineReason || "").toLowerCase().includes("mismatch") ||
          (v.declineReason || "").toLowerCase().includes("match") ||
          (v.declineReason || "").toLowerCase().includes("face") ||
          (v.reviewNotes || "").toLowerCase().includes("mismatch") ||
          (v.reviewNotes || "").toLowerCase().includes("match") ||
          (v.reviewNotes || "").toLowerCase().includes("face")
      ).length,
      incompleteInfo: rejectedVerifications.filter(
        (v: typeof rejectedVerifications[number]) =>
          (v.declineReason || "").toLowerCase().includes("incomplete") ||
          (v.declineReason || "").toLowerCase().includes("missing") ||
          (v.declineReason || "").toLowerCase().includes("required") ||
          (v.reviewNotes || "").toLowerCase().includes("incomplete") ||
          (v.reviewNotes || "").toLowerCase().includes("missing") ||
          (v.reviewNotes || "").toLowerCase().includes("required")
      ).length,
      unsupportedDocument: rejectedVerifications.filter(
        (v: typeof rejectedVerifications[number]) =>
          (v.declineReason || "").toLowerCase().includes("unsupported") ||
          (v.declineReason || "").toLowerCase().includes("not accepted") ||
          (v.reviewNotes || "").toLowerCase().includes("unsupported") ||
          (v.reviewNotes || "").toLowerCase().includes("not accepted")
      ).length,
      other: 0,
    };

    // Calculate "other"
    categories.other =
      rejectedVerifications.length -
      (categories.documentIssues +
        categories.identityMismatch +
        categories.incompleteInfo +
        categories.unsupportedDocument);

    return NextResponse.json({
      totalRejected: rejectedVerifications.length || 0,
      timeRange,
      reasonSummary: reasonSummary.map((r) => ({
        reason: r.reason || "Unknown",
        count: r.count || 0,
        percentage: isFinite(parseFloat(r.percentage)) ? parseFloat(r.percentage) : 0,
      })),
      categories: {
        documentIssues: categories.documentIssues || 0,
        identityMismatch: categories.identityMismatch || 0,
        incompleteInfo: categories.incompleteInfo || 0,
        unsupportedDocument: categories.unsupportedDocument || 0,
        other: categories.other || 0,
      },
      detailedReasons: detailedReasons.map((r: typeof detailedReasons[number]) => ({
        verificationId: r.verificationId,
        type: r.type || "Unknown",
        reason: r.reason || "Unknown reason",
        completedAt: r.completedAt || new Date().toISOString(),
      })),
    });
  } catch (err) {
    console.error("[GET /api/client/verifications/declined-reasons]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
