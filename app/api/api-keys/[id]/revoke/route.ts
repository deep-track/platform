import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// PATCH /api/api-keys/:id/revoke
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const updated = await prisma.aPIKey.update({
      where: { id },
      data: { revoked: true },
    });

    return NextResponse.json({ status: 200, data: updated });
  } catch (err) {
    console.error("[PATCH /api/api-keys/:id/revoke]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
