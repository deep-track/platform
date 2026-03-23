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

    const org = await prisma.clientOrganization.findUnique({
      where: { id: session.orgId },
      select: {
        plan: true,
        scanCredits: true,
        scanCreditsUsed: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const percentUsed = org.scanCredits > 0 
      ? (org.scanCreditsUsed / org.scanCredits) * 100 
      : 0;

    return NextResponse.json({
      plan: org.plan,
      scanCredits: org.scanCredits,
      scanCreditsUsed: org.scanCreditsUsed,
      percentUsed: parseFloat(percentUsed.toFixed(1)),
      billingHistory: [], // Placeholder
    });
  } catch (err) {
    console.error("[GET /api/client/billing]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
