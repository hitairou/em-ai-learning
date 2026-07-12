import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);

function sqliteUrl(filePath: string) {
  return `file:${filePath.replace(/\\/g, "/")}`;
}

test("production state can snapshot the legacy pre-migration Problem schema", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "em-ai-learning-state-"));
  const dbPath = path.join(directory, "legacy.db");
  const uploadsPath = path.join(directory, "uploads");
  const env = {
    ...process.env,
    DATABASE_URL: sqliteUrl(dbPath),
    UPLOAD_DIR: uploadsPath,
  };

  try {
    await mkdir(uploadsPath);
    await execFileAsync(process.execPath, ["-e", `
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      const statements = [
        'CREATE TABLE "User" ("id" TEXT NOT NULL PRIMARY KEY, "role" TEXT NOT NULL DEFAULT \\'user\\')',
        'CREATE TABLE "Problem" ("id" TEXT NOT NULL PRIMARY KEY, "course" TEXT NOT NULL, "unit" TEXT NOT NULL, "topic" TEXT NOT NULL, "title" TEXT NOT NULL, "questionText" TEXT NOT NULL, "correctAnswer" TEXT NOT NULL, "solution" TEXT NOT NULL, "explanation" TEXT NOT NULL)',
        'CREATE TABLE "PracticeAttempt" ("id" TEXT NOT NULL PRIMARY KEY)',
        'CREATE TABLE "DiagnosticAttempt" ("id" TEXT NOT NULL PRIMARY KEY)',
        'CREATE TABLE "DiagnosticAnswer" ("id" TEXT NOT NULL PRIMARY KEY)',
        'CREATE TABLE "QuestionSession" ("id" TEXT NOT NULL PRIMARY KEY)',
        'CREATE TABLE "ChatMessage" ("id" TEXT NOT NULL PRIMARY KEY)',
        'CREATE TABLE "Material" ("id" TEXT NOT NULL PRIMARY KEY)',
        'CREATE TABLE "GeneratedSimilarProblem" ("id" TEXT NOT NULL PRIMARY KEY)',
        'INSERT INTO "User" ("id", "role") VALUES (\\'u1\\', \\'admin\\')',
        'INSERT INTO "Problem" ("id", "course", "unit", "topic", "title", "questionText", "correctAnswer", "solution", "explanation") VALUES (\\'p1\\', \\'em\\', \\'u\\', \\'t\\', \\'title\\', \\'question\\', \\'answer\\', \\'solution\\', \\'explanation\\')'
      ];
      (async () => {
        for (const statement of statements) await prisma.$executeRawUnsafe(statement);
        await prisma.$disconnect();
      })().catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
      });
    `], { env });

    const { stdout } = await execFileAsync(process.execPath, ["scripts/production-state.mjs", "--summary"], { env });

    assert.match(stdout, /adminCount=1/);
    assert.match(stdout, /canonicalQuestionCount=0/);
    assert.match(stdout, /publishedQuestionCount=0/);
    assert.match(stdout, /invalidPublishedQuestionCount=0/);
    assert.match(stdout, /legacyProblemCount=1/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
