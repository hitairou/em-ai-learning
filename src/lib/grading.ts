import type { MisconceptionType } from "@/types/learning";

export type GradeableProblem = {
  answerKind: string;
  choicesJson: string | null;
  correctAnswer: string;
  explanation: string;
  internalMetadataJson: string;
  topic: string;
};

export type CompletedGrade = {
  status: "completed";
  isCorrect: boolean;
  score: number;
  mistakeType: MisconceptionType;
  lawSelection: string;
  correction: string;
  explanation: string;
  nextStep: string;
};

export function pendingDerivationGrade(topic: string) {
  return {
    status: "pending" as const,
    isCorrect: null,
    score: null,
    mistakeType: "no_misconception" as const,
    lawSelection: "採点を完了できませんでした。",
    correction: "回答は正誤判定されていません。",
    explanation: "AI採点を再試行してください。保存済みの採点基準が利用できるまで保留します。",
    nextStep: `${topic}の回答を保持したまま、時間をおいて再送してください。`,
  };
}

export function contradictoryDerivationGrade(problem: GradeableProblem, userAnswer: string): CompletedGrade | null {
  if (problem.answerKind !== "derivation") return null;
  const normalized = userAnswer.normalize("NFKC").toLowerCase();
  const hasExplicitContradiction = [
    /物理法則の?整合性[はがも]?不要/,
    /境界条件.{0,20}(?:不要|無視|考えず)/,
    /電流分布.{0,20}(?:不要|無視|考えず)/,
    /任意の式を選べばよい/,
    /途中式.{0,20}不要/,
    /法則.{0,20}不要/,
  ].some((pattern) => pattern.test(normalized));
  if (!hasExplicitContradiction) return null;
  return {
    status: "completed",
    isCorrect: false,
    score: 40,
    mistakeType: "boundary_condition_error",
    lawSelection: "最終式に近い記述があっても、根拠として必要な物理法則や境界条件を否定しています。",
    correction: "最終答だけでなく、使用する法則、境界条件、電流分布や対称性の扱いを整合させてください。",
    explanation: problem.explanation,
    nextStep: `${problem.topic}で必要な法則と条件を、式の各段階に対応づけて確認しましょう。`,
  };
}

type ChoiceRecord = { id: string; text?: string; misconceptionType?: MisconceptionType };

function parseJson<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\\(?:mathrm|text|operatorname)\{([^}]*)\}/g, "$1")
    .replace(/[\s　.,、。=＝()（）\[\]{}\\]/g, "");
}

function result(problem: GradeableProblem, isCorrect: boolean, mistakeType: MisconceptionType): CompletedGrade {
  return {
    status: "completed",
    isCorrect,
    score: isCorrect ? 100 : 0,
    mistakeType: isCorrect ? "correct" : mistakeType,
    lawSelection: isCorrect ? "必要な法則と結果を確認できています。" : `「${problem.topic}」の条件と使用法則を確認してください。`,
    correction: isCorrect ? "修正はありません。" : "正答と照合し、数値・符号・向き・単位を順に見直してください。",
    explanation: problem.explanation,
    nextStep: isCorrect ? "同じ構造の問題で定着を確認しましょう。" : `${problem.topic}の基礎事項を確認して再挑戦しましょう。`,
  };
}

function gradeChoice(problem: GradeableProblem, userAnswer: string) {
  const choices = parseJson<ChoiceRecord[]>(problem.choicesJson ?? "[]", []);
  const selected = choices.find((choice) => normalizeAnswer(choice.id) === normalizeAnswer(userAnswer));
  const normalizedCorrect = normalizeAnswer(problem.correctAnswer);
  const correctChoice = choices.find((choice) => (
    normalizeAnswer(choice.id) === normalizedCorrect
    || (choice.text ? normalizeAnswer(choice.text) === normalizedCorrect : false)
  ));
  const isCorrect = selected
    ? normalizeAnswer(selected.id) === normalizeAnswer(correctChoice?.id ?? problem.correctAnswer)
    : normalizeAnswer(userAnswer) === normalizedCorrect;
  return result(problem, isCorrect, selected?.misconceptionType ?? "concept_error");
}

function latexScientificNotation(value: string) {
  return value.replace(
    /([+-]?\d+(?:\.\d+)?)\s*(?:\\times|×|x)\s*10\s*\^?\s*\{?([+-]?\d+)\}?/gi,
    (_, coefficient: string, exponent: string) => String(Number(coefficient) * 10 ** Number(exponent)),
  );
}

