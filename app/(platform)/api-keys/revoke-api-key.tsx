"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiMiniArchiveBoxArrowDown } from "react-icons/hi2";
import { toast } from "sonner";

import { revokeApiKey } from "@/actions/api-keys";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
	keyId: string;
	userId: string;
	companyId: string;
};

export default function RevokeApiKey({ keyId, userId, companyId }: Props) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);

	const handleRevoke = async () => {
		setLoading(true);
		try {
			await revokeApiKey(keyId, userId, companyId);
			toast.success("API key revoked successfully");
			router.refresh();
		} catch (error) {
			toast.error("Failed to revoke API key");
		} finally {
			setLoading(false);
			setOpen(false); // Close the dialog after the operation is complete
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button size="icon" variant="destructive" className="rounded-full">
					<HiMiniArchiveBoxArrowDown className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to revoke this API key? This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							variant="destructive"
							onClick={() => handleRevoke()}
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Revoking...
								</>
							) : (
								"Revoke"
							)}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

