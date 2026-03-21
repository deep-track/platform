import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { randomBytes } from "crypto";

// GET /api/api-keys — list keys for current user
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { externalId: auth.userId },
    });

    if (!user) {
      return NextResponse.json({ data: [] });
    }

    const keys = await prisma.aPIKey.findMany({
      where: { userId: user.id, revoked: false },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ status: 200, data: keys });
  } catch (err) {
    console.error("[GET /api/api-keys]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/api-keys — create new key
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    const user = await prisma.user.findUnique({
      where: { externalId: auth.userId },
      include: { headOf: true, memberships: { include: { organization: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const org = user.headOf ?? user.memberships[0]?.organization ?? null;
    if (!org) {
      return NextResponse.json(
        { error: "User has no organization" },
        { status: 400 }
      );
    }

    const key = await prisma.aPIKey.create({
      data: {
        name: name ?? "API Key",
        key: `dt_${randomBytes(32).toString("hex")}`,
        userId: user.id,
        organizationId: org.id,
      },
    });

    return NextResponse.json({ status: 200, data: key });
  } catch (err) {
    console.error("[POST /api/api-keys]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
