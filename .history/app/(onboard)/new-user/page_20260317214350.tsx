import { addNewUser, findUserById } from "@/actions/auth-actions";
import { TypographyMuted } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth";
import { Loader } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

export default async function NewUser() {
	// First, check if user is authenticated
	const authUser = await getCurrentUser();
	if (!authUser) {
		redirect("/auth/login");
	}

	// Then check if user exists in our database
	const user = await findUserById(authUser.id);
	
	// If user doesn't exist, create them first
	if (!user) {
		try {
			await addNewUser(
				authUser.role,
				authUser.fullName,
				authUser.companyId,
			);
		} catch (error) {
			console.error("Error adding new user:", error);
			// Still redirect to dashboard, error handling can be done there
		}
	}

	// Single redirect for both cases
	redirect("/dashboard");

	// This return statement will never be reached due to the redirect
	// but is required for TypeScript to recognize this as a valid React component
	return (
		<div className="min-h-screen flex flex-col items-center justify-center gap-8">
			<Loader className="size-32 animate-spin text-muted-foreground" />
			<TypographyMuted className="animate-bounce text-lg">
				Checking Access Levels
			</TypographyMuted>
		</div>
	);
}
