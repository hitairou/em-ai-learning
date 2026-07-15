import assert from "node:assert/strict";
import test from "node:test";
import { getLoginDestination, safeInternalRedirect } from "../src/lib/auth/redirects";
import { sessionCookieOptions } from "../src/lib/auth/session-cookie";

test("admin login destination bypasses learner onboarding state", () => {
  assert.equal(getLoginDestination({
    role: "admin",
    selectedCourse: null,
    diagnosticCompleted: false,
  }), "/admin/problems");

  assert.equal(getLoginDestination({
    role: "admin",
    selectedCourse: "em1",
    diagnosticCompleted: false,
  }), "/admin/problems");
});

test("learner login destination still follows onboarding progress", () => {
  assert.equal(getLoginDestination({
    role: "user",
    selectedCourse: null,
    diagnosticCompleted: false,
  }), "/onboarding/course");

  assert.equal(getLoginDestination({
    role: "user",
    selectedCourse: "em1",
    diagnosticCompleted: false,
  }), "/onboarding/diagnostic");

  assert.equal(getLoginDestination({
    role: "user",
    selectedCourse: "em1",
    diagnosticCompleted: true,
  }), "/home");
});

test("redirect paths stay same-origin", () => {
  assert.equal(safeInternalRedirect("/admin/problems"), "/admin/problems");
  assert.equal(safeInternalRedirect("//evil.example/path"), null);
  assert.equal(safeInternalRedirect("https://evil.example/path"), null);
  assert.equal(safeInternalRedirect(null), null);
});

test("session cookie attributes remain locked down", () => {
  assert.deepEqual(sessionCookieOptions("production"), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  assert.equal(sessionCookieOptions("development").secure, false);
});
