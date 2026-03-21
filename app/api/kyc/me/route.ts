import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId");
    const externalUserId = requestedUserId ?? auth.userId;

    const user = await prisma.user.findUnique({
      where: { externalId: externalUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const record = await prisma.kYCRecord.findFirst({
      where: { userId: user.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ status: 200, data: record });
  } catch (err) {
    console.error("[GET /api/kyc/me]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
