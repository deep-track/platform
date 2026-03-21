import { addNewUser, findUser } from "@/actions/auth-actions";
import { getOrganizationByUser } from "@/actions/organization";
import { getCurrentUser } from "@/lib/auth";
import CreateOrganization from "@/modules/organization/create-organization";
import { redirect } from "next/navigation";
import React from "react";

export default async function NewOrg() {
	const user = await getCurrentUser();
	if (!user) return redirect("/auth/login");

	if (user.role !== "head") redirect("/new-user");

	const dbUser = await findUser(user.id);
	if (!dbUser) {
		const addResult = await addNewUser({
			userId: user.id,
			email: user.email,
			fullName: user.fullName,
			role: user.role,
		});

		if (!addResult.success) {
			console.warn(`new-org addNewUser skipped: ${addResult.error ?? "unknown error"}`);
		}
	}

	const { org } = await getOrganizationByUser(user.id);

	if (org) redirect("/dashboard");

	return (
		<div className="min-h-screen w-full flex items-center justify-center">
			<CreateOrganization userId={user.id} />
		</div>
	);
}
