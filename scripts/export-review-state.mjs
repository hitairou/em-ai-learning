import "dotenv/config";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const outputPath = path.resolve(process.argv[2] ?? "data/problems/review_state_manifest.json");

async function main() {
  const questions = await prisma.problem.findMany({
    where: {
      appQuestionId: { not: null },
      OR: [
        { humanReviewStatus: { not: "unreviewed" } },
        { verificationStatus: { not: "draft" } },
        { appReadyStatus: { not: "pending_human_review" } },
        { isActive: true },
      ],
    },
    orderBy: { appQuestionId: "asc" },
    select: {
      appQuestionId: true,
      humanReviewStatus: true,
      verificationStatus: true,
      appReadyStatus: true,
      isActive: true,
    },
  });
  await writeFile(outputPath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ exportedCount: questions.length, outputPath }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
