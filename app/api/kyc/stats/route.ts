import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [total, approved, declined, pending, processing, requires_review] =
      await Promise.all([
        prisma.kYCRecord.count(),
        prisma.kYCRecord.count({ where: { status: "approved" } }),
        prisma.kYCRecord.count({ where: { status: "declined" } }),
        prisma.kYCRecord.count({ where: { status: "pending" } }),
        prisma.kYCRecord.count({ where: { status: "processing" } }),
        prisma.kYCRecord.count({ where: { status: "requires_review" } }),
      ]);

    return NextResponse.json({
      status: 200,
      data: { total, approved, declined, pending, processing, requires_review },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/kyc/stats] FULL ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
