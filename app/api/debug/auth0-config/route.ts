import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SECURITY: Only enable in development or for debugging
// Remove this endpoint before production
export async function GET() {
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev && !process.env.DEBUG_AUTH0) {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN ? "✓ SET" : "✗ MISSING",
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? "✓ SET" : "✗ MISSING",
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? "✓ SET" : "✗ MISSING",
    AUTH0_SECRET: process.env.AUTH0_SECRET ? "✓ SET" : "✗ MISSING",
    APP_BASE_URL: process.env.APP_BASE_URL || "NOT SET",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    DATABASE_URL: process.env.DATABASE_URL ? "✓ SET" : "✗ MISSING",
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED
      ? "✓ SET"
      : "✗ MISSING",
  };

  return NextResponse.json({
    message: "Auth0 Environment Variables Diagnostic",
    timestamp: new Date().toISOString(),
    environment: envVars,
  });
}
