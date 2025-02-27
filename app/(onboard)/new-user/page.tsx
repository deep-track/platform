import { addNewUser, findUserById } from "@/actions/auth-actions";
import { TypographyMuted } from "@/components/ui/typography";
import { currentUser } from "@clerk/nextjs/server";
import { Loader } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

export default async function NewUser() {
	const clerkUser = await currentUser();
	if (!clerkUser) redirect("/sign-in");

	const user = await findUserById(clerkUser.id);
	

	if (!user) {
		await addNewUser(
			clerkUser.publicMetadata.role as "user" | "admin",
			clerkUser.publicMetadata.companyId as string,
		);
		redirect("/dashboard");
	} else {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center gap-8">
			<Loader className="size-32 animate-spin text-muted-foreground" />
			<TypographyMuted className="animate-bounce text-lg">
				Checking Access Levels
			</TypographyMuted>
		</div>
	);
}
