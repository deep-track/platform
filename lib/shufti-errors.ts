export function mapShuftiErrorToUserMessage(error: string): string {
	if (
		error.includes("Account is not active") ||
		error.includes("request.unauthorized")
	) {
		return "Verification service is temporarily unavailable. Please try again later.";
	}

	if (error.includes("401") || error.includes("403")) {
		return "Unable to process verification. Please contact support.";
	}

	if (error.includes("500") || error.includes("502") || error.includes("503")) {
		return "Verification service is experiencing issues. Please try again later.";
	}

	if (error.includes("Missing SHUFTI")) {
		return "System configuration error. Please contact support.";
	}

	if (
		error.includes("timeout") ||
		error.includes("network") ||
		error.includes("fetch")
	) {
		return "Unable to connect to verification service. Please check your connection and try again.";
	}

	return "An error occurred while processing your verification.";
}

export function mapDatabaseErrorToUserMessage(error: string): string {
	if (error.includes("connection") || error.includes("ECONNREFUSED")) {
		return "Unable to connect to database. Please try again later.";
	}

	if (error.includes("timeout") || error.includes("TIMEOUT")) {
		return "Request timed out. Please try again.";
	}

	return "A database error occurred. Please try again.";
}
