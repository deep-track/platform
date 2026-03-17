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

function normalizeDomain(domain?: string) {
	if (!domain) return undefined;
	if (domain.startsWith("http://") || domain.startsWith("https://")) {
		try {
			return new URL(domain).hostname;
		} catch {
			return undefined;
		}
	}
	return domain;
}

function normalizeAppBaseUrl(url?: string) {
	if (!url) return undefined;
	try {
		return new URL(url).origin;
	} catch {
		return undefined;
	}
}

const auth0Secret = getEnv("AUTH0_SECRET");
const appBaseUrl = normalizeAppBaseUrl(
	getEnv("APP_BASE_URL") ?? getEnv("NEXT_PUBLIC_URL"),
);
const auth0Domain = normalizeDomain(getEnv("AUTH0_DOMAIN"));
const auth0ClientId = getEnv("AUTH0_CLIENT_ID");
const auth0ClientSecret = getEnv("AUTH0_CLIENT_SECRET");

export const isAuth0Configured =
	Boolean(auth0Secret) &&
	Boolean(appBaseUrl) &&
	Boolean(auth0Domain) &&
	Boolean(auth0ClientId) &&
	Boolean(auth0ClientSecret);

if (!isAuth0Configured) {
	console.warn(
		"Auth0 is not fully configured. Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, APP_BASE_URL, and AUTH0_SECRET.",
	);
}

export const auth0 = isAuth0Configured
	? new Auth0Client({
			secret: auth0Secret as string,
			appBaseUrl: appBaseUrl as string,
			domain: auth0Domain as string,
			clientId: auth0ClientId as string,
			clientSecret: auth0ClientSecret as string,
		})
	: null;
