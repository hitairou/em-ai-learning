import "server-only";
import { db } from "@/lib/db";
import { analyzeQuestion } from "@/lib/ai/analyzeQuestion";
import { extractPdfText } from "@/lib/uploads";
import { ELECTROMAGNETISM_ONLY_MESSAGE, shouldAcceptInitialQuestion } from "@/lib/question-relevance";
import type { Course, QuestionInputType } from "@/types/learning";

type UploadUser = {
  id: string;
  selectedCourse: string | null;
};

export async function createQuestionSessionFromUpload(input: {
  user: UploadUser;
  text: string;
  inputType: QuestionInputType;
  originalFilePath: string | null;
  imagePath: string | null;
  fileName?: string;
}) {
  if (!input.user.selectedCourse) {
    throw new Error("科目を選択してください");
  }
  let extractedText = input.text;
  if (input.inputType === "pdf" && input.originalFilePath) {
    const pdfText = await extractPdfText(input.originalFilePath).catch(() => "");
    extractedText = [pdfText, input.text].filter(Boolean).join("\n\n");
  } else if (input.inputType === "image" && !input.text) {
    extractedText = `アップロード画像: ${input.fileName ?? "image"}`;
  }

  const hasImageOnlyInput = input.inputType === "image" && !input.text;
  if (!hasImageOnlyInput && !shouldAcceptInitialQuestion(extractedText)) {
    throw new Error(ELECTROMAGNETISM_ONLY_MESSAGE);
  }
  const weakSkills = await db.userSkillProfile.findMany({
    where: { userId: input.user.id, course: input.user.selectedCourse },
    orderBy: { score: "asc" },
    take: 3,
  });
  const analysis = await analyzeQuestion({
    text: extractedText,
    selectedCourse: input.user.selectedCourse as Course,
    imagePath: input.imagePath,
    learnerContext: weakSkills.map((skill) => `${skill.topic}:${skill.score}`).join("、") || "診断履歴なし",
  });
  const session = await db.questionSession.create({
    data: {
      userId: input.user.id,
      course: analysis.course,
      inputType: input.inputType,
      originalFilePath: input.originalFilePath,
      extractedText: analysis.extractedText,
      detectedTopic: analysis.topic,
      aiSummary: JSON.stringify(analysis),
      messages: {
        create: [
          { role: "user", content: extractedText },
          { role: "assistant", content: JSON.stringify(analysis) },
        ],
      },
    },
  });
  await db.generatedSimilarProblem.create({
    data: {
      userId: input.user.id,
      generatedQuestion: analysis.similarQuestion,
      generatedSolution: analysis.similarSolution,
      difficulty: 2,
      topic: analysis.topic,
    },
  });
  return session;
}
