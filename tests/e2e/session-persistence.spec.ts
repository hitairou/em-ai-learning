import assert from "node:assert/strict";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const execFileAsync = promisify(execFile);
const repoRoot = process.cwd();
const nextCli = path.join(repoRoot, "node_modules", "next", "dist", "bin", "next");
const migrationFiles = [
  path.join(repoRoot, "prisma", "migrations", "20260629130000_init", "migration.sql"),
  path.join(repoRoot, "prisma", "migrations", "20260712062046_integrate_electromagnetics_question_bank_834", "migration.sql"),
];

let server: ChildProcess | null = null;
let prisma: PrismaClient | null = null;
let directory = "";
let baseUrl = "";
let adminEmail = "";
let learnerEmail = "";
let password = "";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "em-ai-learning-e2e-"));
  const dbPath = path.join(directory, "test.db");
  const uploadsPath = path.join(directory, "uploads");
  password = `A1${randomUUID().replaceAll("-", "")}z9`;
  adminEmail = `admin-${randomUUID()}@example.test`;
  learnerEmail = `learner-${randomUUID()}@example.test`;

  const env = {
    ...process.env,
    AUTH_SECRET: "e2e-session-secret-with-at-least-32-chars",
    DATABASE_URL: sqliteUrl(dbPath),
    NEXT_TELEMETRY_DISABLED: "1",
    NODE_ENV: "development" as const,
    UPLOAD_DIR: uploadsPath,
  };

  await mkdir(uploadsPath);
  prisma = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
  await applyMigrations(prisma);
  await createUser(prisma, {
    email: adminEmail,
    role: "admin",
    selectedCourse: "em1",
    learningPurpose: "exam",
    onboardingCompleted: true,
    diagnosticCompleted: true,
  });
  await createUser(prisma, {
    email: learnerEmail,
    selectedCourse: "em1",
    learningPurpose: "foundation",
    onboardingCompleted: true,
    diagnosticCompleted: true,
  });

  const port = await availablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  let serverOutput = "";
  server = spawn(process.execPath, [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: repoRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.on("data", (chunk) => { serverOutput += String(chunk); });
  server.stderr?.on("data", (chunk) => { serverOutput += String(chunk); });
  await waitForServer(baseUrl, server, () => serverOutput);
});

test.afterAll(async () => {
  if (prisma) await prisma.$disconnect();
  if (server) await stopServer(server);
  if (directory) await rm(directory, { recursive: true, force: true });
});

test("PC Chromium keeps the admin session across protected navigation", async ({ page }) => {
  await login(page, adminEmail);
  await assertSignedInPage(page, "/admin/problems");

  for (const route of ["/home", "/practice", "/review", "/history", "/profile", "/admin/problems"]) {
    await page.goto(`${baseUrl}${route}`);
    await assertSignedInPage(page, route);
    await page.reload();
    await assertSignedInPage(page, route);
  }

  await page.goto(`${baseUrl}/home`);
  await page.locator('a[href="/practice"]').first().click();
  await assertSignedInPage(page, "/practice");
  await page.goto(`${baseUrl}/review`);
  await page.goto(`${baseUrl}/history`);
  await page.goBack();
  await assertSignedInPage(page, "/review");
  await page.goForward();
  await assertSignedInPage(page, "/history");
});

test("new browser contexts keep sessions after login", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await login(page, learnerEmail);
    for (const route of ["/home", "/practice", "/review", "/history", "/profile"]) {
      await page.goto(`${baseUrl}${route}`);
      await assertSignedInPage(page, route);
    }
  } finally {
    await context.close();
  }
});

test("legacy invalid cookies do not break a fresh login", async ({ context, page }) => {
  await context.addCookies([{ name: "em-study-session", value: "invalid", url: baseUrl }]);
  await login(page, learnerEmail);
  for (const route of ["/home", "/practice", "/review", "/history", "/profile"]) {
    await page.goto(`${baseUrl}${route}`);
    await assertSignedInPage(page, route);
  }
});

test("mobile viewport keeps the learner session", async ({ browser }) => {
  const context = await browser.newContext({
    isMobile: true,
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  });
  const page = await context.newPage();
  try {
    await login(page, learnerEmail);
    for (const route of ["/home", "/practice", "/review", "/history", "/profile"]) {
      await page.goto(`${baseUrl}${route}`);
      await assertSignedInPage(page, route);
    }
  } finally {
    await context.close();
  }
});

test("logout removes access to protected pages", async ({ page }) => {
  await login(page, learnerEmail);
  await page.goto(`${baseUrl}/logout`);
  await expect(page).toHaveURL(/\/$/);
  await page.goto(`${baseUrl}/home`);
  await expect(page).toHaveURL(/\/login\?next=%2Fhome$/);
});

async function login(page: Page, email: string) {
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

async function assertSignedInPage(page: Page, route: string) {
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(route)}(?:$|[?#])`));
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

async function createUser(prismaClient: PrismaClient, input: {
  email: string;
  role?: string;
  selectedCourse?: string | null;
  learningPurpose?: string | null;
  onboardingCompleted?: boolean;
  diagnosticCompleted?: boolean;
}) {
  return prismaClient.user.create({
    data: {
      name: input.role === "admin" ? "Administrator" : "Learner",
      email: input.email,
      passwordHash: await bcrypt.hash(password, 6),
      role: input.role ?? "user",
      selectedCourse: input.selectedCourse ?? null,
      learningPurpose: input.learningPurpose ?? null,
      onboardingCompleted: input.onboardingCompleted ?? false,
      diagnosticCompleted: input.diagnosticCompleted ?? false,
    },
  });
}

async function applyMigrations(prismaClient: PrismaClient) {
  for (const migrationFile of migrationFiles) {
    const sql = await readFile(migrationFile, "utf8");
    const statements = sql
      .split(/\r?\n/)
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await prismaClient.$executeRawUnsafe(statement);
    }
  }
}

async function availablePort() {
  const netServer = createServer();
  await new Promise<void>((resolve) => netServer.listen(0, "127.0.0.1", resolve));
  const address = netServer.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise<void>((resolve, reject) => netServer.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer(url: string, child: ChildProcess, output: () => string) {
  const started = Date.now();
  while (Date.now() - started < 60_000) {
    if (child.exitCode !== null) {
      throw new Error(`next dev exited early with code ${child.exitCode}\n${output()}`);
    }
    try {
      const response = await fetch(`${url}/login`, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`next dev did not become ready\n${output()}`);
}

async function stopServer(child: ChildProcess) {
  if (!child.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    await execFileAsync("taskkill", ["/pid", String(child.pid), "/t", "/f"]).catch(() => undefined);
    return;
  }
  child.kill("SIGTERM");
}

function sqliteUrl(filePath: string) {
  return `file:${filePath.replace(/\\/g, "/")}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
