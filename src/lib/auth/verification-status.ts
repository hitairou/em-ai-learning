export const EMAIL_VERIFICATION_STATUSES = ["verified", "legacy_exempt", "guest", "system"] as const;
export type EmailVerificationStatus = typeof EMAIL_VERIFICATION_STATUSES[number];

export function isAllowedEmailVerificationStatus(value: string): value is EmailVerificationStatus {
  return (EMAIL_VERIFICATION_STATUSES as readonly string[]).includes(value);
}
