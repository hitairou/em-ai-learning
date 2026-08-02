ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "emailVerificationStatus" TEXT NOT NULL DEFAULT 'legacy_exempt';
CREATE TABLE "PendingRegistration" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "browserTokenHash" TEXT NOT NULL,
  "verificationCodeDigest" TEXT NOT NULL,
  "verificationExpiresAt" DATETIME NOT NULL,
  "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
  "lastSentAt" DATETIME,
  "sendWindowStartedAt" DATETIME NOT NULL,
  "sendCountInWindow" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" DATETIME NOT NULL,
  "termsAcceptedAt" DATETIME NOT NULL,
  "termsVersion" TEXT NOT NULL,
  "privacyAcknowledgedAt" DATETIME NOT NULL,
  "privacyVersion" TEXT NOT NULL,
  "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "PendingRegistration_email_key" ON "PendingRegistration"("email");
CREATE UNIQUE INDEX "PendingRegistration_browserTokenHash_key" ON "PendingRegistration"("browserTokenHash");
CREATE INDEX "PendingRegistration_expiresAt_idx" ON "PendingRegistration"("expiresAt");
CREATE INDEX "PendingRegistration_verificationExpiresAt_idx" ON "PendingRegistration"("verificationExpiresAt");
