"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// userId: varchar("user_id").notNull().unique(),
// email: varchar("email").notNull().unique(),
// role: staffRole("role").default("user").notNull(),

export type BackendUser = {
	id: string;
	email: string;
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

export async function addNewUser(role: string, companyId?: string) {
	const clerkUser = await currentUser();
	if (!clerkUser) return redirect("/sign-in");

	const { id, emailAddresses } = clerkUser;

	try {
		const response = await fetch(
			`${process.env.DEEPTRACK_BACKEND_URL}/v1/users/add`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: id,
					email: emailAddresses[0].emailAddress,
					role,
					companyId,
				}),
			},
		);

		const data = (await response.json()) as ResponseBody;
		if (data.status !== 200) throw new Error(data.message);

		return data;
	} catch (error) {
		console.error("Error adding user:", error);
		return { status: 500, message: "Internal Server Error" };
	}
}

export async function findUserById(userId: string) {
	const response = await fetch(
		`${process.env.DEEPTRACK_BACKEND_URL}/v1/users/find-by-clerk/${userId}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	const data = (await response.json()) as ResponseBody;
	if (data.status !== 200) {
		throw new Error(data.message);
	}

	return data.data;
}