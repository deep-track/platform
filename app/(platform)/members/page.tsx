import {
	checkIfCompanyHeadAction,
	getCompanyAction,
	getCompanyMembersAction,
} from "@/actions/organization";
import EmptyState from "@/components/empty-state";
import CreateOrganizationDialog from "@/modules/organization/create-organization-form";
import SeatsDialog from "@/modules/organization/seats";
import MembersTable from "@/modules/organization/tables/members-table";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function MembersPage() {
	const { userId } = await getAuth();
	if (!userId) redirect("/auth/login");

	const company = await getCompanyAction(userId);
	const members = await getCompanyMembersAction(userId);
	const checkIfCompanyHead = await checkIfCompanyHeadAction(userId);
	return (
		<div className="p-4 min-h-[calc(100vh-2.75rem)] h-full">
			<div className="space-y-4">
				<div className="flex items-center justify-end">
					{checkIfCompanyHead && company && (company as any).id && (
						<SeatsDialog companyId={(company as any).id} />
					)}
				</div>
				<MembersTable data={members} />
			</div>
		</div>
	);
}
