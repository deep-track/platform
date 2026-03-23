import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, investorName } = body;

    const invitation = await prisma.kYIInvitation.create({
      data: {
        email,
        investorName,
        invitedBy: auth.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ status: 200, data: invitation });
  } catch (err) {
    console.error("[POST /api/kyi/invitations]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