function numbers(value: string) {
  return (latexScientificNotation(value).match(/[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?/gi) ?? [])
    .map(Number)
    .filter(Number.isFinite);
}

function expectedUnits(value: string) {
  const normalized = value
    .normalize("NFKC")
    .replace(/\\(?:mathrm|text)\{([^}]*)\}/g, "$1")
    .replace(/\\,/g, "")
    .toLowerCase();
  const knownUnits = ["a/m", "v/m", "c/m", "n/c", "w/m", "t", "v", "a", "h", "f", "j", "w", "c", "hz"];
  return knownUnits.filter((unit) => new RegExp(`(^|[^a-z])${unit.replace("/", "\\/")}([^a-z]|$)`, "i").test(normalized));
}

function numericTolerance(problem: GradeableProblem) {
  const metadata = parseJson<Record<string, unknown>>(problem.internalMetadataJson, {});
  return {
    // Three significant figures can differ from the stored value by just under 0.5%.
    relative: Math.max(typeof metadata.relativeTolerance === "number" ? metadata.relativeTolerance : 0.01, 0.005),
    absolute: typeof metadata.absoluteTolerance === "number" ? metadata.absoluteTolerance : 0,
  };
}

function numericValuesMatch(expected: number[], actual: number[], relativeTolerance: number, absoluteTolerance = 0) {
  if (expected.length === 0 || actual.length < expected.length) return false;
  const candidate = actual.slice(-expected.length);
  return expected.every((target, index) => {
    const allowed = Math.max(absoluteTolerance, Math.abs(target) * relativeTolerance);
    return Math.abs(candidate[index] - target) <= allowed;
  });
}

/** Compare the final numeric sequence so rounded derivation answers are accepted. */
export function finalNumericAnswerMatches(problem: GradeableProblem, userAnswer: string) {
  const expected = numbers(problem.correctAnswer);
  const actual = numbers(userAnswer);
  const tolerance = numericTolerance(problem);
  if (!numericValuesMatch(expected, actual, tolerance.relative, tolerance.absolute)) return false;

  const expectedUnitsList = expectedUnits(problem.correctAnswer);
  if (expectedUnitsList.length === 0) return true;
  const finalText = userAnswer.normalize("NFKC").toLowerCase().slice(-1200).replace(/\\(?:mathrm|text)\{([^}]*)\}/g, "$1");
  return expectedUnitsList.every((unit) => finalText.includes(unit));
}

function gradeNumeric(problem: GradeableProblem, userAnswer: string) {
  if (normalizeAnswer(userAnswer) === normalizeAnswer(problem.correctAnswer)) return result(problem, true, "calculation_error");
  const expected = numbers(problem.correctAnswer);
  const actual = numbers(userAnswer);
  const tolerance = numericTolerance(problem);
  const valuesMatch = numericValuesMatch(expected, actual, tolerance.relative, tolerance.absolute);
  const units = expectedUnits(problem.correctAnswer);
  const normalizedUser = userAnswer.normalize("NFKC").toLowerCase().replace(/\\(?:mathrm|text)\{([^}]*)\}/g, "$1");
  const unitsMatch = units.every((unit) => normalizedUser.includes(unit));
  return result(problem, valuesMatch && unitsMatch, valuesMatch ? "unit_error" : "calculation_error");
}

function gradeShortText(problem: GradeableProblem, userAnswer: string) {
  const expected = normalizeAnswer(problem.correctAnswer);
  const actual = normalizeAnswer(userAnswer);
  const textualMatch = actual === expected || (expected.length >= 4 && actual.includes(expected));
  const expectedValues = numbers(problem.correctAnswer);
  const actualValues = numbers(userAnswer);
  const units = expectedUnits(problem.correctAnswer);
  const normalizedUser = userAnswer.normalize("NFKC").toLowerCase().replace(/\\(?:mathrm|text)\{([^}]*)\}/g, "$1");
  const numericMatch = expectedValues.length === 1 && numericValuesMatch(expectedValues, actualValues, 0.01)
    && units.every((unit) => normalizedUser.includes(unit));
  const isCorrect = textualMatch || numericMatch;
  return result(problem, isCorrect, "concept_error");
}

export function gradeDeterministically(problem: GradeableProblem, userAnswer: string) {
  if (problem.answerKind === "choice") return gradeChoice(problem, userAnswer);
  if (problem.answerKind === "numeric") return gradeNumeric(problem, userAnswer);
  if (problem.answerKind === "short_text") return gradeShortText(problem, userAnswer);
  throw new Error(`Deterministic grading is not available for ${problem.answerKind}.`);
}
