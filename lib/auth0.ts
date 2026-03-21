

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


let _auth0: any = null;
let _isAuth0Configured: boolean | null = null;

export function getAuth0() {
       if (_auth0 !== null || _isAuth0Configured !== null) return { auth0: _auth0, isAuth0Configured: _isAuth0Configured };
       const auth0Secret = getEnv("AUTH0_SECRET");
       const appBaseUrl = normalizeAppBaseUrl(
	       getEnv("APP_BASE_URL") ?? getEnv("NEXT_PUBLIC_URL"),
       );
       const auth0Domain = normalizeDomain(getEnv("AUTH0_DOMAIN"));
       const auth0ClientId = getEnv("AUTH0_CLIENT_ID");
       const auth0ClientSecret = getEnv("AUTH0_CLIENT_SECRET");
       _isAuth0Configured =
	       Boolean(auth0Secret) &&
	       Boolean(appBaseUrl) &&
	       Boolean(auth0Domain) &&
	       Boolean(auth0ClientId) &&
	       Boolean(auth0ClientSecret);
       if (!_isAuth0Configured) {
	       console.warn(
		       "Auth0 is not fully configured. Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, APP_BASE_URL, and AUTH0_SECRET.",
	       );
	       _auth0 = null;
       } else {
	       // Only import when needed (Node.js runtime)
	       // eslint-disable-next-line @typescript-eslint/no-var-requires
	       const { Auth0Client } = require("@auth0/nextjs-auth0/server");
	       _auth0 = new Auth0Client({
		       secret: auth0Secret as string,
		       appBaseUrl: appBaseUrl as string,
		       domain: auth0Domain as string,
		       clientId: auth0ClientId as string,
		       clientSecret: auth0ClientSecret as string,
	       });
       }
       return { auth0: _auth0, isAuth0Configured: _isAuth0Configured };
}
