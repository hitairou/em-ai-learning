import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { notFound } from "next/navigation";
import RichMathText from "@/components/RichMathText";
import { COURSE_LABELS, MISTAKE_LABELS } from "@/lib/constants";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import type { Choice, Course, MisconceptionType } from "@/types/learning";

function normalized(value: string) {
  return value.normalize("NFKC").trim().toLowerCase();
}

export const metadata = { title: "診断の振り返り" };

export default async function DiagnosticReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompletedUser();
  const { id } = await params;
  const attempt = await db.diagnosticAttempt.findFirst({
    where: { id, userId: user.id },
    include: { answers: { include: { problem: true }, orderBy: { problemId: "asc" } } },
  });
  if (!attempt) notFound();

  return (
    <div className="contentPage">
      <div className="diagnosticReviewHeader">
        <Link href="/review"><ArrowLeft size={17} /> 復習と履歴へ</Link>
        <div>
          <span className="eyebrow">{COURSE_LABELS[attempt.course as Course]} / DIAGNOSTIC REVIEW</span>
          <h1>5問診断の振り返り</h1>
          <p>{attempt.completedAt?.toLocaleDateString("ja-JP") ?? "日時未記録"} / スコア {attempt.score}/100</p>
        </div>
        <Link className="button primaryButton" href="/onboarding/diagnostic"><RotateCcw size={17} /> 解き直す</Link>
      </div>
      <div className="diagnosticAnswerList">
        {attempt.answers.map((answer, index) => {
          const choices = parseJson<Choice[]>(answer.problem.choicesJson, []);
          const selected = choices.find((choice) => normalized(choice.id) === normalized(answer.selectedChoice));
          const correct = choices.find((choice) => (
            normalized(choice.id) === normalized(answer.problem.correctAnswer)
            || normalized(choice.text) === normalized(answer.problem.correctAnswer)
          ));
          return (
            <article key={answer.id} className={`diagnosticAnswerCard ${answer.isCorrect ? "correct" : "incorrect"}`}>
              <div className="diagnosticAnswerTop">
                <span className={`resultDot ${answer.isCorrect ? "ok" : "ng"}`} />
                <strong>Q{index + 1}. {answer.problem.title}</strong>
                <small>{answer.answerTimeSec}秒 / {MISTAKE_LABELS[answer.mistakeType as MisconceptionType] ?? answer.mistakeType}</small>
              </div>
              <RichMathText className="questionBody" text={answer.problem.questionText} />
              <div className="diagnosticChoiceReview">
                <div><span>あなたの回答</span><strong>{selected ? `${selected.id.toUpperCase()}. ${selected.text}` : answer.selectedChoice}</strong></div>
                <div><span>正答</span><strong>{correct ? `${correct.id.toUpperCase()}. ${correct.text}` : answer.problem.correctAnswer}</strong></div>
              </div>
              <details>
                <summary>解説を見る</summary>
                <RichMathText text={answer.problem.explanation || answer.problem.solution} />
              </details>
            </article>
          );
        })}
      </div>
    </div>
  );
}
