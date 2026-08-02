import "server-only";
import { findRelatedProblemForQuestion } from "@/lib/problem-bank";
import { toProblemView } from "@/lib/problems";
import type { QuestionAnalysis } from "@/types/learning";

export async function withRelatedProblem(input: {
  userId: string;
  analysis: QuestionAnalysis;
}): Promise<QuestionAnalysis> {
  const related = await findRelatedProblemForQuestion({
    userId: input.userId,
    course: input.analysis.course,
    topic: input.analysis.topic,
    laws: input.analysis.laws,
  });
  return {
    ...input.analysis,
    relatedProblem: related ? toProblemView(related) : null,
  };
}
