import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// POST /api/users — create or upsert user after Auth0 login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { externalId, email, fullName, role } = body;

    if (!externalId || !email) {
      return NextResponse.json(
        { error: "externalId and email are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { externalId },
      update: { email, fullName, role: role ?? "user" },
      create: { externalId, email, fullName, role: role ?? "user" },
    });

    return NextResponse.json({ status: 200, data: user });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/users] FULL ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
