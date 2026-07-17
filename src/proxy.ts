import { NextRequest, NextResponse } from "next/server";
import {
  sessionCookieCandidatesFromHeader,
  sessionCookiePresenceFromHeader,
} from "@/lib/auth/session-cookie";
import { verifySessionCandidates, type SessionFailureCategory } from "@/lib/auth/session-core";

const protectedPrefixes = [
  "/home",
  "/camera",
  "/practice",
  "/review",
  "/history",
  "/profile",
  "/admin",
  "/onboarding",
  "/chat",
];

const CANONICAL_PRODUCTION_ORIGIN = "https://edesign.tairoh.com";

export async function proxy(request: NextRequest) {
  const canonicalRedirect = canonicalOriginRedirect(request);
  if (canonicalRedirect) return noStore(NextResponse.redirect(canonicalRedirect, 308));

  if (!protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie");
  const candidates = sessionCookieCandidatesFromHeader(cookieHeader);
  const verification = await verifySessionCandidates(candidates);
  if (verification.payload) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  logAuthRedirect(request, verification.failure ?? "missing", login.pathname + login.search);
  return noStore(NextResponse.redirect(login));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie");
  return response;
}

function canonicalOriginRedirect(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return null;
  const currentHost = normalizedHost(firstHeaderValue(request.headers.get("x-forwarded-host")) ?? request.headers.get("host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const currentProto = forwardedProto ?? (request.nextUrl.protocol === "https:" ? "https" : null);
  const canonical = new URL(CANONICAL_PRODUCTION_ORIGIN);

  if (currentHost === canonical.host && (!currentProto || currentProto === canonical.protocol.replace(":", ""))) {
    return null;
  }

  const destination = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, canonical);
  return destination;
}

function normalizedHost(host: string | null) {
  if (!host) return null;
  const lower = host.trim().toLowerCase();
  return lower.endsWith(":443") ? lower.slice(0, -4) : lower;
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim().toLowerCase() || null;
}

function logAuthRedirect(request: NextRequest, failure: SessionFailureCategory, redirectDestination: string) {
  const cookiePresence = sessionCookiePresenceFromHeader(request.headers.get("cookie"));
  console.warn(JSON.stringify({
    event: "auth_proxy_redirect",
    method: request.method,
    path: request.nextUrl.pathname,
    host: request.headers.get("host") ?? null,
    forwardedHost: firstHeaderValue(request.headers.get("x-forwarded-host")),
    forwardedProto: firstHeaderValue(request.headers.get("x-forwarded-proto")),
    sessionCookieCandidateCount: cookiePresence.candidateCount,
    newCookiePresent: cookiePresence.newCookiePresent,
    legacyCookiePresent: cookiePresence.legacyCookiePresent,
    jwtVerification: "failure",
    failureCategory: failure,
    userAgentClass: classifyUserAgent(request.headers.get("user-agent")),
    redirectDestination,
  }));
}

function classifyUserAgent(userAgent: string | null) {
  if (!userAgent) return "unknown";
  const value = userAgent.toLowerCase();
  if (value.includes("mobile") || value.includes("iphone") || value.includes("android")) return "mobile";
  if (value.includes("bot") || value.includes("crawler") || value.includes("spider")) return "bot";
  return "desktop";
}
