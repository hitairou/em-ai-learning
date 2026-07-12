export type SelectionProblem = {
  id: string;
  appQuestionId: string | null;
  topic: string;
  subtopic: string | null;
  difficulty: number;
  requiredFormulasJson: string;
};

function formulas(problem: SelectionProblem) {
  try { return new Set(JSON.parse(problem.requiredFormulasJson) as string[]); } catch { return new Set<string>(); }
}

export function rankPracticeProblems<T extends SelectionProblem>(
  problems: T[],
  weakTopics: string[],
  attempts: Array<{ problemId: string; createdAt: Date }>,
) {
  const latestAttempt = new Map<string, number>();
  for (const attempt of attempts) {
    const time = attempt.createdAt.getTime();
    latestAttempt.set(attempt.problemId, Math.max(time, latestAttempt.get(attempt.problemId) ?? 0));
  }
  const weakRank = new Map(weakTopics.map((topic, index) => [topic, index]));
  return [...problems].sort((a, b) => {
    const aAttempted = latestAttempt.has(a.id) ? 1 : 0;
    const bAttempted = latestAttempt.has(b.id) ? 1 : 0;
    if (aAttempted !== bAttempted) return aAttempted - bAttempted;
    const aWeak = weakRank.get(a.topic) ?? Number.MAX_SAFE_INTEGER;
    const bWeak = weakRank.get(b.topic) ?? Number.MAX_SAFE_INTEGER;
    if (aWeak !== bWeak) return aWeak - bWeak;
    const recency = (latestAttempt.get(a.id) ?? 0) - (latestAttempt.get(b.id) ?? 0);
    if (recency !== 0) return recency;
    return (a.appQuestionId ?? a.id).localeCompare(b.appQuestionId ?? b.id);
  });
}

export function rankSimilarProblems<T extends SelectionProblem>(
  source: T,
  candidates: T[],
  attempts: Array<{ problemId: string; createdAt: Date }>,
) {
  const latestAttempt = new Map<string, number>();
  for (const attempt of attempts) {
    latestAttempt.set(attempt.problemId, Math.max(attempt.createdAt.getTime(), latestAttempt.get(attempt.problemId) ?? 0));
  }
  const sourceFormulas = formulas(source);
  return [...candidates].sort((a, b) => {
    const comparisons = [
      Number(b.topic === source.topic) - Number(a.topic === source.topic),
      Number(b.subtopic === source.subtopic) - Number(a.subtopic === source.subtopic),
      [...formulas(b)].filter((formula) => sourceFormulas.has(formula)).length - [...formulas(a)].filter((formula) => sourceFormulas.has(formula)).length,
      Number(Math.abs(b.difficulty - source.difficulty) <= 1) - Number(Math.abs(a.difficulty - source.difficulty) <= 1),
      Number(latestAttempt.has(a.id)) - Number(latestAttempt.has(b.id)),
      (latestAttempt.get(a.id) ?? 0) - (latestAttempt.get(b.id) ?? 0),
    ];
    for (const comparison of comparisons) if (comparison !== 0) return comparison;
    return (a.appQuestionId ?? a.id).localeCompare(b.appQuestionId ?? b.id);
  });
}
