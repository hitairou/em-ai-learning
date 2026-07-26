import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const publicUrl = process.env.PUBLIC_URL ?? "https://edesign.tairoh.com";
const publicOrigin = new URL(publicUrl);
const baseUrl = process.env.SESSION_VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
const forwardedHost = process.env.SESSION_VERIFY_HOST ?? publicOrigin.host;
const forwardedProto = process.env.SESSION_VERIFY_PROTO ?? publicOrigin.protocol.replace(":", "");
const marker = `session-verify-${Date.now()}-${crypto.randomUUID()}`;
const password = `A1${crypto.randomUUID().replaceAll("-", "")}z9`;
const pcUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari/537.36";
const mobileUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";

const createdUserIds = [];

try {
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await createUser({
    email: `${marker}-admin@example.test`,
    name: "Session Verify Admin",
    passwordHash,
    role: "admin",
  });
  const learner = await createUser({
    email: `${marker}-learner@example.test`,
    name: "Session Verify Learner",
    passwordHash,
    role: "user",
  });

  const pc = await login(learner.email, pcUserAgent);
  await visitAll("pc", pc.cookie, pcUserAgent, ["/home", "/practice", "/review", "/profile"]);

  const adminSession = await login(admin.email, pcUserAgent);
  await visitAll("admin-pc", adminSession.cookie, pcUserAgent, ["/admin/problems", "/admin/materials", "/home", "/admin/problems"]);

  const mobile = await login(learner.email, mobileUserAgent);
  await visitAll("mobile", mobile.cookie, mobileUserAgent, ["/home", "/practice", "/review", "/profile"]);

  await expectStatus("legacy-invalid-new-valid", "/home", {
    userAgent: pcUserAgent,
    cookie: `em-study-session=invalid; ${pc.cookie}`,
    expected: 200,
  });
  await expectStatus("duplicate-new-valid-second", "/home", {
    userAgent: pcUserAgent,
    cookie: `__Host-em-study-session=invalid; ${pc.cookie}`,
    expected: 200,
  });

  const logout = await request("/api/auth/logout", {
    method: "POST",
    userAgent: pcUserAgent,
    cookie: pc.cookie,
  });
  assertStatus("logout", logout.status, 200);
  const logoutCookies = splitSetCookie(logout.headers.get("set-cookie")).map(cookieAttributes);
  assertCookieDeleted(logoutCookies, "__Host-em-study-session");
  assertCookieDeleted(logoutCookies, "em-study-session");

  await expectStatus("logout-blocks-home", "/home", {
    userAgent: pcUserAgent,
    cookie: mergeCookieHeader(pc.cookie, logout.headers.get("set-cookie")),
    expected: 307,
  });

  await cleanup();
  console.log(JSON.stringify({
    event: "SESSION_VERIFY_RESULT",
    status: "success",
    cookieName: "__Host-em-study-session",
    pcRoutes: 4,
    adminRoutes: 4,
    mobileRoutes: 4,
    legacyCookie: "ignored_when_new_cookie_valid",
    duplicateCookie: "valid_candidate_selected",
    logout: "new_and_legacy_deleted",
    usersDeleted: true,
  }));
} catch (error) {
  await cleanup().catch(() => undefined);
  console.error(JSON.stringify({
    event: "SESSION_VERIFY_RESULT",
    status: "failed",
    reason: error instanceof Error ? error.message : "unknown",
  }));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

async function createUser(input) {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      selectedCourse: "em1",
      learningPurpose: input.role === "admin" ? "exam" : "foundation",
      onboardingCompleted: true,
      diagnosticCompleted: true,
    },
  });
  createdUserIds.push(user.id);
  return user;
}

async function login(email, userAgent) {
  const response = await request("/api/auth/login", {
    method: "POST",
    userAgent,
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });
  assertStatus("login", response.status, 200);
  const setCookies = splitSetCookie(response.headers.get("set-cookie"));
  const sessionCookie = setCookies.find((cookie) => cookie.startsWith("__Host-em-study-session="));
  if (!sessionCookie) throw new Error("login did not issue host-prefixed session cookie");
  const attributes = setCookies.map(cookieAttributes);
  assertHostPrefixCookie(attributes);
  assertCookieDeleted(attributes, "em-study-session");
  return { cookie: cookiePair(sessionCookie) };
}

async function visitAll(label, cookie, userAgent, paths) {
  for (const path of paths) {
    await expectStatus(`${label}:${path}`, path, { userAgent, cookie, expected: 200 });
  }
}

async function expectStatus(label, path, options) {
  const response = await request(path, { userAgent: options.userAgent, cookie: options.cookie });
  assertStatus(label, response.status, options.expected);
  return response;
}

async function request(path, options = {}) {
  const headers = {
    Host: forwardedHost,
    "X-Forwarded-Host": forwardedHost,
    "X-Forwarded-Proto": forwardedProto,
    "User-Agent": options.userAgent ?? pcUserAgent,
    ...(options.headers ?? {}),
  };
  if (options.cookie) headers.Cookie = options.cookie;
  return fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body,
    redirect: "manual",
  });
}

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label} returned ${actual}, expected ${expected}`);
  }
}

function assertHostPrefixCookie(attributes) {
  const session = attributes.find((cookie) => cookie.name === "__Host-em-study-session");
  if (!session) throw new Error("host-prefixed session cookie is missing");
  if (!session.secure || !session.httpOnly || session.sameSite.toLowerCase() !== "lax" || session.path !== "/" || session.domain || session.maxAge !== 604800) {
    throw new Error("host-prefixed session cookie attributes are invalid");
  }
}

function assertCookieDeleted(attributes, name) {
  const cookie = attributes.find((item) => item.name === name);
  if (!cookie || cookie.maxAge !== 0) {
    throw new Error(`${name} deletion cookie is missing`);
  }
}

function splitSetCookie(value) {
  return value ? value.split(/,(?=\s*[^;,]+=)/g).map((item) => item.trim()).filter(Boolean) : [];
}

function cookiePair(setCookie) {
  return setCookie.split(";", 1)[0];
}

function cookieAttributes(setCookie) {
  const parts = setCookie.split(";").map((part) => part.trim());
  const cookie = {
    name: parts[0].split("=", 1)[0],
    secure: false,
    httpOnly: false,
    sameSite: "",
    path: "",
    domain: false,
    maxAge: null,
  };
  for (const part of parts.slice(1)) {
    const [rawKey, ...rest] = part.split("=");
    const key = rawKey.toLowerCase();
    const value = rest.join("=");
    if (key === "secure") cookie.secure = true;
    else if (key === "httponly") cookie.httpOnly = true;
    else if (key === "samesite") cookie.sameSite = value;
    else if (key === "path") cookie.path = value;
    else if (key === "domain") cookie.domain = true;
    else if (key === "max-age") cookie.maxAge = Number(value);
  }
  return cookie;
}

function mergeCookieHeader(existingCookie, setCookieHeader) {
  const jar = new Map(existingCookie.split(";").map((part) => {
    const [name, ...rest] = part.trim().split("=");
    return [name, rest.join("=")];
  }));
  for (const setCookie of splitSetCookie(setCookieHeader)) {
    const pair = cookiePair(setCookie);
    const [name, ...rest] = pair.split("=");
    const maxAgeZero = /(?:^|;)\s*max-age=0(?:;|$)/i.test(setCookie);
    if (maxAgeZero) jar.delete(name);
    else jar.set(name, rest.join("="));
  }
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function cleanup() {
  if (!createdUserIds.length) return;
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  createdUserIds.length = 0;
}
