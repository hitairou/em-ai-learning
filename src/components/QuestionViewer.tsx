"use client";

import type { Choice, Question } from "@/types/learning";

export default function QuestionViewer({
  question,
  selectedChoiceId,
  onSelect,
}: {
  question: Question;
  selectedChoiceId: string | null;
  onSelect: (choice: Choice) => void;
}) {
  return (
    <section className="card">
      <div className="questionMeta">
        <div className="badge">難易度 {question.difficulty}</div>
        <div className="muted">トピック: {question.topic}</div>
      </div>
      <h2 className="h2">{question.title}</h2>
      <p className="questionText">{question.questionText}</p>

      <div className="choices">
        {question.choices.map((choice) => {
          const checked = choice.id === selectedChoiceId;
          return (
            <button
              key={choice.id}
              type="button"
              className={checked ? "choice choiceSelected" : "choice"}
              onClick={() => onSelect(choice)}
            >
              <span className="choiceId">{choice.id.toUpperCase()}</span>
              <span className="choiceText">{choice.text}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

