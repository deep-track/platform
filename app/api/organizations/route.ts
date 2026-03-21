import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// POST /api/organizations — create organization
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, domain, headExternalId } = body;

    const head = await prisma.user.findUnique({
      where: { externalId: headExternalId ?? auth.userId },
    });

    if (!head) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const org = await prisma.organization.create({
      data: {
        name,
        email,
        phone,
        domain,
        headId: head.id,
        members: {
          create: { userId: head.id, role: "head" },
        },
      },
      include: { members: { include: { user: true } } },
    });

    return NextResponse.json({ status: 200, data: org });
  } catch (err) {
    console.error("[POST /api/organizations]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
