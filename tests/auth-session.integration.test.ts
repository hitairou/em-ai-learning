import assert from "node:assert/strict";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sessionCookieName } from "../src/lib/auth/session-cookie";
import { PRIVACY_VERSION, TERMS_VERSION } from "../src/lib/legal/config";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const nextCli = path.join(repoRoot, "node_modules", "next", "dist", "bin", "next");
const password = "SessionTest123";
const migrationFiles = [
  path.join(repoRoot, "prisma", "migrations", "20260629130000_init", "migration.sql"),
  path.join(repoRoot, "prisma", "migrations", "20260712062046_integrate_electromagnetics_question_bank_834", "migration.sql"),
  path.join(repoRoot, "prisma", "migrations", "20260802000000_add_legal_upload_governance", "migration.sql"),
];

function sqliteUrl(filePath: string) {
  return `file:${filePath.replace(/\\/g, "/")}`;
}

async function availablePort() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer(baseUrl: string, child: ChildProcess, output: () => string) {
  const started = Date.now();
  while (Date.now() - started < 60_000) {
    if (child.exitCode !== null) {
      throw new Error(`next dev exited early with code ${child.exitCode}\n${output()}`);
    }
    try {
      const response = await fetch(`${baseUrl}/login`, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`next dev did not become ready\n${output()}`);
}

async function stopServer(child: ChildProcess) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    await execFileAsync("taskkill", ["/pid", String(child.pid), "/t", "/f"]).catch(() => undefined);
    return;
  }
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  await exited;
}

async function applyMigrations(prisma: PrismaClient) {
  for (const migrationFile of migrationFiles) {
    const sql = await readFile(migrationFile, "utf8");
    const statements = sql
      .split(/\r?\n/)
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .replaceAll("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS ")
      .replaceAll("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ")
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
  }
}

