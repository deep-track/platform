"use server";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";


export type BackendUser = {
		id: string;
		email: string;
		fullName: string;
		createdAt: Date;
		updatedAt: Date;
		companyId: string | null;
		userId: string;
		role: "user" | "admin";
	};

type ResponseBody = {
	status: number;
	data?: BackendUser;
	message: string;
};


export async function addNewUser(
	role: string,
	fullName: string,
	companyId?: string,
) {
	const authUser = await getCurrentUser();
	if (!authUser) return redirect("/auth/login");

	try {
		const response = await fetch(
			`${process.env.DEEPTRACK_BACKEND_URL}/v1/users/add`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: authUser.id,
					email: authUser.email,
					role,
					companyId,
					fullName,
				}),
			},
		);

		if (!response.ok) throw new Error("Failed to add user");

		const data = (await response.json()) as ResponseBody;

		return data;
	} catch (error) {
		console.error("Error adding user:", error);
		return { status: 500, message: "Internal Server Error" };
	}
}

export async function findUserById(userId: string) {
	const configuredPath = process.env.DEEPTRACK_USER_LOOKUP_PATH;
	const lookupPaths = [
		configuredPath,
		"find-by-auth0",
		"find-by-clerk",
		"find-by-external",
	].filter((path, index, allPaths): path is string => {
		if (!path) return false;
		return allPaths.indexOf(path) === index;
	});

	let lastStatus: number | null = null;

	for (const lookupPath of lookupPaths) {
		try {
			const response = await fetch(
				`${process.env.DEEPTRACK_BACKEND_URL}/v1/users/${lookupPath}/${encodeURIComponent(userId)}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (response.ok) {
				const data = (await response.json()) as ResponseBody;
				return data.data ?? null;
			}

			lastStatus = response.status;
			continue;
		} catch (error) {
			console.warn(`User lookup failed for path '${lookupPath}'.`, error);
			continue;
		}
	}

	if (lastStatus !== null) {
		console.warn(
			`User lookup did not resolve user for '${userId}'. Last status: ${lastStatus}.`,
		);
	}

	return null;
}