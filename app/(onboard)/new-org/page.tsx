import { addNewUser, findUserById } from "@/actions/auth-actions";
import { findCompanyAction } from "@/actions/organization";
import CreateOrganization from "@/modules/organization/create-organization";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function NewOrg() {
	const user = await currentUser();
	if (!user) return redirect("/sign-in");

	if (user.publicMetadata.role !== "head") redirect("/new-user");

	const dbUser = await findUserById(user.id);
	if (!dbUser) {
		await addNewUser(
			user.publicMetadata.role as "user" | "admin",
			user.fullName as string,
			user.publicMetadata.companyId as string,
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
