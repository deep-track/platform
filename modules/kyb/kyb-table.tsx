"use client";

import type { KYBRecord } from "@/actions/kyb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type KYBStatus, KYBStatusBadge } from "@/modules/kyb/kyb-status-badge";
import { format } from "date-fns";
import {
	ArrowUpDown,
	Building2,
	ChevronLeft,
	ChevronRight,
	Eye,
	Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface KYBTableProps {
	records: KYBRecord[];
	isLoading?: boolean;
}

const STATUS_OPTIONS: { value: KYBStatus | "all"; label: string }[] = [
	{ value: "all", label: "All statuses" },
	{ value: "pending", label: "Pending" },
	{ value: "processing", label: "Processing" },
	{ value: "approved", label: "Approved" },
	{ value: "declined", label: "Declined" },
	{ value: "requires_review", label: "Needs Review" },
	{ value: "expired", label: "Expired" },
];

export function KYBTable({ records, isLoading }: KYBTableProps) {
	const router = useRouter();
	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const filteredData = records.filter((r) => {
		if (statusFilter !== "all" && r.status !== statusFilter) return false;
		if (globalFilter) {
			const q = globalFilter.toLowerCase();
			return (
				r.businessName?.toLowerCase().includes(q) ||
				r.reference?.toLowerCase().includes(q) ||
				r.country?.toLowerCase().includes(q)
			);
		}
		return true;
	});

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
					<Input
						placeholder="Search by business name, reference..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						{STATUS_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-lg border bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[40px]">#</TableHead>
							<TableHead>
								<button className="flex items-center gap-1 hover:text-foreground">
									Business Name
									<ArrowUpDown className="h-3 w-3" />
								</button>
							</TableHead>
							<TableHead>Reference</TableHead>
							<TableHead>Country</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>
								<button className="flex items-center gap-1 hover:text-foreground">
									Date
									<ArrowUpDown className="h-3 w-3" />
								</button>
							</TableHead>
							<TableHead className="w-[80px]">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-8">
									Loading...
								</TableCell>
							</TableRow>
						) : filteredData.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-8">
									<div className="flex flex-col items-center gap-2">
										<Building2 className="h-8 w-8 text-gray-300" />
										<p className="text-sm text-gray-500">
											No KYB records found
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							filteredData.map((record, index) => (
								<TableRow key={record.id}>
									<TableCell className="font-medium text-gray-400">
										{index + 1}
									</TableCell>
									<TableCell className="font-medium">
										{record.businessName || "-"}
									</TableCell>
									<TableCell>
										<code className="text-xs bg-gray-100 px-2 py-1 rounded">
											{record.reference}
										</code>
									</TableCell>
									<TableCell>{record.country || "-"}</TableCell>
									<TableCell>
										<KYBStatusBadge
											status={record.status as KYBStatus}
											size="sm"
										/>
									</TableCell>
									<TableCell className="text-sm text-gray-500">
										{record.createdAt
											? format(new Date(record.createdAt), "MMM d, yyyy")
											: "-"}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => router.push(`/kyb/${record.id}`)}
										>
											<Eye className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{filteredData.length > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-gray-500">
						Showing {filteredData.length} of {records.length} records
					</p>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" disabled>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-sm">Page 1</span>
						<Button variant="outline" size="sm" disabled>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
