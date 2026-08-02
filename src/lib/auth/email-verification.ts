import "server-only";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { getEmailConfig } from "@/lib/email/config";

export const PENDING_REGISTRATION_COOKIE = "em_pending_registration";
const PURPOSE = "em-pass-email-verification-v1";

export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function createVerificationCode() { return randomInt(0, 1_000_000).toString().padStart(6, "0"); }
export function createBrowserToken() { return randomBytes(32).toString("base64url"); }
export function hashBrowserToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function digestVerificationCode(input: { pendingRegistrationId: string; email: string; code: string }) {
  const config = getEmailConfig();
  return createHmac("sha256", config.verificationSecret).update([input.pendingRegistrationId, normalizeEmail(input.email), input.code, PURPOSE].join("\n")).digest("hex");
}
export function matchesDigest(expected: string, actual: string) {
  const a = Buffer.from(expected, "hex"); const b = Buffer.from(actual, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
export function maskEmail(email: string) {
  const [local, domain] = normalizeEmail(email).split("@", 2);
  if (!local || !domain) return "***";
  return `${local.slice(0, 1)}${"*".repeat(Math.max(2, Math.min(5, local.length - 1)))}@${domain}`;
}
