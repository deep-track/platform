import type { DocumentType, Position } from "@/lib/kyb-types";
import {
	buildShuftiKYBRequest,
	createShuftiKYBVerification,
} from "@/lib/shufti-kyb";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const kybSubmitSchema = z.object({
	businessName: z.string().min(1),
	registrationNumber: z.string().min(1),
	country: z.string().min(1),
	documents: z.array(
		z.object({
			type: z.string(),
			fileName: z.string(),
			mimeType: z.string(),
			base64: z.string(),
		}),
	),
	ubos: z.array(
		z.object({
			firstName: z.string(),
			lastName: z.string(),
			dateOfBirth: z.string(),
			email: z.string().email(),
			position: z.string(),
			shareholding: z.string().optional(),
		}),
	),
	userId: z.string().optional(),
	organizationId: z.string().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const { PrismaClient } = await import("@prisma/client");
		const prisma = new PrismaClient();

		const body = await req.json();
		const data = kybSubmitSchema.parse(body);

		const reference = `KYB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

		const shuftiRequest = buildShuftiKYBRequest({
			reference,
			email: data.ubos[0]?.email || "verification@deeptrack.io",
			businessName: data.businessName,
			registrationNumber: data.registrationNumber,
			country: data.country,
			documents: data.documents.map((doc) => ({
				type: doc.type as DocumentType,
				fileName: doc.fileName,
				mimeType: doc.mimeType,
				base64: doc.base64,
			})),
			ubos: data.ubos.map((ubo) => ({
				firstName: ubo.firstName,
				lastName: ubo.lastName,
				dateOfBirth: ubo.dateOfBirth,
				email: ubo.email,
				position: ubo.position as Position,
				shareholding: ubo.shareholding,
			})),
		});

		const shuftiResponse = await createShuftiKYBVerification(shuftiRequest);

		const createData: any = {
			reference,
			status: "processing",
			submittedAt: new Date(),
			shuftiReference: shuftiResponse.reference,
		};

		if (data.userId) createData.userId = data.userId;
		if (data.organizationId) createData.organizationId = data.organizationId;
		if (data.businessName) createData.businessName = data.businessName;
		if (data.registrationNumber) createData.registrationNumber = data.registrationNumber;
		if (data.country) createData.country = data.country;
		if (data.documents) createData.documentsData = JSON.stringify(data.documents);
		if (data.ubos) createData.ubosData = JSON.stringify(data.ubos);

		const kybRecord = await prisma.kYBRecord.create({
			data: createData,
		});

		await prisma.kYBPerson.createMany({
			data: data.ubos.map((ubo) => ({
				kybId: kybRecord.id,
				firstName: ubo.firstName,
				lastName: ubo.lastName,
				dateOfBirth: new Date(ubo.dateOfBirth),
				email: ubo.email,
				position: ubo.position,
				shareholding: ubo.shareholding || null,
			})),
		});

		return NextResponse.json({
			success: true,
			reference,
			status: "processing",
			kybId: kybRecord.id,
		});
	} catch (error) {
		console.error("[KYB Submit] Error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid request data. Please check your input.",
				},
				{ status: 400 },
			);
		}

		if (error instanceof Error) {
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: "An unexpected error occurred. Please try again.",
			},
			{ status: 500 },
		);
	}
}
