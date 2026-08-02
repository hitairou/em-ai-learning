export const LEGACY_SESSION_COOKIE = "em-study-session";
export const HOST_PREFIX_SESSION_COOKIE = "__Host-em-study-session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const PENDING_REGISTRATION_TTL_SECONDS = 60 * 60 * 24;

export function pendingRegistrationCookieOptions(nodeEnv = process.env.NODE_ENV) {
  return { ...sessionCookieOptions(nodeEnv), maxAge: PENDING_REGISTRATION_TTL_SECONDS };
}

export interface SessionCookieCandidate {
  name: string;
  value: string;
  isLegacy: boolean;
}

export function sessionCookieName(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "production" ? HOST_PREFIX_SESSION_COOKIE : LEGACY_SESSION_COOKIE;
}

export function sessionCookieOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function expiredSessionCookieOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    ...sessionCookieOptions(nodeEnv),
    maxAge: 0,
  };
}

export function sessionCookieNames(nodeEnv = process.env.NODE_ENV) {
  const primary = sessionCookieName(nodeEnv);
  return primary === LEGACY_SESSION_COOKIE ? [primary] : [primary, LEGACY_SESSION_COOKIE];
}

export function sessionCookieCandidatesFromHeader(cookieHeader: string | null | undefined, nodeEnv = process.env.NODE_ENV) {
  const pairs = parseCookieHeader(cookieHeader);
  const names = sessionCookieNames(nodeEnv);
  const candidates: SessionCookieCandidate[] = [];

  for (const name of names) {
    for (const pair of pairs) {
      if (pair.name === name && pair.value) {
        candidates.push({ name, value: pair.value, isLegacy: name === LEGACY_SESSION_COOKIE });
      }
    }
  }

  return candidates;
}

export function sessionCookiePresenceFromHeader(cookieHeader: string | null | undefined, nodeEnv = process.env.NODE_ENV) {
  const pairs = parseCookieHeader(cookieHeader);
  const names = new Set(pairs.map((pair) => pair.name));
  return {
    candidateCount: sessionCookieCandidatesFromHeader(cookieHeader, nodeEnv).length,
    newCookiePresent: names.has(sessionCookieName(nodeEnv)),
    legacyCookiePresent: names.has(LEGACY_SESSION_COOKIE),
  };
}

function parseCookieHeader(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return [];
  return cookieHeader
    .split(";")
    .map((part) => {
      const index = part.indexOf("=");
      if (index < 0) return null;
      const name = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      return name ? { name, value } : null;
    })
    .filter((pair): pair is { name: string; value: string } => Boolean(pair));
}
