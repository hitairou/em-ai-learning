import "server-only";
import { cookies, headers } from "next/headers";
import {
  expiredSessionCookieOptions,
  LEGACY_SESSION_COOKIE,
  sessionCookieCandidatesFromHeader,
  sessionCookieName,
  sessionCookieNames,
  sessionCookieOptions,
} from "@/lib/auth/session-cookie";
import {
  signSession,
  verifySessionCandidates,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session-core";

export { LEGACY_SESSION_COOKIE, signSession, verifySessionToken as verifySession };
export type { SessionPayload };

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  const store = await cookies();
  const primaryName = sessionCookieName();
  store.set(primaryName, token, sessionCookieOptions());
  if (primaryName !== LEGACY_SESSION_COOKIE) {
    store.set(LEGACY_SESSION_COOKIE, "", expiredSessionCookieOptions());
  }
}

export async function clearSession() {
  const store = await cookies();
  for (const name of sessionCookieNames()) {
    store.set(name, "", expiredSessionCookieOptions());
  }
}

export async function readSession() {
  const requestHeaders = await headers();
  const candidates = sessionCookieCandidatesFromHeader(requestHeaders.get("cookie"));
  const result = await verifySessionCandidates(candidates);
  return result.payload;
}
