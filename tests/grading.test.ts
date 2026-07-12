import assert from "node:assert/strict";
import test from "node:test";
import { gradeDeterministically, pendingDerivationGrade, type GradeableProblem } from "../src/lib/grading";

function problem(overrides: Partial<GradeableProblem>): GradeableProblem {
  return {
    answerKind: "short_text",
    choicesJson: null,
    correctAnswer: "ガウスの法則",
    explanation: "解説",
    internalMetadataJson: "{}",
    topic: "電場",
    ...overrides,
  };
}

test("choice grading is deterministic", () => {
  const target = problem({ answerKind: "choice", correctAnswer: "b", choicesJson: JSON.stringify([{ id: "a", misconceptionType: "concept_error" }, { id: "b", misconceptionType: "correct" }]) });
  assert.equal(gradeDeterministically(target, "b").isCorrect, true);
  assert.equal(gradeDeterministically(target, "a").isCorrect, false);
});

test("numeric grading applies tolerance and units", () => {
  const target = problem({ answerKind: "numeric", correctAnswer: "\\(12.0\\,\\mathrm{V}\\)", internalMetadataJson: JSON.stringify({ relativeTolerance: 0.02 }) });
  assert.equal(gradeDeterministically(target, "12.1 V").isCorrect, true);
  assert.equal(gradeDeterministically(target, "12.1 A").isCorrect, false);
  assert.equal(gradeDeterministically(target, "13 V").isCorrect, false);
});

test("short text grading normalizes width, punctuation, and whitespace", () => {
  const target = problem({ answerKind: "short_text", correctAnswer: "ガウスの法則" });
  assert.equal(gradeDeterministically(target, "ガウスの法則。 ").isCorrect, true);
  assert.equal(gradeDeterministically(target, "アンペールの法則").isCorrect, false);
});

test("failed derivation grading stays pending and never becomes correct", () => {
  const grade = pendingDerivationGrade("電磁誘導");
  assert.equal(grade.status, "pending");
  assert.equal(grade.isCorrect, null);
  assert.equal(grade.score, null);
});
