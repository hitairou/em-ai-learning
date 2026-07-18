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
  const response = NextResponse.redirect(new URL("/", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
