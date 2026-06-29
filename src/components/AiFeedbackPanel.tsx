import type { GradeResult } from "@/types/learning";
import { MISTAKE_LABELS } from "@/lib/constants";

export default function AiFeedbackPanel({ grade, solution, similar }: { grade: GradeResult; solution: string; similar: { question: string; solution: string } }) {
  return (
    <section className={`feedbackPanel ${grade.isCorrect ? "correct" : "incorrect"}`}>
      <div className="feedbackScore"><span>{grade.isCorrect ? "正解" : "要復習"}</span><strong>{grade.score}<small>点</small></strong></div>
      <div className="feedbackGrid">
        <div><h3>誤答原因</h3><p>{MISTAKE_LABELS[grade.mistakeType]}</p></div>
        <div><h3>法則選択</h3><p>{grade.lawSelection}</p></div>
        <div><h3>修正する箇所</h3><p>{grade.correction}</p></div>
        <div><h3>次にやること</h3><p>{grade.nextStep}</p></div>
      </div>
      <details open><summary>模範解答と考え方</summary><p>{grade.explanation}</p><pre>{solution}</pre></details>
      <details><summary>類題を表示</summary><p>{similar.question}</p><div className="detailsAnswer">{similar.solution}</div></details>
    </section>
  );
}
