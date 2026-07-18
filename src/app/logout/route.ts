import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const headers = request.headers;
  const isPrefetch =
    headers.get("purpose") === "prefetch" ||
    headers.get("next-router-prefetch") === "1" ||
    headers.get("next-router-prefetch") === "true" ||
    headers.get("x-middleware-prefetch") === "1";

  if (isPrefetch) {
    const response = new Response("prefetch-ignored", { status: 200 });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  await clearSession();
  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protoHeader = request.headers.get("x-forwarded-proto");
  const origin = hostHeader ? `${protoHeader || "https"}://${hostHeader}` : new URL(request.url).origin;

  const response = NextResponse.redirect(new URL("/login", origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
