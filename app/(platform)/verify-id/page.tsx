import { getActiveAPIKey } from "@/actions/api-keys";
import { findUserById } from "@/actions/auth-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { Link } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { VscWorkspaceUntrusted } from "react-icons/vsc";
import VerifyIdentityForm from "../_components/verifications/verify-id-form";

export default async function page() {
	const clerkUser = await currentUser();
	if (!clerkUser) return redirect("/sign-in");
	const user = await findUserById(clerkUser.id);
	if (!user || !user?.companyId) redirect("/new-user");
	const apiKey = await getActiveAPIKey(clerkUser.id, user?.companyId);
	return (
		<div>
			{apiKey ? (
				<VerifyIdentityForm apiKey={apiKey} />
			) : (
				<div className="flex flex-col gap-4">
					<Alert variant="destructive">
						<VscWorkspaceUntrusted className="size-6" />
						<AlertTitle>API Key</AlertTitle>
						<AlertDescription>
							Create an API key to use the AML check feature. The Key is used
							for authentication in the API requests and billing. Ensure you
							have an active API Key
						</AlertDescription>
					</Alert>

					<Button size="lg" variant="outline" asChild>
						<Link href="/api-keys">Create API Key</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
