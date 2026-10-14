import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Direct shortcut for demo entrance — redirects immediately to /dashboard.
 * No login is required.
 */
export async function GET(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.");
  const proto = isLocal ? "http" : "https";
  const url = `${proto}://${host}/dashboard`;
  return NextResponse.redirect(url, { status: 302 });
}
