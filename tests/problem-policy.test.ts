import assert from "node:assert/strict";
import test from "node:test";
import { enforceReviewState, isPublishedProblem } from "../src/lib/problem-policy";

test("publication requires accepted, verified, and active", () => {
  assert.equal(isPublishedProblem({ humanReviewStatus: "unreviewed", verificationStatus: "draft", isActive: false }), false);
  assert.equal(isPublishedProblem({ humanReviewStatus: "accepted", verificationStatus: "draft", isActive: true }), false);
  assert.equal(isPublishedProblem({ humanReviewStatus: "unreviewed", verificationStatus: "verified", isActive: true }), false);
  assert.equal(isPublishedProblem({ humanReviewStatus: "accepted", verificationStatus: "verified", isActive: false }), false);
  assert.equal(isPublishedProblem({ humanReviewStatus: "accepted", verificationStatus: "verified", isActive: true }), true);
  assert.equal(isPublishedProblem({ humanReviewStatus: "accepted", verificationStatus: "verified", isActive: true, sourceType: "diagnostic" }), false);
});

test("server-side review state enforcement deactivates invalid combinations", () => {
  const current = { humanReviewStatus: "accepted", verificationStatus: "verified", isActive: true };
  assert.equal(enforceReviewState(current, { humanReviewStatus: "needs_fix" }).isActive, false);
  assert.equal(enforceReviewState(current, { humanReviewStatus: "rejected" }).isActive, false);
  assert.equal(enforceReviewState(current, { verificationStatus: "draft" }).isActive, false);
  assert.equal(enforceReviewState({ ...current, isActive: false }, { isActive: true }).isActive, true);
});
