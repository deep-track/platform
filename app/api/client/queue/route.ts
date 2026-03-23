import { getClientSession, ROLES, requireRoles } from "@/lib/client-auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (
      !session ||
      !requireRoles(session, ROLES.CAN_REVIEW)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const sortBy = searchParams.get("sortBy") ?? "oldest";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const orderBy =
      sortBy === "score"
        ? { sentinelScore: "asc" as const }
        : { createdAt: "asc" as const };

    const [cases, total] = await Promise.all([
      prisma.verification.findMany({
        where: {
          orgId: session.orgId,
          status: "PENDING_REVIEW",
        },
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.verification.count({
        where: {
          orgId: session.orgId,
          status: "PENDING_REVIEW",
        },
      }),
    ]);

    // Calculate SLA status for each case
    const casesWithSLA = cases.map((c) => {
      const ageMs = Date.now() - c.createdAt.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);

      let slaStatus: "ok" | "warning" | "breach";
      if (ageHours < 1) slaStatus = "ok";
      else if (ageHours < 2) slaStatus = "warning";
      else slaStatus = "breach";

      return {
        ...c,
        ageMs,
        slaStatus,
      };
    });

    return NextResponse.json({
      cases: casesWithSLA,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("[GET /api/client/queue]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
