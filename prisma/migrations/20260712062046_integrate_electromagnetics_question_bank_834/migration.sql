-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appQuestionId" TEXT,
    "course" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "subtopic" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "sourceType" TEXT NOT NULL DEFAULT 'exercise',
    "sourceYear" INTEGER,
    "questionType" TEXT NOT NULL DEFAULT 'legacy',
    "answerKind" TEXT NOT NULL DEFAULT 'short_text',
    "calculationMode" TEXT NOT NULL DEFAULT 'mixed',
    "parentId" TEXT,
    "parentSourceId" TEXT,
    "title" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "choicesJson" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "keyConceptsJson" TEXT NOT NULL DEFAULT '[]',
    "requiredFormulasJson" TEXT NOT NULL DEFAULT '[]',
    "commonMistakesJson" TEXT NOT NULL DEFAULT '[]',
    "figureUrlsJson" TEXT NOT NULL DEFAULT '[]',
    "humanReviewStatus" TEXT NOT NULL DEFAULT 'unreviewed',
    "verificationStatus" TEXT NOT NULL DEFAULT 'draft',
    "appReadyStatus" TEXT NOT NULL DEFAULT 'pending_human_review',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "estimatedTimeSec" INTEGER NOT NULL DEFAULT 300,
    "internalMetadataJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Problem" ("choicesJson", "commonMistakesJson", "correctAnswer", "course", "createdAt", "difficulty", "explanation", "figureUrlsJson", "id", "keyConceptsJson", "questionText", "requiredFormulasJson", "solution", "sourceType", "sourceYear", "subtopic", "title", "topic", "unit", "updatedAt") SELECT "choicesJson", "commonMistakesJson", "correctAnswer", "course", "createdAt", "difficulty", "explanation", "figureUrlsJson", "id", "keyConceptsJson", "questionText", "requiredFormulasJson", "solution", "sourceType", "sourceYear", "subtopic", "title", "topic", "unit", "updatedAt" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
CREATE UNIQUE INDEX "Problem_appQuestionId_key" ON "Problem"("appQuestionId");
CREATE INDEX "Problem_course_sourceType_idx" ON "Problem"("course", "sourceType");
CREATE INDEX "Problem_course_unit_topic_idx" ON "Problem"("course", "unit", "topic");
CREATE INDEX "Problem_course_isActive_humanReviewStatus_verificationStatus_idx" ON "Problem"("course", "isActive", "humanReviewStatus", "verificationStatus");
CREATE INDEX "Problem_course_unit_topic_difficulty_idx" ON "Problem"("course", "unit", "topic", "difficulty");
CREATE INDEX "Problem_parentSourceId_idx" ON "Problem"("parentSourceId");
CREATE INDEX "Problem_appQuestionId_idx" ON "Problem"("appQuestionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
