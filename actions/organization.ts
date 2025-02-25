"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface CreateCompanyProps {
	name: string;
	email: string;
	phone: string;
	companyDomain: "finance" | "media";
	companyHeadId: string;
}

export async function createCompanyAction(props: CreateCompanyProps) {
	try {
		const response = await fetch(
			`${process.env.DEEPTRACK_BACKEND_URL}/v1/companies`,
			{
				method: "POST",
				body: JSON.stringify({
					name: props.name,
					email: props.email,
					phone: props.phone,
					companyHeadId: props.companyHeadId,
					companyDomain: props.companyDomain,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		if (!response.ok) {
			return {
				status: 500,
				message: "Something went wrong. Try Again",
			};
		}
		const data = await response.json();
		return {
			status: 200,
			data,
			message: "Company Created Successfully",
		};
	} catch (error) {
		throw new Error("Failed to create company");
	}
}

export type CompanyWithMembers = {
		id: string;
		name: string;
		email: string;
		phone: string;
		companyHeadId: string;
		companyDomain: "finance" | "media";
		createdAt: string;
		updatedAt: string;
	};

export async function getCompanyAction() {
	// 'use cache'

	const { userId } = await auth();

	if (!userId) redirect("/sign-in");

	try {
		const response = await fetch(
			`${process.env.DEEPTRACK_BACKEND_URL}/v1/companies/by-head/${userId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			return {
				status: 500,
				message: "Something went wrong. Try Again",
			};
		}

		const data = await response.json();

		return {
			status: 200,
			data: data as CompanyWithMembers,
			message: "Company Created Successfully",
		};
	} catch (error) {
		throw new Error("Failed to fetch company");
	}
}