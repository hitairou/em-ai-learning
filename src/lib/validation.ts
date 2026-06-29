import { z } from "zod";
import { COURSES, LEARNING_PURPOSES, MISTAKE_TYPES } from "@/types/learning";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "ユーザー名は2文字以上で入力してください").max(40),
  email: z.string().trim().toLowerCase().email("メールアドレスを確認してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(/[A-Za-z]/, "英字を1文字以上含めてください")
    .regex(/[0-9]/, "数字を1文字以上含めてください"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const courseSchema = z.object({
  course: z.enum(COURSES),
  learningPurpose: z.enum(LEARNING_PURPOSES),
});

export const diagnosticSubmitSchema = z.object({
  startedAt: z.string().datetime(),
  answers: z
    .array(
      z.object({
        problemId: z.string().min(1),
        selectedChoice: z.string().min(1).max(20),
        answerTimeSec: z.number().int().min(0).max(3600),
      }),
    )
    .length(5),
});

export const practiceSubmitSchema = z.object({
  problemId: z.string().min(1),
  userAnswer: z.string().trim().min(1).max(10000),
  answerTimeSec: z.number().int().min(0).max(14400),
  hintUsedCount: z.number().int().min(0).max(20).default(0),
});

export const chatMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

export const choiceSchema = z.object({
  id: z.string().min(1).max(10),
  text: z.string().min(1).max(1000),
  misconceptionType: z.enum(MISTAKE_TYPES),
  feedbackHint: z.string().max(1000).optional(),
});

export const problemSchema = z.object({
  course: z.enum(COURSES),
  unit: z.string().trim().min(1).max(100),
  topic: z.string().trim().min(1).max(100),
  subtopic: z.string().trim().max(100).optional().nullable(),
  difficulty: z.number().int().min(1).max(5),
  sourceType: z.enum(["diagnostic", "past_exam", "exercise", "ai_generated", "similar"]),
  sourceYear: z.number().int().min(1900).max(2200).optional().nullable(),
  title: z.string().trim().min(1).max(200),
  questionText: z.string().trim().min(1).max(20000),
  choices: z.array(choiceSchema).max(8).optional(),
  correctAnswer: z.string().trim().min(1).max(5000),
  solution: z.string().trim().min(1).max(30000),
  explanation: z.string().trim().min(1).max(30000),
  keyConcepts: z.array(z.string().max(100)).max(20).default([]),
  requiredFormulas: z.array(z.string().max(500)).max(20).default([]),
  commonMistakes: z.array(z.string().max(500)).max(20).default([]),
  figureUrls: z.array(z.string().max(1000)).max(10).default([]),
});

export const materialSchema = z.object({
  course: z.enum(COURSES),
  title: z.string().trim().min(1).max(200),
  extractedText: z.string().max(100000).default(""),
  sourceYear: z.number().int().min(1900).max(2200).optional().nullable(),
  tags: z.array(z.string().max(100)).max(30).default([]),
});

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "入力内容を確認してください";
}
