import React from "react";

import { CompanyMember } from "@/actions/organization";
import { DataTable } from "@/components/ui/data-table";
import { membersColumns } from "./members-columns";

type Props = {
	data: CompanyMember[];
};

function MembersTable({ data }: Props) {
	return (
		<div>
			<DataTable columns={membersColumns} data={data} tableTitle="Members" />
		</div>
	);
}

export default MembersTable;