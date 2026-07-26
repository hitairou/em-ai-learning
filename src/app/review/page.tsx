import ReviewHub, { type ReviewHistoryEntry, type ReviewProblemItem } from "@/components/ReviewHub";
import { requireCompletedUser } from "@/lib/auth/user";
import { MISTAKE_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { publishedProblemWhere } from "@/lib/problem-policy";
import type { MisconceptionType } from "@/types/learning";

export const metadata = { title: "復習" };

function modesForDifficulty(difficulty: number): ReviewProblemItem["modes"] {
  const modes: ReviewProblemItem["modes"] = [];
  if (difficulty <= 2) modes.push("foundation");
  if (difficulty >= 2 && difficulty <= 4) modes.push("standard");
  if (difficulty >= 4) modes.push("exam");
  return modes;
}

function feedbackText(value: string) {
  const feedback = parseJson<{ explanation?: string; correction?: string; nextStep?: string } | null>(value, null);
  if (!feedback) return value;
  return [feedback.explanation, feedback.correction, feedback.nextStep].filter(Boolean).join(" / ");
}

export default async function ReviewPage() {
  const user = await requireCompletedUser();
  const [practiceAttempts, diagnosticAnswers, skills] = await Promise.all([
    db.practiceAttempt.findMany({
      where: { userId: user.id, problem: { is: { ...publishedProblemWhere, course: user.selectedCourse! } } },
      include: { problem: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    db.diagnosticAnswer.findMany({
      where: { attempt: { is: { userId: user.id, course: user.selectedCourse! } }, problem: { is: { course: user.selectedCourse! } } },
      include: { problem: true, attempt: true },
      orderBy: { attempt: { completedAt: "desc" } },
      take: 500,
    }),
    db.userSkillProfile.findMany({ where: { userId: user.id, course: user.selectedCourse! } }),
  ]);

  const scoreByTopic = new Map(skills.map((skill) => [skill.topic, skill.score]));
  const items = new Map<string, ReviewProblemItem>();

  for (const attempt of practiceAttempts) {
    const key = `practice-${attempt.problemId}`;
    const history: ReviewHistoryEntry = {
      id: attempt.id,
      date: attempt.createdAt.toISOString(),
      label: attempt.isCorrect ? "正解" : "誤答",
      isCorrect: attempt.isCorrect,
      answer: attempt.userAnswer,
      mistakeLabel: MISTAKE_LABELS[attempt.mistakeType as MisconceptionType] ?? attempt.mistakeType,
      feedback: feedbackText(attempt.aiFeedback),
      reviewHref: `/practice/${attempt.problemId}`,
    };
    const existing = items.get(key);
    if (existing) {
      existing.history.push(history);
      existing.attemptCount += 1;
      existing.wrongCount += attempt.isCorrect ? 0 : 1;
      if (new Date(existing.lastAnsweredAt) < attempt.createdAt) existing.lastAnsweredAt = attempt.createdAt.toISOString();
      continue;
    }
    items.set(key, {
      id: key,
      problemId: attempt.problemId,
      kind: "practice",
      modes: modesForDifficulty(attempt.problem.difficulty),
      unit: attempt.problem.unit,
      topic: attempt.problem.topic,
      difficulty: attempt.problem.difficulty,
      title: attempt.problem.title,
      questionText: attempt.problem.questionText,
      solution: attempt.problem.solution,
      explanation: attempt.problem.explanation,
      topicScore: scoreByTopic.get(attempt.problem.topic) ?? null,
      attemptCount: 1,
      wrongCount: attempt.isCorrect ? 0 : 1,
      lastAnsweredAt: attempt.createdAt.toISOString(),
      solveHref: `/practice/${attempt.problemId}`,
      history: [history],
    });
  }

  for (const answer of diagnosticAnswers) {
    const key = `diagnostic-${answer.problemId}`;
    const date = answer.attempt.completedAt ?? answer.attempt.startedAt;
    const history: ReviewHistoryEntry = {
      id: answer.id,
      date: date.toISOString(),
      label: answer.isCorrect ? "正解" : "誤答",
      isCorrect: answer.isCorrect,
      answer: `選択: ${answer.selectedChoice}`,
      mistakeLabel: MISTAKE_LABELS[answer.mistakeType as MisconceptionType] ?? answer.mistakeType,
      reviewHref: `/diagnostic/${answer.attemptId}`,
    };
    const existing = items.get(key);
    if (existing) {
      existing.history.push(history);
      existing.attemptCount += 1;
      existing.wrongCount += answer.isCorrect ? 0 : 1;
      if (new Date(existing.lastAnsweredAt) < date) existing.lastAnsweredAt = date.toISOString();
      continue;
    }
    items.set(key, {
      id: key,
      problemId: answer.problemId,
      kind: "diagnostic",
      modes: [],
      unit: answer.problem.unit,
      topic: answer.problem.topic,
      difficulty: answer.problem.difficulty,
      title: answer.problem.title,
      questionText: answer.problem.questionText,
      solution: answer.problem.solution,
      explanation: answer.problem.explanation,
      topicScore: scoreByTopic.get(answer.problem.topic) ?? null,
      attemptCount: 1,
      wrongCount: answer.isCorrect ? 0 : 1,
      lastAnsweredAt: date.toISOString(),
      solveHref: "/onboarding/diagnostic",
      history: [history],
    });
  }

  const reviewItems = [...items.values()]
    .map((item) => ({ ...item, history: item.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }))
    .sort((a, b) => new Date(b.lastAnsweredAt).getTime() - new Date(a.lastAnsweredAt).getTime());
  const units = [...new Set(reviewItems.map((item) => item.unit))].sort((a, b) => a.localeCompare(b, "ja"));

  return (
    <div className="contentPage">
      <div className="pageHeader">
        <span className="eyebrow">REVIEW & LOG</span>
        <h1>復習と学習履歴</h1>
        <p>診断と演習の履歴をまとめて、種別・単元・誤答有無で切り替えます。</p>
      </div>
      <ReviewHub items={reviewItems} units={units} />
    </div>
  );
}
