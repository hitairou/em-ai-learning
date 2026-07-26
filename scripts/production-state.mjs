import "dotenv/config";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function tableColumns(tableName) {
  const escaped = tableName.replaceAll('"', '""');
  const rows = await prisma.$queryRawUnsafe(`PRAGMA table_info("${escaped}")`);
  return new Set(rows.map((row) => String(row.name)));
}

async function uploadStats(directory) {
  let uploadFileCount = 0;
  let uploadBytes = 0;
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true }).catch(() => [])) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(fullPath);
      else if (entry.isFile()) {
        uploadFileCount += 1;
        uploadBytes += (await stat(fullPath)).size;
      }
    }
  }
  await visit(directory);
  return { uploadFileCount, uploadBytes };
}

async function snapshot() {
  const problemColumns = await tableColumns("Problem");
  const hasAppQuestionId = problemColumns.has("appQuestionId");
  const hasQuestionGateColumns = [
    "appQuestionId",
    "sourceType",
    "isActive",
    "humanReviewStatus",
    "verificationStatus",
  ].every((column) => problemColumns.has(column));
  const totalProblemCount = await prisma.problem.count();
  const canonicalQuestionCount = hasAppQuestionId
    ? await prisma.problem.count({ where: { appQuestionId: { not: null } } })
    : 0;
  const canonicalPublishedQuestionCount = hasQuestionGateColumns
    ? await prisma.problem.count({
      where: {
        appQuestionId: { not: null },
        isActive: true,
        humanReviewStatus: "accepted",
        verificationStatus: "verified",
        sourceType: { not: "diagnostic" },
      },
    })
    : 0;
  const publishedQuestionCount = hasQuestionGateColumns
    ? await prisma.problem.count({
      where: {
        isActive: true,
        humanReviewStatus: "accepted",
        verificationStatus: "verified",
        sourceType: { not: "diagnostic" },
      },
    })
    : 0;
  const invalidPublishedQuestionCount = hasQuestionGateColumns
    ? await prisma.problem.count({
      where: {
        isActive: true,
        sourceType: { not: "diagnostic" },
        OR: [
          { humanReviewStatus: { not: "accepted" } },
          { verificationStatus: { not: "verified" } },
        ],
      },
    })
    : 0;
  const legacyProblemCount = hasAppQuestionId
    ? await prisma.problem.count({ where: { appQuestionId: null } })
    : totalProblemCount;
  const manualPublishedQuestionCount = hasQuestionGateColumns
    ? await prisma.problem.count({
      where: {
        appQuestionId: null,
        isActive: true,
        humanReviewStatus: "accepted",
        verificationStatus: "verified",
        sourceType: { not: "diagnostic" },
      },
    })
    : 0;

  const [
    userCount,
    adminCount,
    practiceAttemptCount,
    diagnosticAttemptCount,
    diagnosticAnswerCount,
    questionSessionCount,
    chatMessageCount,
    materialCount,
    generatedSimilarProblemCount,
    uploads,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.practiceAttempt.count(),
    prisma.diagnosticAttempt.count(),
    prisma.diagnosticAnswer.count(),
    prisma.questionSession.count(),
    prisma.chatMessage.count(),
    prisma.material.count(),
    prisma.generatedSimilarProblem.count(),
    uploadStats(process.env.UPLOAD_DIR ?? "/data/uploads"),
  ]);
  return {
    userCount,
    adminCount,
    canonicalQuestionCount,
    canonicalPublishedQuestionCount,
    publishedQuestionCount,
    unpublishedQuestionCount: canonicalQuestionCount - canonicalPublishedQuestionCount,
    invalidPublishedQuestionCount,
    legacyProblemCount,
    manualPublishedQuestionCount,
    practiceAttemptCount,
    diagnosticAttemptCount,
    diagnosticAnswerCount,
    questionSessionCount,
    chatMessageCount,
    materialCount,
    generatedSimilarProblemCount,
    ...uploads,
  };
}

async function main() {
  const current = await snapshot();
  const fieldIndex = process.argv.indexOf("--field");
  if (fieldIndex !== -1) {
    const field = process.argv[fieldIndex + 1];
    if (!field || !(field in current)) throw new Error("--field requires a known snapshot field.");
    console.log(current[field]);
    return;
  }
  if (process.argv.includes("--summary")) {
    console.log(Object.entries(current).map(([key, value]) => `${key}=${value}`).join(" "));
    return;
  }
  const compareIndex = process.argv.indexOf("--compare");
  if (compareIndex === -1) {
    console.log(JSON.stringify(current));
    return;
  }
  const baselinePath = process.argv[compareIndex + 1];
  if (!baselinePath) throw new Error("--compare requires a baseline JSON path.");
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const allowedDecreases = new Set([
    "unpublishedQuestionCount",
    "invalidPublishedQuestionCount",
    "legacyDiagnosticCandidateCount",
  ]);
  const regressions = Object.keys(baseline).filter((key) => (
    typeof baseline[key] === "number" && current[key] < baseline[key] && !allowedDecreases.has(key)
  ));
  if (regressions.length) throw new Error(`Production data count regression: ${regressions.join(", ")}`);
  if (current.adminCount < 1) throw new Error("Production database has no administrator.");
  console.log(JSON.stringify({ baseline, current, regressions }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
