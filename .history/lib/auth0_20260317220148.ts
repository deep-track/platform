import { Auth0Client } from "@auth0/nextjs-auth0/server";

function getEnv(name: string) {
	const value = process.env[name];
	if (!value) return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

const auth0Secret = getEnv("AUTH0_SECRET");

if (!auth0Secret) {
	throw new Error(
		"AUTH0_SECRET is missing. Set a 32-byte secret (for example, 64-char hex) in .env.",
	);
}

export const auth0 = new Auth0Client({
	secret: auth0Secret,
	appBaseUrl: getEnv("APP_BASE_URL") ?? getEnv("NEXT_PUBLIC_URL"),
	domain: getEnv("AUTH0_DOMAIN"),
	clientId: getEnv("AUTH0_CLIENT_ID"),
	clientSecret: getEnv("AUTH0_CLIENT_SECRET"),
});
