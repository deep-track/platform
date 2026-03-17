import { addNewUser, findUserById } from "@/actions/auth-actions";
import { findCompanyAction } from "@/actions/organization";
import { getCurrentUser } from "@/lib/auth";
import CreateOrganization from "@/modules/organization/create-organization";
import { redirect } from "next/navigation";
import React from "react";

export default async function NewOrg() {
	const user = await getCurrentUser();
	if (!user) return redirect("/auth/login");

	if (user.role !== "head") redirect("/new-user");

	const dbUser = await findUserById(user.id);
	if (!dbUser) {
		await addNewUser(
			user.role,
			user.fullName,
			user.companyId,
		);
	}

	const company = await findCompanyAction(user.id);

	if (company) redirect("/dashboard");

	return (
		<div className="min-h-screen w-full flex items-center justify-center">
			<CreateOrganization userId={user.id} />
		</div>
	);
}
