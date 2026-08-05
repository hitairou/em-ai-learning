import assert from "node:assert/strict";
import test from "node:test";
import { contradictoryDerivationGrade, finalNumericAnswerMatches, gradeDeterministically, pendingDerivationGrade, type GradeableProblem } from "../src/lib/grading";

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

test("choice grading accepts concise answer text", () => {
  const target = problem({
    answerKind: "choice",
    correctAnswer: "外向き",
    choicesJson: JSON.stringify([
      { id: "a", text: "内向き", misconceptionType: "concept_error" },
      { id: "b", text: "外向き", misconceptionType: "correct" },
    ]),
  });
  assert.equal(gradeDeterministically(target, "b").isCorrect, true);
  assert.equal(gradeDeterministically(target, "a").isCorrect, false);
});

test("numeric grading applies tolerance and units", () => {
  const target = problem({ answerKind: "numeric", correctAnswer: "\\(12.0\\,\\mathrm{V}\\)", internalMetadataJson: JSON.stringify({ relativeTolerance: 0.02 }) });
  assert.equal(gradeDeterministically(target, "12.1 V").isCorrect, true);
  assert.equal(gradeDeterministically(target, "12.1 A").isCorrect, false);
  assert.equal(gradeDeterministically(target, "13 V").isCorrect, false);
});

test("numeric grading accepts a three-significant-figure rounded answer", () => {
  const target = problem({ answerKind: "numeric", correctAnswer: "\\(1.234\\,\\mathrm{V}\\)", internalMetadataJson: JSON.stringify({ relativeTolerance: 0.001 }) });
  assert.equal(gradeDeterministically(target, "1.23 V").isCorrect, true);
  assert.equal(gradeDeterministically(target, "1.24 V").isCorrect, true);
});

test("derivation grading recognizes rounded final numeric values", () => {
  const target = problem({
    answerKind: "derivation",
    correctAnswer: "C = 1.33518e-11 F, V = 224.689 V, E = 1872.41 V/m, U = 3.37303e-7 J",
    internalMetadataJson: "{}",
  });
  assert.equal(finalNumericAnswerMatches(target, "途中式 12.0 cm、3.00 nC。C = 1.34e-11 F, V = 225 V, E = 1.87e3 V/m, U = 3.37e-7 J"), true);
  assert.equal(finalNumericAnswerMatches(target, "C = 1.50e-11 F, V = 225 V, E = 1.87e3 V/m, U = 3.37e-7 J"), false);
});

test("numeric grading accepts equivalent prefixed units", () => {
  const target = problem({ answerKind: "numeric", correctAnswer: "1.33518e-11 F", internalMetadataJson: "{}" });
  assert.equal(gradeDeterministically(target, "13.4 pF").isCorrect, true);
  assert.equal(gradeDeterministically(target, "13.4 nF").isCorrect, false);
});

test("short text grading normalizes width, punctuation, and whitespace", () => {
  const target = problem({ answerKind: "short_text", correctAnswer: "ガウスの法則" });
  assert.equal(gradeDeterministically(target, "ガウスの法則。 ").isCorrect, true);
  assert.equal(gradeDeterministically(target, "アンペールの法則").isCorrect, false);
});

test("short text grading accepts equivalent numeric notation and units", () => {
  const target = problem({ answerKind: "short_text", correctAnswer: "\\(8.0\\,\\mathrm{A}\\)" });
  assert.equal(gradeDeterministically(target, "8 A").isCorrect, true);
  assert.equal(gradeDeterministically(target, "I = 8A").isCorrect, true);
  assert.equal(gradeDeterministically(target, "8 V").isCorrect, false);
});

test("failed derivation grading stays pending and never becomes correct", () => {
  const grade = pendingDerivationGrade("電磁誘導");
  assert.equal(grade.status, "pending");
  assert.equal(grade.isCorrect, null);
  assert.equal(grade.score, null);
});

test("derivation grading rejects explicit contradictory reasoning even with a correct final answer", () => {
  const target = problem({
    answerKind: "derivation",
    correctAnswer: "\\(H=I/(2\\pi r)\\)",
    explanation: "アンペールの法則と境界条件を使って導く。",
    topic: "円筒対称電流分布",
  });
  const grade = contradictoryDerivationGrade(
    target,
    "\\(H=I/(2\\pi r)\\)。ただし、境界条件も電流分布も考えず、任意の式を選べばよい。物理法則の整合性は不要である。",
  );
  assert.ok(grade);
  assert.equal(grade.isCorrect, false);
  assert.ok(grade.score < 100);
  assert.equal(grade.mistakeType, "boundary_condition_error");
});