function sessionCookie(response: Response) {
  const setCookie = response.headers.get("set-cookie");
  const cookieName = sessionCookieName("development");
  assert.ok(setCookie, "login response must set a session cookie");
  assert.match(setCookie, new RegExp(`${cookieName}=`));
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  assert.match(setCookie, /Path=\//i);
  const match = setCookie.match(new RegExp(`${cookieName}=[^;]+`));
  assert.ok(match, "session cookie value must be present");
  return match[0];
}

async function login(baseUrl: string, email: string, query = "") {
  const response = await fetch(`${baseUrl}/api/auth/login${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200);
  const body = await response.json() as { next: string };
  return { body, cookie: sessionCookie(response) };
}

async function createUser(prisma: PrismaClient, input: {
  email: string;
  role?: string;
  selectedCourse?: string | null;
  learningPurpose?: string | null;
  onboardingCompleted?: boolean;
  diagnosticCompleted?: boolean;
}) {
  return prisma.user.create({
    data: {
      name: input.role === "admin" ? "Administrator" : "Learner",
      email: input.email,
      passwordHash: await bcrypt.hash(password, 6),
      role: input.role ?? "user",
      selectedCourse: input.selectedCourse ?? null,
      learningPurpose: input.learningPurpose ?? null,
      onboardingCompleted: input.onboardingCompleted ?? false,
      diagnosticCompleted: input.diagnosticCompleted ?? false,
      termsAcceptedAt: new Date(),
      termsVersion: TERMS_VERSION,
      privacyAcknowledgedAt: new Date(),
      privacyVersion: PRIVACY_VERSION,
    },
  });
}

test("sessions authorize admin pages and learner onboarding in an isolated Next server", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "em-ai-learning-auth-"));
  const dbPath = path.join(directory, "test.db");
  const uploadsPath = path.join(directory, "uploads");
  const env = {
    ...process.env,
    AUTH_SECRET: "test-auth-secret-with-at-least-32-chars",
    DATABASE_URL: sqliteUrl(dbPath),
    NEXT_TELEMETRY_DISABLED: "1",
    NODE_ENV: "development" as const,
    UPLOAD_DIR: uploadsPath,
  };

  let child: ChildProcess | null = null;
  let prisma: PrismaClient | null = null;

  try {
    await mkdir(uploadsPath);
    prisma = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
    await applyMigrations(prisma);
    const admin = await createUser(prisma, {
      email: "admin-auth-session@example.test",
      role: "admin",
      selectedCourse: null,
      learningPurpose: null,
      onboardingCompleted: false,
      diagnosticCompleted: false,
    });
    const learner = await createUser(prisma, {
      email: "learner-auth-session@example.test",
      selectedCourse: null,
      diagnosticCompleted: false,
    });

    const port = await availablePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    let serverOutput = "";
    const server = spawn(process.execPath, [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
      cwd: repoRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child = server;
    server.stdout?.on("data", (chunk) => { serverOutput += String(chunk); });
    server.stderr?.on("data", (chunk) => { serverOutput += String(chunk); });
    await waitForServer(baseUrl, server, () => serverOutput);

    const guestAdminPage = await fetch(`${baseUrl}/admin/problems`, { redirect: "manual" });
    assert.equal(guestAdminPage.status, 307);
    assert.equal(new URL(guestAdminPage.headers.get("location")!, baseUrl).pathname, "/login");

    const adminLogin = await login(baseUrl, admin.email, "?next=https://evil.example/admin");
    assert.equal(adminLogin.body.next, "/admin/problems");

    const adminProblemsPage = await fetch(`${baseUrl}/admin/problems`, {
      headers: { Cookie: adminLogin.cookie },
      redirect: "manual",
    });
    assert.equal(adminProblemsPage.status, 200);

    const adminMaterialsPage = await fetch(`${baseUrl}/admin/materials`, {
      headers: { Cookie: adminLogin.cookie },
      redirect: "manual",
    });
    assert.equal(adminMaterialsPage.status, 200);

    const adminProblemsApi = await fetch(`${baseUrl}/api/admin/problems`, {
      headers: { Cookie: adminLogin.cookie },
    });
    assert.equal(adminProblemsApi.status, 200);
    const adminProblemsBody = await adminProblemsApi.json() as { problems: unknown[] };
    assert.ok(Array.isArray(adminProblemsBody.problems));

    const guestMeApi = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(guestMeApi.status, 401);

    const duplicateAdminApi = await fetch(`${baseUrl}/api/admin/problems`, {
      headers: { Cookie: `${sessionCookieName("development")}=invalid; ${adminLogin.cookie}` },
    });
    assert.equal(duplicateAdminApi.status, 200);

    const duplicateAdminPage = await fetch(`${baseUrl}/admin/problems`, {
      headers: { Cookie: `${sessionCookieName("development")}=invalid; ${adminLogin.cookie}` },
      redirect: "manual",
    });
    assert.equal(duplicateAdminPage.status, 200);

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: adminLogin.cookie },
    });
    assert.equal(logoutResponse.status, 200);
    const logoutSetCookie = logoutResponse.headers.get("set-cookie");
    assert.ok(logoutSetCookie);
    assert.match(logoutSetCookie, new RegExp(`${sessionCookieName("development")}=;`));
    assert.match(logoutSetCookie, /Max-Age=0/i);

    const learnerLogin = await login(baseUrl, learner.email);
    assert.equal(learnerLogin.body.next, "/onboarding/course");

    const learnerAdminPage = await fetch(`${baseUrl}/admin/problems`, {
      headers: { Cookie: learnerLogin.cookie },
      redirect: "manual",
    });
    if (learnerAdminPage.status === 307) {
      assert.equal(new URL(learnerAdminPage.headers.get("location")!, baseUrl).pathname, "/home");
    } else {
      assert.equal(learnerAdminPage.status, 200);
      const learnerAdminHtml = await learnerAdminPage.text();
      assert.match(learnerAdminHtml, /NEXT_REDIRECT|\/home/);
      assert.doesNotMatch(learnerAdminHtml, /adminHeader|ProblemEditorForm/);
    }

    const learnerAdminApi = await fetch(`${baseUrl}/api/admin/problems`, {
      headers: { Cookie: learnerLogin.cookie },
    });
    assert.equal(learnerAdminApi.status, 403);

    const courseResponse = await fetch(`${baseUrl}/api/onboarding/course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: learnerLogin.cookie,
      },
      body: JSON.stringify({ course: "em1", learningPurpose: "foundation" }),
    });
    assert.equal(courseResponse.status, 200);

    const savedLearner = await prisma.user.findUniqueOrThrow({ where: { id: learner.id } });
    assert.equal(savedLearner.selectedCourse, "em1");
    assert.equal(savedLearner.learningPurpose, "foundation");
    assert.equal(savedLearner.onboardingCompleted, false);
    assert.equal(savedLearner.diagnosticCompleted, false);

    const diagnosticPage = await fetch(`${baseUrl}/onboarding/diagnostic`, {
      headers: { Cookie: learnerLogin.cookie },
      redirect: "manual",
    });
    assert.equal(diagnosticPage.status, 200);

    const learnerDiagnosticLogin = await login(baseUrl, learner.email);
    assert.equal(learnerDiagnosticLogin.body.next, "/onboarding/diagnostic");

    const invalidCookieResponse = await fetch(`${baseUrl}/api/onboarding/course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${sessionCookieName("development")}=invalid`,
      },
      body: JSON.stringify({ course: "em1", learningPurpose: "foundation" }),
    });
    assert.equal(invalidCookieResponse.status, 401);
  } finally {
    if (prisma) await prisma.$disconnect();
    if (child) await stopServer(child);
    await rm(directory, { recursive: true, force: true });
  }
});
