import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  await clearSession();
  const response = NextResponse.redirect(new URL("/", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
