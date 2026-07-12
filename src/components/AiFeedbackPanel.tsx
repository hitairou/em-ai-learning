import Link from "next/link";
import RichMathText from "@/components/RichMathText";
import type { GradeResult, ProblemView } from "@/types/learning";
import { MISTAKE_LABELS } from "@/lib/constants";

export default function AiFeedbackPanel({
  grade,
  correctAnswer,
  solution,
  explanation,
  similar,
}: {
  grade: GradeResult;
  correctAnswer?: string;
  solution?: string;
  explanation?: string;
  similar?: ProblemView | null;
}) {
  if (grade.status === "pending") {
    return (
      <section className="feedbackPanel pending">
        <div className="feedbackScore"><span>採点保留</span></div>
        <p>{grade.explanation}</p>
        <p className="inlineNotice">この回答は正解・不正解のどちらにも記録されていません。再試行できます。</p>
      </section>
    );
  }
  const showSeparateExplanation = explanation && explanation !== solution;
  return (
    <section className={`feedbackPanel ${grade.isCorrect ? "correct" : "incorrect"}`}>
      <div className="feedbackScore">
        <span>{grade.isCorrect ? "正解" : "要復習"}</span>
        <strong>{grade.score}<small>点</small></strong>
      </div>

      <section className="answerResultSection">
        <h2>正答</h2>
        <RichMathText text={correctAnswer ?? ""} />
      </section>

      <section className="answerResultSection">
        <h2>解説・導出</h2>
        <RichMathText text={solution ?? ""} />
        {showSeparateExplanation && <RichMathText text={explanation} />}
      </section>

      <section className="answerResultSection">
        <h2>誤答原因</h2>
        <div className="feedbackGrid">
          <div><h3>原因</h3><p>{MISTAKE_LABELS[grade.mistakeType]}</p></div>
          <div><h3>法則選択</h3><p>{grade.lawSelection}</p></div>
          <div><h3>修正する箇所</h3><p>{grade.correction}</p></div>
          <div><h3>次に確認すること</h3><p>{grade.nextStep}</p></div>
        </div>
      </section>

      <section className="answerResultSection">
        <h2>次に解く問題</h2>
        {similar ? (
          <div className="similarProblem">
            <strong>{similar.title}</strong>
            <RichMathText text={similar.questionText} />
            <Link className="button secondaryButton" href={`/practice/${similar.id}`}>この問題を解く</Link>
          </div>
        ) : <p>現在、条件に合う公開済み問題はありません。</p>}
      </section>
    </section>
  );
}
