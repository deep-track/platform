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
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { orgId: session.orgId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.report.count({ where: { orgId: session.orgId } }),
    ]);

    return NextResponse.json({
      data: reports,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("[GET /api/client/reports]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, format, filters } = body;

    const validTypes = [
      "verification_summary",
      "manual_review_log",
      "rejection_analysis",
      "sentinel_performance",
      "api_usage",
      "audit_extract",
    ];

    const validFormats = ["csv", "pdf", "json"];

    if (!validTypes.includes(type) || !validFormats.includes(format)) {
      return NextResponse.json(
        { error: "Invalid report type or format" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        orgId: session.orgId,
        type,
        format,
        filters,
        generatedBy: session.userId,
        status: "pending",
      },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/client/reports]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
