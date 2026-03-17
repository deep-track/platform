import { auth0 } from "@/lib/auth0";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isRecoverableMiddlewareError(error: unknown) {
	if (!(error instanceof Error)) return false;
	const message = error.message.toLowerCase();
	return (
		message.includes("jweinvalid") ||
		message.includes("invalid compact jwe") ||
		message.includes("decrypt")
	);
}

export async function middleware(request: NextRequest) {
	try {
		return await auth0.middleware(request);
	} catch (error) {
		if (!isRecoverableMiddlewareError(error)) {
			throw error;
		}

		const response = NextResponse.next();
		const cookies = request.cookies.getAll();

		for (const cookie of cookies) {
			if (cookie.name === "appSession" || cookie.name.startsWith("appSession.")) {
				response.cookies.set(cookie.name, "", { path: "/", maxAge: 0 });
			}
		}

		return response;
	}
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};