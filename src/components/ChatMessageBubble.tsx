import type { QuestionAnalysis } from "@/types/learning";

function isAnalysis(value: unknown): value is QuestionAnalysis {
  return Boolean(value && typeof value === "object" && "approach" in value && "steps" in value);
}

export default function ChatMessageBubble({ role, content }: { role: string; content: string | QuestionAnalysis }) {
  if (role === "user" || !isAnalysis(content)) {
    return <div className={`chatBubble ${role === "user" ? "userBubble" : "assistantBubble"}`}><p>{typeof content === "string" ? content : JSON.stringify(content)}</p></div>;
  }
  return (
    <div className="chatBubble assistantBubble analysisBubble">
      <div className="analysisTag">{content.course === "em1" ? "電磁気1" : "電磁気2"} / {content.topic}</div>
      <section><h3>使う法則</h3><ul>{content.laws.map((law) => <li key={law}>{law}</li>)}</ul></section>
      <section><h3>考え方</h3><p>{content.approach}</p></section>
      <section><h3>解法ステップ</h3><ol>{content.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></section>
      <section className="answerSection"><h3>最終答え</h3><p>{content.finalAnswer}</p></section>
      <section><h3>よくあるミス</h3><ul>{content.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></section>
      <details><summary>類題に挑戦</summary><p>{content.similarQuestion}</p><div className="detailsAnswer">{content.similarSolution}</div></details>
    </div>
  );
}
