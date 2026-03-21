import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/organizations/:userId — get org by user externalId
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { externalId: userId },
      include: {
        headOf: {
          include: {
            members: { include: { user: true } },
          },
        },
        memberships: {
          include: {
            organization: {
              include: { members: { include: { user: true } } },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const org = user.headOf ?? user.memberships[0]?.organization ?? null;
    const isHead = !!user.headOf;

    return NextResponse.json({ status: 200, data: { org, isHead } });
  } catch (err) {
    console.error("[GET /api/organizations/:userId]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
