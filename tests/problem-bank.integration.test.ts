import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { publishedProblemWhere } from "../src/lib/problem-policy";
import { rankSimilarProblems } from "../src/lib/problem-selection";
import { toProblemView } from "../src/lib/problems";

const prisma = new PrismaClient();

test("database publication gate, learner sanitization, and similar search", async () => {
  const originals = await prisma.problem.findMany({ where: { appQuestionId: { in: ["Q0001", "Q0002"] } } });
  assert.equal(originals.length, 2);
  const source = originals.find((problem) => problem.appQuestionId === "Q0001")!;
  const candidate = originals.find((problem) => problem.appQuestionId === "Q0002")!;
  try {
    for (const state of [
      { humanReviewStatus: "unreviewed", verificationStatus: "draft", isActive: false },
      { humanReviewStatus: "accepted", verificationStatus: "draft", isActive: true },
      { humanReviewStatus: "unreviewed", verificationStatus: "verified", isActive: true },
      { humanReviewStatus: "accepted", verificationStatus: "verified", isActive: false },
    ]) {
      await prisma.problem.update({ where: { id: source.id }, data: state });
      assert.equal(await prisma.problem.findFirst({ where: { id: source.id, ...publishedProblemWhere } }), null);
    }

    await prisma.problem.updateMany({
      where: { id: { in: [source.id, candidate.id] } },
      data: { humanReviewStatus: "accepted", verificationStatus: "verified", isActive: true },
    });
    const publishedSource = await prisma.problem.findFirst({ where: { id: source.id, ...publishedProblemWhere } });
    assert.ok(publishedSource);
    const candidates = await prisma.problem.findMany({ where: { id: candidate.id, course: source.course, ...publishedProblemWhere } });
    assert.equal(rankSimilarProblems(publishedSource, candidates, [])[0]?.id, candidate.id);

    const learner = toProblemView(publishedSource);
    for (const hidden of ["sourceType", "sourceYear", "parentSourceId", "internalMetadata", "correctAnswer", "solution", "explanation"]) {
      assert.equal(Object.hasOwn(learner, hidden), false, `${hidden} must not be in learner output`);
    }
  } finally {
    await Promise.all(originals.map((problem) => prisma.problem.update({
      where: { id: problem.id },
      data: {
        humanReviewStatus: problem.humanReviewStatus,
        verificationStatus: problem.verificationStatus,
        appReadyStatus: problem.appReadyStatus,
        isActive: problem.isActive,
      },
    })));
  }
});

test.after(async () => prisma.$disconnect());
