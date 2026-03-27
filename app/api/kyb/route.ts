import { getAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status");
		const page = Number.parseInt(searchParams.get("page") ?? "1");
		const limit = Number.parseInt(searchParams.get("limit") ?? "20");
		const requestedUserId = searchParams.get("userId");

		let externalId: string | null = null;
		let userRole = "user";

		try {
			const auth = await getAuth();
			externalId = auth?.userId ?? null;
		} catch {
			externalId = null;
		}

		if (!externalId) {
			externalId = requestedUserId ?? null;
		}

		if (!externalId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { externalId },
		});

		if (!user) {
			return NextResponse.json({
				status: 200,
				data: { records: [], total: 0 },
			});
		}

		userRole = user.role;
		const isAdmin = userRole === "admin" || userRole === "head";

		const where = {
			...(status ? { status } : {}),
			...(!isAdmin ? { userId: user.id } : {}),
		};

		const [records, total] = await Promise.all([
			prisma.kYBRecord.findMany({
				where,
				include: { ubos: true, documents: true },
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.kYBRecord.count({ where }),
		]);

		return NextResponse.json({ status: 200, data: { records, total } });
	} catch (err) {
		console.error("[GET /api/kyb]", err);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
