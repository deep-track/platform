import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// GET /api/kyc — list records (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const where = status ? { status } : {};

    const [records, total] = await Promise.all([
      prisma.kYCRecord.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.kYCRecord.count({ where }),
    ]);

    return NextResponse.json({ status: 200, data: { records, total } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/kyc] FULL ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/kyc — create KYC record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Try Auth0 session first, fall back to userId in body
    let externalId: string | null = null;

    try {
      const auth = await getAuth();
      externalId = auth?.user?.sub ?? null;
    } catch {
      externalId = null;
    }

    // Fall back to userId sent in body from server action
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

    // Auto-create user if they exist in Auth0 but not DB yet
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

    const orgId =
      user.headOf?.id ?? user.memberships[0]?.organizationId ?? null;

    const record = await prisma.kYCRecord.create({
      data: {
        reference: body.reference,
        userId: user.id,
        organizationId: orgId,
        status: body.status ?? "processing",
        personalInfo: body.personalInfo,
        documentType: body.documentType,
        documentFrontUrl: body.documentFrontUrl,
        documentBackUrl: body.documentBackUrl,
        selfieUrl: body.selfieUrl,
        shuftiEventType: body.shuftiEventType,
        shuftiVerificationUrl: body.shuftiVerificationUrl,
        invitationToken: body.invitationToken,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ status: 200, data: record });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/kyc] FULL ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
