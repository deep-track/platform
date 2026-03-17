"use server";

export async function revokeInvitation(invitationId: string) {
	void invitationId;
	throw new Error(
		"Invitation revocation is not configured for Auth0 yet. Set up Auth0 Organizations Management API integration first.",
	);
}

// Function to create a new invitation
export async function createInvitation(
		email: string,
		redirectUrl: string,
		role: "admin" | "user",
		companyId: string,
	) {
		void email;
		void redirectUrl;
		void role;
		void companyId;
		throw new Error(
			"Invitation flow now requires Auth0 Organizations setup. Configure Management API credentials and organization mapping first.",
		);
	}