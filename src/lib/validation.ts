import { z } from "zod";
import { COURSES, LEARNING_PURPOSES, MISTAKE_TYPES } from "@/types/learning";
import { HUMAN_REVIEW_STATUSES, VERIFICATION_STATUSES } from "@/lib/problem-policy";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "ユーザー名は2文字以上で入力してください").max(40),
  email: z.string().trim().toLowerCase().email("メールアドレスを確認してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(/[A-Za-z]/, "英字を1文字以上含めてください")
    .regex(/[0-9]/, "数字を1文字以上含めてください"),
  acceptTerms: z.literal(true, { error: "利用規約への同意が必要です" }),
  acknowledgePrivacy: z.literal(true, { error: "プライバシーポリシーの確認が必要です" }),
});

export const consentSchema = z.object({ acceptTerms: z.literal(true), acknowledgePrivacy: z.literal(true) });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const emailVerificationCodeSchema = z.object({ code: z.string().regex(/^\d{6}$/, "6桁の確認コードを入力してください") });

export const courseSchema = z.object({
  course: z.enum(COURSES),
  learningPurpose: z.enum(LEARNING_PURPOSES),
});

export const courseSwitchSchema = z.object({
  course: z.enum(COURSES),
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
  appQuestionId: z.string().trim().regex(/^Q\d{4}$/).optional().nullable(),
  course: z.enum(COURSES),
  unit: z.string().trim().min(1).max(100),
  topic: z.string().trim().min(1).max(100),
  subtopic: z.string().trim().max(100).optional().nullable(),
  difficulty: z.number().int().min(1).max(5),
  sourceType: z.enum(["diagnostic", "past_exam", "exercise", "ai_generated", "similar"]),
  sourceYear: z.number().int().min(1900).max(2200).optional().nullable(),
  questionType: z.string().trim().min(1).max(200).default("manual"),
  answerKind: z.enum(["choice", "numeric", "short_text", "derivation"]).default("short_text"),
  calculationMode: z.string().trim().min(1).max(100).default("mixed"),
  parentId: z.string().trim().max(200).optional().nullable(),
  parentSourceId: z.string().trim().max(200).optional().nullable(),
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
  humanReviewStatus: z.enum(HUMAN_REVIEW_STATUSES).default("unreviewed"),
  verificationStatus: z.enum(VERIFICATION_STATUSES).default("draft"),
  isActive: z.boolean().default(false),
  estimatedTimeSec: z.number().int().min(30).max(7200).default(300),
  internalMetadata: z.record(z.string(), z.unknown()).default({}),
});

export const problemReviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(834),
  humanReviewStatus: z.enum(HUMAN_REVIEW_STATUSES).optional(),
  verificationStatus: z.enum(VERIFICATION_STATUSES).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (value) => value.humanReviewStatus !== undefined || value.verificationStatus !== undefined || value.isActive !== undefined,
  "変更する状態を指定してください",
);

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
