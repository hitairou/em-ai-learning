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

type ChoiceRecord = { id: string; misconceptionType?: MisconceptionType };

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
  const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(problem.correctAnswer);
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
    relative: typeof metadata.relativeTolerance === "number" ? metadata.relativeTolerance : 0.01,
    absolute: typeof metadata.absoluteTolerance === "number" ? metadata.absoluteTolerance : 1e-9,
  };
}

function gradeNumeric(problem: GradeableProblem, userAnswer: string) {
  if (normalizeAnswer(userAnswer) === normalizeAnswer(problem.correctAnswer)) return result(problem, true, "calculation_error");
  const expected = numbers(problem.correctAnswer);
  const actual = numbers(userAnswer);
  const tolerance = numericTolerance(problem);
  const valuesMatch = expected.length > 0 && expected.length === actual.length && expected.every((target, index) => {
    const allowed = Math.max(tolerance.absolute, Math.abs(target) * tolerance.relative);
    return Math.abs(actual[index] - target) <= allowed;
  });
  const units = expectedUnits(problem.correctAnswer);
  const normalizedUser = userAnswer.normalize("NFKC").toLowerCase().replace(/\\(?:mathrm|text)\{([^}]*)\}/g, "$1");
  const unitsMatch = units.every((unit) => normalizedUser.includes(unit));
  return result(problem, valuesMatch && unitsMatch, valuesMatch ? "unit_error" : "calculation_error");
}

function gradeShortText(problem: GradeableProblem, userAnswer: string) {
  const expected = normalizeAnswer(problem.correctAnswer);
  const actual = normalizeAnswer(userAnswer);
  const isCorrect = actual === expected || (expected.length >= 4 && actual.includes(expected));
  return result(problem, isCorrect, "concept_error");
}

export function gradeDeterministically(problem: GradeableProblem, userAnswer: string) {
  if (problem.answerKind === "choice") return gradeChoice(problem, userAnswer);
  if (problem.answerKind === "numeric") return gradeNumeric(problem, userAnswer);
  if (problem.answerKind === "short_text") return gradeShortText(problem, userAnswer);
  throw new Error(`Deterministic grading is not available for ${problem.answerKind}.`);
}
