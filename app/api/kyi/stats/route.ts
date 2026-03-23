import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [total, approved, declined, pending, processing, requires_review, pepCount] =
      await Promise.all([
        prisma.kYIRecord.count(),
        prisma.kYIRecord.count({ where: { status: "approved" } }),
        prisma.kYIRecord.count({ where: { status: "declined" } }),
        prisma.kYIRecord.count({ where: { status: "pending" } }),
        prisma.kYIRecord.count({ where: { status: "processing" } }),
        prisma.kYIRecord.count({ where: { status: "requires_review" } }),
        prisma.kYIRecord.count({ where: { isPEP: true } }),
      ]);

    return NextResponse.json({
      status: 200,
      data: { total, approved, declined, pending, processing, requires_review, pepCount },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/kyi/stats] FULL ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
