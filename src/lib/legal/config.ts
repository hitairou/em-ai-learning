import { z } from "zod";

export const TERMS_VERSION = "2026-08-02";
export const PRIVACY_VERSION = "2026-08-02";
export const UPLOAD_POLICY_VERSION = "2026-08-02";

const emailSchema = z.string().trim().email();

export function getLegalConfig() {
  const isProduction = process.env.NODE_ENV === "production";
  const operator = process.env.SERVICE_OPERATOR_NAME?.trim() || (!isProduction ? "EM PASS運営事務局" : "");
  const contact = process.env.LEGAL_CONTACT_EMAIL?.trim() || (!isProduction ? "legal@example.invalid" : "");
  const retention = Number.parseInt(process.env.UPLOAD_RETENTION_DAYS ?? "30", 10);
  if (!operator) throw new Error("SERVICE_OPERATOR_NAME is required in production");
  if (!contact || !emailSchema.safeParse(contact).success) throw new Error("LEGAL_CONTACT_EMAIL must be a valid email in production");
  if (!Number.isInteger(retention) || retention < 1 || retention > 365) throw new Error("UPLOAD_RETENTION_DAYS must be an integer from 1 to 365");
  return { operator, contact, retentionDays: retention };
}

export function hasCurrentConsent(user: { termsVersion: string | null; privacyVersion: string | null }) {
  return user.termsVersion === TERMS_VERSION && user.privacyVersion === PRIVACY_VERSION;
}
