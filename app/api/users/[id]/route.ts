import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/users/:id — find user by externalId (Auth0 sub)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { externalId: id },
      include: { headOf: true, memberships: { include: { organization: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ status: 200, data: user });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/users/:id] FULL ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
