import { getClientSession } from "@/lib/client-auth";
import prisma from "@/lib/prisma";
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
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    let fromDate = new Date();
    let toDate = new Date();

    if (timeRange === "today") {
      fromDate.setHours(0, 0, 0, 0);
    } else if (timeRange === "7d") {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (timeRange === "30d") {
      fromDate.setDate(fromDate.getDate() - 30);
    } else if (timeRange === "custom") {
      if (dateFrom) fromDate = new Date(dateFrom);
      if (dateTo) toDate = new Date(dateTo);
    }

    const where = {
      orgId: session.orgId,
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    };

    const [
      started,
      approved,
      rejected,
      pendingReview,
      escalated,
      expired,
    ] = await Promise.all([
      prisma.verification.count({
        where: { ...where, status: "STARTED" },
      }),
      prisma.verification.count({
        where: { ...where, status: "APPROVED" },
      }),
      prisma.verification.count({
        where: { ...where, status: "REJECTED" },
      }),
      prisma.verification.count({
        where: { ...where, status: "PENDING_REVIEW" },
      }),
      prisma.verification.count({
        where: { ...where, status: "ESCALATED" },
      }),
      prisma.verification.count({
        where: { ...where, status: "EXPIRED" },
      }),
    ]);

    const total = started + approved + rejected + pendingReview + escalated + expired;
    const completed = approved + rejected;
    const conversionRate = total > 0 ? (completed / total) * 100 : 0;
    const manualReviewRate = total > 0 ? (pendingReview / total) * 100 : 0;

    // Calculate avg completion time for completed verifications
    const completedVerifications = await prisma.verification.findMany({
      where: {
        ...where,
        status: { in: ["APPROVED", "REJECTED"] },
      },
      select: { createdAt: true, completedAt: true },
    });

    let avgCompletionTimeMs = 0;
    if (completedVerifications.length > 0) {
      const totalTime = completedVerifications.reduce((sum: number, v: typeof completedVerifications[number]) => {
        if (!v.completedAt) return sum;
        return sum + (v.completedAt.getTime() - v.createdAt.getTime());
      }, 0);
      avgCompletionTimeMs = Math.round(totalTime / completedVerifications.length);
    }

    // Type breakdown
    const byType = {
      KYC: await prisma.verification.count({
        where: { ...where, type: "KYC" },
      }),
      KYB: await prisma.verification.count({
        where: { ...where, type: "KYB" },
      }),
      KYI: await prisma.verification.count({
        where: { ...where, type: "KYI" },
      }),
    };

    // Recent events
    const recentEvents = await prisma.telemetryEvent.findMany({
      where: { orgId: session.orgId },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    return NextResponse.json({
      started: started || 0,
      completed: completed || 0,
      approved: approved || 0,
      rejected: rejected || 0,
      pendingReview: pendingReview || 0,
      escalated: escalated || 0,
      expired: expired || 0,
      conversionRate: isFinite(conversionRate) ? parseFloat(conversionRate.toFixed(1)) : 0,
      manualReviewRate: isFinite(manualReviewRate) ? parseFloat(manualReviewRate.toFixed(1)) : 0,
      avgCompletionTimeMs: avgCompletionTimeMs || 0,
      byType,
      recentEvents: recentEvents.map((event: typeof recentEvents[number]) => ({
        eventType: event.eventType || "Unknown Event",
        timestamp: event.timestamp.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[GET /api/client/verifications/stats]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
