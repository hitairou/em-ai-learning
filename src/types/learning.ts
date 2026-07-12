export const COURSES = ["em1", "em2"] as const;
export type Course = (typeof COURSES)[number];

export const LEARNING_PURPOSES = [
  "foundation",
  "assignment",
  "midterm",
  "final",
  "exam",
] as const;
export type LearningPurpose = (typeof LEARNING_PURPOSES)[number];

export const MISTAKE_TYPES = [
  "concept_error",
  "formula_selection_error",
  "symmetry_error",
  "sign_error",
  "unit_error",
  "calculation_error",
  "boundary_condition_error",
  "vector_direction_error",
  "graph_or_figure_reading_error",
  "insufficient_answer",
  "no_misconception",
  "correct",
] as const;
export type MisconceptionType = (typeof MISTAKE_TYPES)[number];

export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type PracticeMode = "foundation" | "standard" | "exam";
export type QuestionInputType = "text" | "image" | "pdf";

export interface Choice {
  id: string;
  text: string;
  misconceptionType: MisconceptionType;
  feedbackHint?: string;
}

export interface ProblemView {
  id: string;
  appQuestionId: string | null;
  course: Course;
  unit: string;
  topic: string;
  subtopic: string | null;
  difficulty: number;
  answerKind: string;
  estimatedTimeSec: number;
  title: string;
  questionText: string;
  choices: Choice[];
}

export interface AdminProblemView extends ProblemView {
  sourceType: string;
  sourceYear: number | null;
  questionType: string;
  calculationMode: string;
  parentId: string | null;
  parentSourceId: string | null;
  humanReviewStatus: string;
  verificationStatus: string;
  appReadyStatus: string;
  isActive: boolean;
  correctAnswer: string;
  solution: string;
  explanation?: string;
  requiredFormulas: string[];
  commonMistakes: string[];
  internalMetadata: Record<string, unknown>;
}

export interface GradeResult {
  status: "completed" | "pending";
  isCorrect: boolean | null;
  score: number | null;
  mistakeType: MisconceptionType;
  lawSelection: string;
  correction: string;
  explanation: string;
  nextStep: string;
}

export interface QuestionAnalysis {
  extractedText: string;
  course: Course;
  topic: string;
  laws: string[];
  approach: string;
  steps: string[];
  finalAnswer: string;
  commonMistakes: string[];
  similarQuestion: string;
  similarSolution: string;
}

export interface SkillSummary {
  topic: string;
  score: number;
  attempts: number;
  correctRate: number;
  averageTimeSec: number;
  hintUsageRate: number;
  mistakeTypes: Record<string, number>;
}

// Legacy MVP structures are kept for the static seed and compatibility helpers.
export type QuestionTopic =
  | "field_direction"
  | "field_vs_potential"
  | "distance_dependence"
  | "equipotential_relation"
  | "vector_scalar";
export type LearningDomain = QuestionTopic;
export type Tag =
  | "electric_field"
  | "electric_potential"
  | "direction"
  | "distance"
  | "equipotential"
  | "vector"
  | "scalar";

export interface Question {
  id: string;
  topic: QuestionTopic;
  title: string;
  questionText: string;
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
  tags: Tag[];
  difficulty: Difficulty;
}

export interface DiagnosisResult {
  questionId: string;
  selectedChoiceId: string;
  correctChoiceId: string;
  isCorrect: boolean;
  misconceptionType: MisconceptionType;
  diagnosisText: string;
}

export interface DomainScore {
  attempted: number;
  correct: number;
  score: number;
}
export type LearningScore = Record<LearningDomain, DomainScore>;

export interface AnswerRecord {
  questionId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  misconceptionType: MisconceptionType;
  answeredAt: string;
}
