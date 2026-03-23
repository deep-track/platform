import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const requestedUserId = searchParams.get("userId");

    let externalId: string | null = null;
    let userRole: string = "user";

    try {
      const auth = await getAuth();
      externalId = auth?.userId ?? null;
    } catch {
      externalId = null;
    }

    if (!externalId) {
      externalId = requestedUserId ?? null;
    }

    if (!externalId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { externalId },
    });

    if (!user) {
      return NextResponse.json({ status: 200, data: { records: [], total: 0 } });
    }

    userRole = user.role;
    const isAdmin = userRole === "admin" || userRole === "head";

    const where = {
      ...(status ? { status } : {}),
      ...(!isAdmin ? { userId: user.id } : {}),
    };

    const [records, total] = await Promise.all([
      prisma.kYIRecord.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.kYIRecord.count({ where }),
    ]);

    return NextResponse.json({ status: 200, data: { records, total } });
  } catch (err) {
    console.error("[GET /api/kyi]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let externalId: string | null = null;
    try {
      const auth = await getAuth();
      externalId = auth?.userId ?? null;
    } catch {
      externalId = null;
    }

    if (!externalId) {
      externalId = body.userId ?? null;
    }

    if (!externalId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { externalId },
      include: { headOf: true, memberships: true },
    });

    if (!user && body.userEmail) {
      user = await prisma.user.create({
        data: {
          externalId,
          email: body.userEmail,
          fullName: body.userName ?? "",
          role: "user",
        },
        include: { headOf: true, memberships: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orgId = user.headOf?.id ?? user.memberships[0]?.organizationId ?? null;

    const record = await prisma.kYIRecord.create({
      data: {
        reference: body.reference,
        userId: user.id,
        organizationId: orgId,
        status: body.status ?? "processing",
        institutionInfo: body.institutionInfo,
        representative: body.representative,
        documents: body.documents,
        shuftiEventType: body.shuftiEventType,
        shuftiVerificationUrl: body.shuftiVerificationUrl,
        invitationToken: body.invitationToken,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ status: 200, data: record });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/kyi]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
