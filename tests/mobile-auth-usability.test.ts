import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(file: string) { return readFile(new URL(`../${file}`, import.meta.url), "utf8"); }

test("bottom navigation uses an allowlist of learning routes", async () => {
  const sourceText = await source("src/components/BottomNavigation.tsx");
  assert.match(sourceText, /pathname === item\.href/);
  assert.match(sourceText, /pathname\.startsWith\(`\$\{item\.href\}\/`\)/);
  assert.match(sourceText, /if \(!visible\) return null/);
});

test("signup fields keep password before consent and use same-tab legal return links", async () => {
  const sourceText = await source("src/components/AuthForm.tsx");
  assert.ok(sourceText.indexOf('register("password"') < sourceText.indexOf('register("acceptTerms"'));
  assert.ok(sourceText.indexOf('register("acceptTerms"') < sourceText.indexOf('アカウントを作成'));
  assert.match(sourceText, /\/terms\?returnTo=\/signup/);
  assert.match(sourceText, /\/privacy\?returnTo=\/signup/);
  assert.doesNotMatch(sourceText, /target="_blank"/);
});

test("legal pages provide a safe internal back button", async () => {
  const button = await source("src/components/LegalBackButton.tsx");
  const redirects = await source("src/lib/auth/redirects.ts");
  assert.match(button, /safeInternalRedirect/);
  assert.match(button, /origin === window\.location\.origin/);
  assert.match(button, /router\.push\("\/"\)/);
  assert.match(redirects, /startsWith\("\/\\\\"\)/);
});

test("email verification creates a session and uses the shared destination", async () => {
  const verify = await source("src/app/api/auth/verify-email/route.ts");
  const form = await source("src/components/VerifyEmailForm.tsx");
  const login = await source("src/app/api/auth/login/route.ts");
  assert.match(verify, /createSession/);
  assert.match(verify, /getLoginDestination/);
  assert.match(verify, /pendingRegistration\.delete/);
  assert.doesNotMatch(verify, /login\?emailVerified=1/);
  assert.match(form, /window\.location\.assign\(typeof data\.next/);
  assert.match(login, /findUserByEmail/);
  assert.match(login, /getLoginDestination/);
});
