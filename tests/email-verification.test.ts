import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(file: string) { return readFile(new URL(`../${file}`, import.meta.url), "utf8"); }

test("email verification never creates a user during signup and has protected endpoints", async () => {
  const signup = await source("src/app/api/auth/signup/route.ts");
  const verify = await source("src/app/api/auth/verify-email/route.ts");
  const resend = await source("src/app/api/auth/resend-verification/route.ts");
  assert.doesNotMatch(signup, /db\.user\.create/); assert.match(signup, /pendingRegistration/); assert.match(signup, /status: 202/); assert.doesNotMatch(signup, /createSession/);
  assert.match(verify, /timingSafeEqual|matchesDigest/); assert.match(verify, /emailVerificationStatus: "verified"/); assert.match(verify, /pendingRegistration\.delete/);
  assert.match(resend, /Retry-After/); assert.match(resend, /cooldownSeconds/); assert.match(resend, /maxSendsPerHour/);
});

test("Mailgun verification messages disable tracking and do not include a verification URL", async () => {
  const sender = await source("src/lib/email/send-verification-code.ts");
  const template = await source("src/lib/email/templates/verification-code.ts");
  assert.match(sender, /o:tracking/); assert.match(sender, /o:tracking-clicks/); assert.match(sender, /o:tracking-opens/);
  assert.match(template, /確認コード/); assert.match(template, /有効期限/); assert.doesNotMatch(template, /http:\/\/|https:\/\//);
});
