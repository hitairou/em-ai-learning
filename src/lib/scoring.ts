import type { LearningDomain, LearningScore, Question } from "@/types/learning";

export function createEmptyLearningScore(): LearningScore {
  return {
    field_direction: { attempted: 0, correct: 0, score: 0 },
    field_vs_potential: { attempted: 0, correct: 0, score: 0 },
    distance_dependence: { attempted: 0, correct: 0, score: 0 },
    equipotential_relation: { attempted: 0, correct: 0, score: 0 },
    vector_scalar: { attempted: 0, correct: 0, score: 0 },
  };
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function recompute(attempted: number, correct: number) {
  if (attempted <= 0) return 0;
  return clampScore(Math.round((correct / attempted) * 100));
}

export function updateLearningScoreDomain(
  prev: LearningScore,
  domain: LearningDomain,
  isCorrect: boolean
): LearningScore {
  const current = prev[domain];
  const attempted = current.attempted + 1;
  const correct = current.correct + (isCorrect ? 1 : 0);
  const score = recompute(attempted, correct);

  return {
    ...prev,
    [domain]: { attempted, correct, score },
  };
}

export function updateLearningScoreWithQuestion(
  prev: LearningScore,
  question: Question,
  isCorrect: boolean
): LearningScore {
  const domain = question.topic;
  return updateLearningScoreDomain(prev, domain, isCorrect);
}

