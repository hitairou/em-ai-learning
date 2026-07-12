import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const manifestPath = path.resolve(process.argv[2] ?? "data/problems/review_state_manifest.json");
const entrySchema = z.object({
  appQuestionId: z.string().regex(/^Q\d{4}$/),
  humanReviewStatus: z.enum(["unreviewed", "accepted", "needs_fix", "rejected"]),
  verificationStatus: z.enum(["draft", "verified"]),
  appReadyStatus: z.string().min(1).max(100),
  isActive: z.boolean(),
}).strict();

async function main() {
  const entries = z.array(entrySchema).parse(JSON.parse(await readFile(manifestPath, "utf8")));
  const ids = entries.map((entry) => entry.appQuestionId);
  if (new Set(ids).size !== ids.length) throw new Error("Review manifest contains duplicate appQuestionId values.");
  for (const entry of entries) {
    if (entry.isActive && (entry.humanReviewStatus !== "accepted" || entry.verificationStatus !== "verified")) {
      throw new Error(`Invalid active review state for ${entry.appQuestionId}.`);
    }
  }
  const existing = await prisma.problem.findMany({
    where: { appQuestionId: { in: ids } },
    select: { appQuestionId: true },
  });
  if (existing.length !== entries.length) throw new Error("Review manifest references a missing canonical question.");
  for (let offset = 0; offset < entries.length; offset += 100) {
    const batch = entries.slice(offset, offset + 100);
    await prisma.$transaction(batch.map((entry) => prisma.problem.update({
      where: { appQuestionId: entry.appQuestionId },
      data: {
        humanReviewStatus: entry.humanReviewStatus,
        verificationStatus: entry.verificationStatus,
        appReadyStatus: entry.appReadyStatus,
        isActive: entry.isActive,
      },
    })));
  }
  console.log(JSON.stringify({ manifestCount: entries.length, appliedCount: entries.length }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
