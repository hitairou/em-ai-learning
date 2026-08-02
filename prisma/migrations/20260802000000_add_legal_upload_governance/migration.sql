ALTER TABLE "User" ADD COLUMN "termsAcceptedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "termsVersion" TEXT;
ALTER TABLE "User" ADD COLUMN "privacyAcknowledgedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "privacyVersion" TEXT;
ALTER TABLE "QuestionSession" ADD COLUMN "uploadRightsConfirmedAt" DATETIME;
ALTER TABLE "QuestionSession" ADD COLUMN "uploadPolicyVersion" TEXT;
ALTER TABLE "QuestionSession" ADD COLUMN "originalFileDeleteAt" DATETIME;
ALTER TABLE "QuestionSession" ADD COLUMN "originalFileDeletedAt" DATETIME;
CREATE INDEX "QuestionSession_originalFileDeleteAt_originalFileDeletedAt_idx" ON "QuestionSession"("originalFileDeleteAt", "originalFileDeletedAt");
