import type { ProblemView } from "@/types/learning";

export default function DiagnosticQuestionCard({ problem, selected, onSelect }: { problem: ProblemView; selected: string | null; onSelect: (id: string) => void }) {
  return (
    <article className="questionCard">
      <div className="eyebrow">{problem.unit} / {problem.topic}</div>
      <h2>{problem.title}</h2>
      <p className="questionBody">{problem.questionText}</p>
      <div className="choiceList">
        {problem.choices.map((choice) => (
          <button key={choice.id} type="button" className={`choiceButton ${selected === choice.id ? "selected" : ""}`} onClick={() => onSelect(choice.id)}>
            <span>{choice.id.toUpperCase()}</span>{choice.text}
          </button>
        ))}
      </div>
    </article>
  );
}
