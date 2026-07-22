import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { courseAliases } from "../src/lib/courses";
import { publishedProblemWhere } from "../src/lib/problem-policy";
import { rankPracticeProblems, rankSimilarProblems } from "../src/lib/problem-selection";
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

test("published manual problems are selectable through legacy course values and mode fallback", async () => {
  const manualId = "test-manual-published-problem";
  let userId = "test-user-legacy-course";
  const activeEm1Problems = await prisma.problem.findMany({
    where: {
      course: { in: ["em1", "電磁気1", "電磁気Ⅰ", "電磁気I"] },
      isActive: true,
    },
    select: { id: true, isActive: true },
  });

  try {
    await prisma.problem.updateMany({
      where: { id: { in: activeEm1Problems.map((problem) => problem.id) } },
      data: { isActive: false },
    });
    const user = await prisma.user.upsert({
      where: { email: "legacy-course-test@example.com" },
      update: {
        selectedCourse: "電磁気1",
        diagnosticCompleted: true,
        onboardingCompleted: true,
      },
      create: {
        id: userId,
        name: "Legacy Course",
        email: "legacy-course-test@example.com",
        passwordHash: "unused",
        selectedCourse: "電磁気1",
        learningPurpose: "foundation",
        diagnosticCompleted: true,
        onboardingCompleted: true,
      },
    });
    userId = user.id;
    await prisma.problem.upsert({
      where: { id: manualId },
      update: {
        course: "電磁気1",
        difficulty: 4,
        sourceType: "exercise",
        humanReviewStatus: "accepted",
        verificationStatus: "verified",
        appReadyStatus: "ready",
        isActive: true,
      },
      create: {
        id: manualId,
        appQuestionId: null,
        course: "電磁気1",
        unit: "manual unit",
        topic: "manual topic",
        subtopic: "manual topic",
        difficulty: 4,
        sourceType: "exercise",
        title: "Manual published problem",
        questionText: "Manual question",
        correctAnswer: "Manual answer",
        solution: "Manual solution",
        explanation: "Manual explanation",
        humanReviewStatus: "accepted",
        verificationStatus: "verified",
        appReadyStatus: "ready",
        isActive: true,
      },
    });

    const publishedManual = await prisma.problem.findFirst({ where: { id: manualId, ...publishedProblemWhere } });
    assert.ok(publishedManual);
    const baseWhere = { ...publishedProblemWhere, course: { in: courseAliases("電磁気1") } };
    const modeProblems = await prisma.problem.findMany({ where: { ...baseWhere, difficulty: { lte: 2 } } });
    assert.equal(modeProblems.length, 0);
    const fallbackProblems = await prisma.problem.findMany({ where: baseWhere });
    const next = rankPracticeProblems(fallbackProblems, [], [])[0];
    assert.equal(next?.id, manualId);
  } finally {
    await prisma.practiceAttempt.deleteMany({ where: { userId } });
    await prisma.userSkillProfile.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.problem.deleteMany({ where: { id: manualId } });
    await Promise.all(activeEm1Problems.map((problem) => prisma.problem.update({
      where: { id: problem.id },
      data: { isActive: problem.isActive },
    })));
  }
});

test.after(async () => prisma.$disconnect());
