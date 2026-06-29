-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "selectedCourse" TEXT,
    "learningPurpose" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "diagnosticCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "course" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "subtopic" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "sourceType" TEXT NOT NULL DEFAULT 'exercise',
    "sourceYear" INTEGER,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiagnosticAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "DiagnosticAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiagnosticAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "selectedChoice" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answerTimeSec" INTEGER NOT NULL,
    "mistakeType" TEXT NOT NULL,
    CONSTRAINT "DiagnosticAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "DiagnosticAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiagnosticAnswer_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSkillProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "correctRate" REAL NOT NULL DEFAULT 0,
    "averageTimeSec" REAL NOT NULL DEFAULT 0,
    "hintUsageRate" REAL NOT NULL DEFAULT 0,
    "lastStudiedAt" DATETIME,
    "mistakeTypesJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSkillProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PracticeAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "aiFeedback" TEXT NOT NULL,
    "mistakeType" TEXT NOT NULL,
    "answerTimeSec" INTEGER NOT NULL,
    "hintUsedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PracticeAttempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "originalFilePath" TEXT,
    "extractedText" TEXT NOT NULL,
    "detectedTopic" TEXT,
    "aiSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuestionSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "course" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT,
    "extractedText" TEXT NOT NULL,
    "sourceYear" INTEGER,
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GeneratedSimilarProblem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sourceProblemId" TEXT,
    "generatedQuestion" TEXT NOT NULL,
    "generatedSolution" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedSimilarProblem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GeneratedSimilarProblem_sourceProblemId_fkey" FOREIGN KEY ("sourceProblemId") REFERENCES "Problem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Problem_course_sourceType_idx" ON "Problem"("course", "sourceType");
CREATE INDEX "Problem_course_unit_topic_idx" ON "Problem"("course", "unit", "topic");
CREATE INDEX "DiagnosticAttempt_userId_completedAt_idx" ON "DiagnosticAttempt"("userId", "completedAt");
CREATE INDEX "DiagnosticAnswer_attemptId_idx" ON "DiagnosticAnswer"("attemptId");
CREATE INDEX "UserSkillProfile_userId_score_idx" ON "UserSkillProfile"("userId", "score");
CREATE UNIQUE INDEX "UserSkillProfile_userId_course_topic_key" ON "UserSkillProfile"("userId", "course", "topic");
CREATE INDEX "PracticeAttempt_userId_createdAt_idx" ON "PracticeAttempt"("userId", "createdAt");
CREATE INDEX "QuestionSession_userId_createdAt_idx" ON "QuestionSession"("userId", "createdAt");
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
CREATE INDEX "Material_course_type_idx" ON "Material"("course", "type");
CREATE INDEX "GeneratedSimilarProblem_userId_createdAt_idx" ON "GeneratedSimilarProblem"("userId", "createdAt");
