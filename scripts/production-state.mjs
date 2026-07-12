import "dotenv/config";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  const compareIndex = process.argv.indexOf("--compare");
  if (compareIndex === -1) {
    console.log(JSON.stringify(current));
    return;
  }
  const baselinePath = process.argv[compareIndex + 1];
  if (!baselinePath) throw new Error("--compare requires a baseline JSON path.");
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const regressions = Object.keys(baseline).filter((key) => (
    typeof baseline[key] === "number" && current[key] < baseline[key]
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
