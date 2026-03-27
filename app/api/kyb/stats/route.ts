import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const [total, approved, declined, pending, processing, requires_review] =
			await Promise.all([
				prisma.kYBRecord.count(),
				prisma.kYBRecord.count({ where: { status: "approved" } }),
				prisma.kYBRecord.count({ where: { status: "declined" } }),
				prisma.kYBRecord.count({ where: { status: "pending" } }),
				prisma.kYBRecord.count({ where: { status: "processing" } }),
				prisma.kYBRecord.count({ where: { status: "requires_review" } }),
			]);

		return NextResponse.json({
			status: 200,
			data: { total, approved, declined, pending, processing, requires_review },
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("[GET /api/kyb/stats] FULL ERROR:", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
