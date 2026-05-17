export type MisconceptionType =
  | "field_potential_confusion"
  | "vector_scalar_confusion"
  | "charge_direction_confusion"
  | "distance_dependence_confusion"
  | "equipotential_field_relation_confusion"
  | "no_misconception";

export type QuestionTopic =
  | "field_direction"
  | "field_vs_potential"
  | "distance_dependence"
  | "equipotential_relation"
  | "vector_scalar";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type LearningDomain =
  | "field_direction"
  | "field_vs_potential"
  | "distance_dependence"
  | "equipotential_relation"
  | "vector_scalar";

export type Tag =
  | "electric_field"
  | "electric_potential"
  | "direction"
  | "distance"
  | "equipotential"
  | "vector"
  | "scalar";

export type ChoiceId = string;
export type QuestionId = string;

export interface Choice {
  id: ChoiceId;
  text: string;
  misconceptionType: MisconceptionType;
  feedbackHint: string;
}

export interface Question {
  id: QuestionId;
  topic: QuestionTopic;
  title: string;
  questionText: string;
  choices: Choice[];
  correctChoiceId: ChoiceId;
  explanation: string;
  tags: Tag[];
  difficulty: Difficulty;
}

export interface DiagnosisResult {
  questionId: QuestionId;
  selectedChoiceId: ChoiceId;
  correctChoiceId: ChoiceId;
  isCorrect: boolean;
  misconceptionType: MisconceptionType;
  diagnosisText: string;
}

export interface DomainScore {
  attempted: number;
  correct: number;
  score: number; // 0-100
}

export type LearningScore = Record<LearningDomain, DomainScore>;

export interface AnswerRecord {
  questionId: QuestionId;
  selectedChoiceId: ChoiceId;
  isCorrect: boolean;
  misconceptionType: MisconceptionType;
  answeredAt: string; // ISO
}

