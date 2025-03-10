"use client";

import { CompanyMember } from "@/actions/organization";
import { Badge } from "@/components/ui/badge";
import { TypographyInlineCode } from "@/components/ui/typography";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

export const membersColumns: ColumnDef<CompanyMember>[] = [
	{
		accessorKey: "fullName",
		header: "Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			return (
				<Badge variant="outline" className="capitalize">
					{row.getValue("role")}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Date Joined",
		cell: ({ row }) => {
			return (
				<TypographyInlineCode className="w-fit font-sans capitalize">
					{formatDistanceToNow(new Date(row.original.createdAt), {
						addSuffix: true,
					})}
				</TypographyInlineCode>
			);
		},
	},
];
