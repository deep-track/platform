import { auth0 } from "@/lib/auth0";

export type AppRole = "user" | "admin" | "head";

export type AppUser = {
	id: string;
	email: string;
	fullName: string;
	role: AppRole;
	companyId?: string;
	picture?: string;
};

const ROLE_CLAIM = process.env.AUTH0_ROLE_CLAIM ?? "https://deeptrack.io/role";
const COMPANY_ID_CLAIM =
	process.env.AUTH0_COMPANY_ID_CLAIM ?? "https://deeptrack.io/companyId";

function getClaimValue(user: Record<string, unknown>, key: string) {
	return user[key];
}

function getRole(user: Record<string, unknown>): AppRole {
	const roleFromCustomClaim = getClaimValue(user, ROLE_CLAIM);

	if (typeof roleFromCustomClaim === "string") {
		if (roleFromCustomClaim === "admin" || roleFromCustomClaim === "head") {
			return roleFromCustomClaim;
		}
		return "user";
	}

	if (Array.isArray(roleFromCustomClaim)) {
		if (roleFromCustomClaim.includes("head")) return "head";
		if (roleFromCustomClaim.includes("admin")) return "admin";
	}

	const fallbackRole = getClaimValue(user, "role");
	if (fallbackRole === "admin" || fallbackRole === "head") return fallbackRole;

	return "user";
}

function getCompanyId(user: Record<string, unknown>) {
	const fromClaim = getClaimValue(user, COMPANY_ID_CLAIM);
	if (typeof fromClaim === "string" && fromClaim.length > 0) return fromClaim;

	const fromAppMetadata = getClaimValue(user, "app_metadata");
	if (
		fromAppMetadata &&
		typeof fromAppMetadata === "object" &&
		"companyId" in fromAppMetadata &&
		typeof fromAppMetadata.companyId === "string"
	) {
		return fromAppMetadata.companyId;
	}

	return undefined;
}

export async function getAuth() {
	const session = await auth0.getSession();
	return { userId: session?.user?.sub ?? null };
}

export async function getCurrentUser(): Promise<AppUser | null> {
	const session = await auth0.getSession();
	if (!session?.user?.sub) return null;

	const rawUser = session.user as Record<string, unknown>;
	const email =
		typeof rawUser.email === "string"
			? rawUser.email
			: `${session.user.sub}@users.deeptrack.local`;

	const fullName =
		typeof rawUser.name === "string"
			? rawUser.name
			: typeof rawUser.nickname === "string"
				? rawUser.nickname
				: email;

	return {
		id: session.user.sub,
		email,
		fullName,
		role: getRole(rawUser),
		companyId: getCompanyId(rawUser),
		picture:
			typeof rawUser.picture === "string" ? rawUser.picture : undefined,
	};
}
