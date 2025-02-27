"use client";

import { CompanyMember } from "@/actions/organization";
import { ColumnDef } from "@tanstack/react-table";

export const membersColumns: ColumnDef<CompanyMember>[] = [
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			return row.getValue("role") === "admin" ? "Admin" : "User";
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => {
			return new Date(row.original.createdAt).toLocaleDateString("en-US", {
				dateStyle: "medium",
			});
		},
	},
];
