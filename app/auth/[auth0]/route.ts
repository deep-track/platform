import { getAuth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ auth0: string }> }
) {
  try {
    const { auth0: endpoint } = await params;
    const { auth0, isAuth0Configured } = getAuth0();

    if (!isAuth0Configured || !auth0) {
      return NextResponse.json(
        { error: "Auth0 is not configured" },
        { status: 503 }
      );
    }

    const baseUrl = new URL(req.url).origin;
    const requestUrl = new URL(req.url);

    // Create a request-like object for the Auth0 client
    const auth0Request = new Request(
      `${baseUrl}/auth/${endpoint}${requestUrl.search}`,
      {
        method: req.method,
        headers: new Headers(req.headers),
      }
    );

    return await auth0.handleAuth()(auth0Request);
  } catch (error) {
    console.error("[Auth0 Route Error]", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ auth0: string }> }
) {
  return GET(req, { params });
}
