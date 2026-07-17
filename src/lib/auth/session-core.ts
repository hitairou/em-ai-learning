import { SignJWT, jwtVerify } from "jose";
import { SESSION_TTL_SECONDS, type SessionCookieCandidate } from "@/lib/auth/session-cookie";

export interface SessionPayload {
  userId: string;
  role: string;
}

export type SessionFailureCategory = "missing" | "expired" | "invalid_signature" | "malformed";

export interface SessionVerificationOutcome {
  cookieName: string;
  isLegacy: boolean;
  ok: boolean;
  failure?: SessionFailureCategory;
}

export interface SessionVerificationResult {
  payload: SessionPayload | null;
  usedCookieName: string | null;
  usedLegacyCookie: boolean;
  candidateCount: number;
  failure: SessionFailureCategory | null;
  outcomes: SessionVerificationOutcome[];
}

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  const result = await verifySessionCandidate({ name: "token", value: token ?? "", isLegacy: false });
  return result.payload;
}

export async function verifySessionCandidates(candidates: SessionCookieCandidate[]): Promise<SessionVerificationResult> {
  const outcomes: SessionVerificationOutcome[] = [];

  for (const candidate of candidates) {
    const result = await verifySessionCandidate(candidate);
    outcomes.push({
      cookieName: candidate.name,
      isLegacy: candidate.isLegacy,
      ok: Boolean(result.payload),
      failure: result.failure ?? undefined,
    });
    if (result.payload) {
      return {
        payload: result.payload,
        usedCookieName: candidate.name,
        usedLegacyCookie: candidate.isLegacy,
        candidateCount: candidates.length,
        failure: null,
        outcomes,
      };
    }
  }

  return {
    payload: null,
    usedCookieName: null,
    usedLegacyCookie: false,
    candidateCount: candidates.length,
    failure: summarizeFailure(outcomes),
    outcomes,
  };
}

async function verifySessionCandidate(candidate: SessionCookieCandidate) {
  if (!candidate.value) {
    return { payload: null, failure: "missing" as const };
  }

  try {
    const { payload } = await jwtVerify(candidate.value, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") {
      return { payload: null, failure: "malformed" as const };
    }
    return { payload: { userId: payload.userId, role: payload.role }, failure: null };
  } catch (error) {
    return { payload: null, failure: classifyJoseError(error) };
  }
}

function summarizeFailure(outcomes: SessionVerificationOutcome[]): SessionFailureCategory {
  if (!outcomes.length) return "missing";
  if (outcomes.some((outcome) => outcome.failure === "invalid_signature")) return "invalid_signature";
  if (outcomes.some((outcome) => outcome.failure === "malformed")) return "malformed";
  if (outcomes.some((outcome) => outcome.failure === "expired")) return "expired";
  return "missing";
}

function classifyJoseError(error: unknown): SessionFailureCategory {
  const code = typeof error === "object" && error ? (error as { code?: unknown }).code : null;
  if (code === "ERR_JWT_EXPIRED") return "expired";
  if (code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") return "invalid_signature";
  return "malformed";
}
