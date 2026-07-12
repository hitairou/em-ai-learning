import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const EXPECTED_COUNT = 834;
const INITIAL_STATE = {
  humanReviewStatus: "unreviewed",
  verificationStatus: "draft",
  appReadyStatus: "pending_human_review",
  isActive: false,
};

const payloadSchema = z.object({
  appQuestionId: z.string().regex(/^Q\d{4}$/),
  course: z.enum(["電磁気1", "電磁気2"]),
  unit: z.string().min(1),
  topic: z.string().min(1),
  subtopic: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
  sourceType: z.literal("exercise"),
  sourceYear: z.number().int().nullable(),
  title: z.string().min(1),
  questionText: z.string().min(1),
  choices: z.array(z.unknown()),
  correctAnswer: z.string().min(1),
  solution: z.string().min(1),
  explanation: z.string().min(1),
  keyConcepts: z.array(z.string()),
  requiredFormulas: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  figureUrls: z.array(z.string()),
  questionType: z.string().min(1),
  calculationMode: z.string().min(1),
  parentId: z.string().nullable().optional(),
  parentSourceId: z.string().nullable(),
  estimatedTimeSec: z.number().int().positive(),
  humanReviewStatus: z.literal("unreviewed"),
  verificationStatus: z.literal("draft"),
  appReadyStatus: z.literal("pending_human_review"),
  isActive: z.literal(false),
  internalMetadata: z.record(z.string(), z.unknown()),
  answerKind: z.enum(["choice", "numeric", "short_text", "derivation"]),
});

const courseMap = { "電磁気1": "em1", "電磁気2": "em2" };
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const payloadPath = path.join(root, "data", "problems", "app_import_payload_problem.jsonl");
const prisma = new PrismaClient();

async function readPayload() {
  const lines = (await readFile(payloadPath, "utf8"))
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  const rows = lines.map((line, index) => {
    try {
      return payloadSchema.parse(JSON.parse(line));
    } catch (error) {
      throw new Error(`Invalid canonical payload at line ${index + 1}: ${error.message}`);
    }
  });
  const ids = new Set(rows.map((row) => row.appQuestionId));
  if (rows.length !== EXPECTED_COUNT || ids.size !== EXPECTED_COUNT) {
    throw new Error(`Canonical payload must contain ${EXPECTED_COUNT} unique questions; got ${rows.length} rows and ${ids.size} unique IDs.`);
  }
  return rows;
}

function problemData(row) {
  return {
    course: courseMap[row.course],
    unit: row.unit,
    topic: row.topic,
    subtopic: row.subtopic,
    difficulty: row.difficulty,
    sourceType: row.sourceType,
    sourceYear: row.sourceYear,
    questionType: row.questionType,
    answerKind: row.answerKind,
    calculationMode: row.calculationMode,
    parentId: row.parentId ?? null,
    parentSourceId: row.parentSourceId,
    title: row.title,
    questionText: row.questionText,
    choicesJson: row.choices.length ? JSON.stringify(row.choices) : null,
    correctAnswer: row.correctAnswer,
    solution: row.solution,
    explanation: row.explanation,
    keyConceptsJson: JSON.stringify(row.keyConcepts),
    requiredFormulasJson: JSON.stringify(row.requiredFormulas),
    commonMistakesJson: JSON.stringify(row.commonMistakes),
    figureUrlsJson: JSON.stringify(row.figureUrls),
    estimatedTimeSec: row.estimatedTimeSec,
    internalMetadataJson: JSON.stringify(row.internalMetadata),
  };
}

async function importRows(rows) {
  for (let offset = 0; offset < rows.length; offset += 100) {
    const batch = rows.slice(offset, offset + 100);
    await prisma.$transaction(
      batch.map((row) =>
        prisma.problem.upsert({
          where: { appQuestionId: row.appQuestionId },
          update: problemData(row),
          create: {
            appQuestionId: row.appQuestionId,
            ...problemData(row),
            ...INITIAL_STATE,
          },
        }),
      ),
    );
  }
}

async function verify(rows) {
  const expectedIds = rows.map((row) => row.appQuestionId);
  const imported = await prisma.problem.findMany({
    where: { appQuestionId: { in: expectedIds } },
    select: {
      appQuestionId: true,
      isActive: true,
      humanReviewStatus: true,
      verificationStatus: true,
      appReadyStatus: true,
    },
  });
  const ids = imported.map((problem) => problem.appQuestionId).filter(Boolean);
  const unexpectedCount = await prisma.problem.count({
    where: { appQuestionId: { not: null, notIn: expectedIds } },
  });
  const summary = {
    expectedCount: EXPECTED_COUNT,
    importedCount: imported.length,
    duplicateAppQuestionIdCount: ids.length - new Set(ids).size,
    missingAppQuestionIdCount: EXPECTED_COUNT - new Set(ids).size,
    unexpectedCanonicalCount: unexpectedCount,
    activeCount: imported.filter((problem) => problem.isActive).length,
    nonUnreviewedCount: imported.filter((problem) => problem.humanReviewStatus !== "unreviewed").length,
    nonDraftCount: imported.filter((problem) => problem.verificationStatus !== "draft").length,
    nonPendingReviewCount: imported.filter((problem) => problem.appReadyStatus !== "pending_human_review").length,
  };
  if (Object.entries(summary).some(([key, value]) => key !== "expectedCount" && value !== (key === "importedCount" ? EXPECTED_COUNT : 0))) {
    throw new Error(`Question import verification failed: ${JSON.stringify(summary)}`);
  }
  return summary;
}

async function main() {
  const rows = await readPayload();
  if (!process.argv.includes("--verify-only")) await importRows(rows);
  console.log(JSON.stringify(await verify(rows), null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
