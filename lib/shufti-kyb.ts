import crypto from "node:crypto";
import type { DocumentType, Position, UploadedDocument } from "./kyb-types";
import { mapShuftiErrorToUserMessage } from "./shufti-errors";

const SHUFTI_API_URL = "https://api.shuftipro.com/";

export type ShuftiKYBRequest = {
	reference: string;
	callback_url: string;
	country: string;
	language: string;
	email: string;
	verification_mode: "image_only" | "video" | "any";
	kyb: {
		company_name: string;
		companyRegistrationNumber: string;
		country_names: string[];
		document: {
			proof: string;
			additional_proof?: string;
			supported_types: DocumentType[];
		};
		ubos: Array<{
			name: {
				first_name: string;
				last_name: string;
			};
			dob: string;
			email: string;
			position: string;
			shareholding?: string;
		}>;
	};
};

export type ShuftiKYBResponse = {
	reference: string;
	event:
		| "request.received"
		| "request.pending"
		| "verification.accepted"
		| "verification.declined"
		| "error"
		| string;
	error?: {
		service: string;
		key: string;
		message: string | Record<string, string[]>;
	};
	verification_url?: string;
	token?: string;
};

function getAuthHeader(): string {
	const clientId = process.env.SHUFTI_CLIENT_ID;
	const secretKey = process.env.SHUFTI_SECRET_KEY;

	if (!clientId || !secretKey) {
		throw new Error("Missing SHUFTI configuration. Please contact support.");
	}

	const credentials = Buffer.from(`${clientId}:${secretKey}`).toString(
		"base64",
	);
	return `Basic ${credentials}`;
}

export async function createShuftiKYBVerification(
	request: ShuftiKYBRequest,
): Promise<ShuftiKYBResponse> {
	const response = await fetch(SHUFTI_API_URL, {
		method: "POST",
		headers: {
			Authorization: getAuthHeader(),
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const text = await response.text();
		const userMessage = mapShuftiErrorToUserMessage(text);
		throw new Error(userMessage);
	}

	return response.json() as Promise<ShuftiKYBResponse>;
}

export async function getShuftiKYBStatus(
	reference: string,
): Promise<ShuftiKYBResponse> {
	const response = await fetch(`${SHUFTI_API_URL}status`, {
		method: "POST",
		headers: {
			Authorization: getAuthHeader(),
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({ reference }),
	});

	if (!response.ok) {
		const text = await response.text();
		const userMessage = mapShuftiErrorToUserMessage(text);
		throw new Error(userMessage);
	}

	return response.json() as Promise<ShuftiKYBResponse>;
}

export function buildShuftiKYBRequest(params: {
	reference: string;
	email: string;
	businessName: string;
	registrationNumber: string;
	country: string;
	documents: UploadedDocument[];
	ubos: Array<{
		firstName: string;
		lastName: string;
		dateOfBirth: string;
		email: string;
		position: Position;
		shareholding?: string;
	}>;
}): ShuftiKYBRequest {
	const appUrl =
		process.env.APP_BASE_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		"https://deeptrack-platform.onrender.com";

	const stripPrefix = (b64: string) =>
		b64.includes(",") ? b64.split(",")[1] : b64;

	const sortedDocs = [...params.documents].sort((a, b) =>
		a.type.localeCompare(b.type),
	);

	const proofDoc = sortedDocs[0];
	const additionalProofDoc = sortedDocs[1];

	const supportedTypes: DocumentType[] = params.documents.map(
		(doc) => doc.type,
	);

	return {
		reference: params.reference,
		callback_url: `${appUrl}/api/webhooks/shufti`,
		country: params.country.toUpperCase().slice(0, 2),
		language: "EN",
		email: params.email,
		verification_mode: "image_only",
		kyb: {
			company_name: params.businessName,
			companyRegistrationNumber: params.registrationNumber,
			country_names: [params.country.toLowerCase()],
			document: {
				proof: stripPrefix(proofDoc?.base64 || ""),
				additional_proof: additionalProofDoc
					? stripPrefix(additionalProofDoc.base64)
					: undefined,
				supported_types: supportedTypes,
			},
			ubos: params.ubos.map((ubo) => ({
				name: {
					first_name: ubo.firstName,
					last_name: ubo.lastName,
				},
				dob: ubo.dateOfBirth,
				email: ubo.email,
				position: ubo.position,
				shareholding: ubo.shareholding || undefined,
			})),
		},
	};
}

export function mapShuftiEventToKYBStatus(event: string): string {
	switch (event) {
		case "verification.accepted":
			return "approved";
		case "verification.declined":
			return "declined";
		case "review.pending":
			return "requires_review";
		case "review.accepted":
			return "approved";
		case "review.declined":
			return "declined";
		case "request.received":
		case "request.pending":
			return "processing";
		case "request.timeout":
		case "request.deleted":
			return "expired";
		default:
			return "processing";
	}
}
