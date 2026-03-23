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
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    const where: Record<string, unknown> = { orgId: session.orgId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { subjectName: { contains: search, mode: "insensitive" } },
        { caseId: { contains: search, mode: "insensitive" } },
        { subjectRef: { contains: search, mode: "insensitive" } },
      ];
    }

    const [verifications, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.verification.count({ where }),
    ]);

    return NextResponse.json({
      verifications,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("[GET /api/client/verifications]", err);
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
    const { type, subjectRef, metadata } = body;

    if (!type || !["KYC", "KYB", "KYI"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid verification type" },
        { status: 400 }
      );
    }

    const verification = await prisma.verification.create({
      data: {
        orgId: session.orgId,
        type,
        status: "STARTED",
        subjectRef,
        metadata,
      },
    });

    return NextResponse.json({ data: verification }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/client/verifications]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
