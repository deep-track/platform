"use server";

import clerkClient from "@/lib/clerk-client";

export async function revokeInvitation(invitationId: string) {
	try {
		const response =
			await clerkClient.invitations.revokeInvitation(invitationId);
		return response.id;
	} catch (error) {
		console.error("Error revoking invitation:", error);
		throw new Error("Failed to revoke invitation. Please try again.");
	}
}

// Function to create a new invitation
export async function createInvitation(
		email: string,
		redirectUrl: string,
		role: "admin" | "user",
		companyId: string,
	) {
		try {
			await clerkClient.invitations.createInvitation({
				emailAddress: email,
				redirectUrl,
				publicMetadata: {
					role,
					companyId,
				},
				notify: true,
				ignoreExisting: true,
			});
		} catch (error) {
			console.error("Error creating invitation:", error);
			throw new Error(
				"Failed to create invitation. Please check the email or try again.",
			);
		}
	}