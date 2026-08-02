import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(".");
const read = (file: string) => readFile(path.join(root, file), "utf8");

test("legal pages, versions, and upload governance are present", async () => {
  const [terms, privacy, schema, migration, upload, chunk, cleanup] = await Promise.all([
    read("src/app/terms/page.tsx"), read("src/app/privacy/page.tsx"), read("prisma/schema.prisma"),
    read("prisma/migrations/20260802000000_add_legal_upload_governance/migration.sql"), read("src/app/api/questions/upload/route.ts"),
    read("src/app/api/questions/upload/chunk/route.ts"), read("scripts/cleanup-expired-uploads.mjs"),
  ]);
  assert.match(terms, /利用規約/); assert.match(terms, /TERMS_VERSION/); assert.match(privacy, /OpenAI API/);
  assert.match(schema, /termsAcceptedAt/); assert.match(schema, /originalFileDeleteAt/); assert.match(migration, /ALTER TABLE/);
  assert.match(upload, /rightsConfirmed/); assert.match(chunk, /rightsConfirmed/); assert.match(cleanup, /--dry-run/);
});

test("all Responses API calls explicitly disable storage", async () => {
  const files = ["analyzeQuestion.ts", "generateHint.ts", "generatePractice.ts", "generateSimilarProblem.ts", "gradeAnswer.ts", "gradeImageAnswer.ts"];
  for (const file of files) {
    const source = await read(`src/lib/ai/${file}`);
    assert.match(source, /responses\.(create|parse)\(/);
    assert.match(source, /store:\s*false/);
  }
});
