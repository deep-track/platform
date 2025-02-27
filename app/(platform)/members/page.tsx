import {
	getCompanyAction,
	getCompanyMembersAction,
} from "@/actions/organization";
import EmptyState from "@/components/empty-state";
import CreateOrganizationDialog from "@/modules/organization/create-organization-form";
import InviteStaffDialog from "@/modules/organization/invite-new-staff";
import MembersTable from "@/modules/organization/tables/members-table";
import React from "react";

export default async function MembersPage() {
	const company = await getCompanyAction();
	const members = await getCompanyMembersAction();
	console.log(members);
	return (
		<div className="p-4 min-h-[calc(100vh-2.75rem)] h-full">
			{!company.data ? (
				<div className="flex flex-col h-full items-center justify-center space-y-4">
					<EmptyState
						iconSize="size-36"
						emptyText="No organization created yet. Create an organization to add members and manage resources"
					/>
					<CreateOrganizationDialog />
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex items-center justify-end">
						<InviteStaffDialog companyId={company.data.id} />
					</div>
					<MembersTable data={members} />
				</div>
			)}
		</div>
	);
}
