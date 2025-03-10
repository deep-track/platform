"use server";

import { findUserById } from "@/actions/auth-actions";

export type APIKey = {
	id: string;
	name: string;
	companyId: string;
	status: "Active" | "Suspended";
	createdAt: Date;
	updatedAt: Date;
	ownerId: string;
	apiKey: string;
};

export async function getUserApiKeys(userId: string) {
	try {
		const data = await findUserById(userId);
		if (!data) throw new Error("User not found or invalid response");
		const companyId = data.companyId;

		const response = await fetch(
			`${process.env.DEEPTRACK_BACKEND_URL}/v1/users/api-keys/${userId}/${companyId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) throw new Error("Failed to fetch API keys");
		const keys: APIKey[] = await response.json();
		return keys;
	} catch (error) {
		console.error("API Error:", error);
		throw new Error("Failed to fetch API keys");
	}
}

export async function createApiKey(
	userId: string,
	name: string,
	companyId: string,
) {
	try {
		const response = await fetch(
			`${process.env.DEEPTRACK_BACKEND_URL}/v1/users/api-keys/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, companyId, userId }),
			},
		);

		if (!response.ok) throw new Error("Failed to create API key");
		const key: APIKey = await response.json();
		return key;
	} catch (error) {
		console.error("API Error:", error);
		throw new Error("Failed to create API key");
	}
}

export async function revokeApiKey(
	apiKeyId: string,
	userId: string,
	companyId: string,
) {
	try {
		const response = await fetch(
			// the apiKeyId is embedded directly in the URL.
			`${process.env.DEEPTRACK_BACKEND_URL}/v1/users/api-keys/${apiKeyId}/revoke`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: userId,
					companyId: companyId,
				}),
			},
		);

		if (!response.ok) throw new Error("Failed to revoke API key");

		return true;
	} catch (error: unknown) {
		console.error("API Error:", error);
		throw new Error("Failed to revoke API key");
	}
}