import type { Choice } from "@/types/learning";
import RichMathText from "@/components/RichMathText";

export default function AnswerInput({ choices, value, onChange }: { choices: Choice[]; value: string; onChange: (value: string) => void }) {
  if (choices.length) return <div className="choiceList">{choices.map((choice) => <button key={choice.id} type="button" className={`choiceButton ${value === choice.id ? "selected" : ""}`} onClick={() => onChange(choice.id)}><span>{choice.id.toUpperCase()}</span><RichMathText text={choice.text} /></button>)}</div>;
  return <textarea className="answerArea" rows={9} value={value} onChange={(event) => onChange(event.target.value)} placeholder="使う法則 → 途中式 → 最終答え（単位付き）の順で書いてください。" />;
}
