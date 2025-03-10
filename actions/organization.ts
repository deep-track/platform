"use server";

import { BACKEND_URLS } from "@/lib/backend-utls";
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
		if (!response.ok) throw new Error("Failed to create company");
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

export async function findCompanyAction(userId: string) {
	try {
		const response = await fetch(
			`${process.env.DEEPTRACK_BACKEND_URL}/v1/companies/find-company/${userId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) throw new Error("Failed to fetch company");

		const data: {
			company: boolean;
		} = await response.json();

		return data.company;
	} catch (error) {
		throw new Error("Failed to fetch company");
	}
}

export async function getCompanyAction(userId: string) {
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

export interface CompanyMember {
	id: string;
	companyId: string | null;
	userId: string;
	email: string;
	fullName: string;
	role: "admin" | "user";
	createdAt: Date;
	updatedAt: Date;
}

export async function checkIfCompanyHeadAction(userId: string) {
	try {
		const response = await fetch(
			`${BACKEND_URLS["Check if Company Head"]}/${userId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) throw new Error("Failed to check company head");

		const data: {
			head: boolean;
		} = await response.json();

		return data.head;
	} catch (error) {
		throw new Error("Failed to check company head");
	}
}

export async function getCompanyMembersAction(userId: string) {
	try {
		const response = await fetch(
			`${BACKEND_URLS["Get All Company Members"]}/${userId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) throw new Error("Failed to fetch company members");

		const data: CompanyMember[] = await response.json();

		return data;
	} catch (error) {
		throw new Error("Failed to fetch company");
	}
}