import { readFile, rm, writeFile } from "node:fs/promises";
import { expect, test, type Page, type Request, type Response } from "@playwright/test";

const protectedPaths = ["/home", "/camera", "/practice", "/review", "/history", "/profile"];
const desktopLinkPaths = ["/camera", "/practice", "/review", "/profile"];
const sessionCookieName = "__Host-em-study-session";

interface SafeNetworkEntry {
  id: number;
  url: string;
  method: string;
  resourceType: string;
  navigation: boolean;
  redirectFrom: string | null;
  request: {
    cookieHeaderPresent: boolean;
    cookieCandidateCount: number;
    cookieNames: string[];
    rsc: boolean;
    prefetch: boolean;
    headerNames: string[];
  };
  response?: {
    status: number;
    location: string | null;
    setCookieCount: number;
    setCookies: SafeCookie[];
    cacheControl: string | null;
    vary: string | null;
    xMiddlewareHeaders: Record<string, string>;
    nextHeaders: Record<string, string>;
  };
}

interface SafeCookie {
  name: string;
  domainAttributePresent: boolean;
  path: string | null;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
  maxAge: number | null;
  expiresPresent: boolean;
}

test.describe.configure({ mode: "serial" });

test("production session survives public browser navigation", async ({ browser, browserName }, testInfo) => {
  test.skip(process.env.PRODUCTION_E2E !== "1", "Runs only against the managed production E2E environment");

  const baseURL = process.env.PRODUCTION_E2E_BASE_URL ?? "https://edesign.tairoh.com";
  const password = requiredEnv("PRODUCTION_E2E_PASSWORD");
  const isMobile = testInfo.project.name.includes("mobile");
  const email = requiredEnv(isMobile ? "PRODUCTION_E2E_LEARNER_EMAIL" : "PRODUCTION_E2E_ADMIN_EMAIL");
  const landingPath = isMobile ? "/home" : "/admin/problems";
  const waitMs = Number(process.env.PRODUCTION_E2E_WAIT_MS ?? "0");
  const rawHarPath = testInfo.outputPath("network.raw.har");
  const sanitizedHarPath = testInfo.outputPath("network.sanitized.har");
  const summaryPath = testInfo.outputPath("session-summary.json");
  const entries: SafeNetworkEntry[] = [];
  const pendingCaptures = new Set<Promise<void>>();
  const requestEntries = new WeakMap<Request, SafeNetworkEntry>();
  const context = await browser.newContext({
    baseURL,
    viewport: isMobile ? { width: 393, height: 852 } : { width: 1440, height: 900 },
    userAgent: testInfo.project.use.userAgent,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: isMobile ? 3 : 1,
    recordHar: { path: rawHarPath, content: "omit", mode: "minimal" },
    serviceWorkers: "allow",
  });
  const page = await context.newPage();
  attachNetworkCapture(page, entries, requestEntries, pendingCaptures);

  let cookieMetadata: Array<Record<string, unknown>> = [];
  let loginSetCookies: SafeCookie[] = [];
  let firstFailure: SafeNetworkEntry | null = null;
  let serviceWorkerCount = 0;
  let testSucceeded = false;

  try {
    const loginResponse = await login(page, baseURL, email, password, landingPath);
    const loginHeaders = await loginResponse.headersArray();
    loginSetCookies = safeSetCookies(loginHeaders);
    assertLoginSetCookies(loginSetCookies);

    const browserCookies = await context.cookies(baseURL);
    cookieMetadata = browserCookies.map((cookie) => ({
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      expires: cookie.expires > 0 ? new Date(cookie.expires * 1000).toISOString() : null,
    }));
    const sessionCookie = browserCookies.find((cookie) => cookie.name === sessionCookieName);
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toMatchObject({
      domain: new URL(baseURL).hostname,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
    });

    for (const path of protectedPaths) await gotoProtected(page, baseURL, path);
    if (!isMobile) await gotoProtected(page, baseURL, "/admin/problems");

    await gotoProtected(page, baseURL, "/home");
    await page.waitForTimeout(1_500);
    for (const path of desktopLinkPaths) {
      await gotoProtected(page, baseURL, "/home");
      await clickProtectedLink(page, path, isMobile);
    }
    if (!isMobile) {
      await gotoProtected(page, baseURL, "/home");
      await clickProtectedLink(page, "/admin/problems", false);
    }

    await page.reload({ waitUntil: "domcontentloaded" });
    assertProtectedPath(page, isMobile ? "/profile" : "/admin/problems");

    await gotoProtected(page, baseURL, "/review");
    await gotoProtected(page, baseURL, "/history");
    await page.goBack({ waitUntil: "domcontentloaded" });
    assertProtectedPath(page, "/review");
    await page.goForward({ waitUntil: "domcontentloaded" });
    assertProtectedPath(page, "/history");

    const newTab = await context.newPage();
    attachNetworkCapture(newTab, entries, requestEntries, pendingCaptures);
    await gotoProtected(newTab, baseURL, "/profile");
    await newTab.close();

    if (waitMs > 0) {
      await page.waitForTimeout(waitMs);
      await gotoProtected(page, baseURL, "/home");
    }

    serviceWorkerCount = context.serviceWorkers().length;
    expect(serviceWorkerCount).toBe(0);
    testSucceeded = true;
  } finally {
    await Promise.allSettled([...pendingCaptures]);
    firstFailure = entries.find((entry) => entry.response?.location?.includes("/login")) ?? null;
    serviceWorkerCount = context.serviceWorkers().length;
    await context.close();
    await sanitizeHar(rawHarPath, sanitizedHarPath).finally(() => rm(rawHarPath, { force: true }));
    await writeFile(summaryPath, JSON.stringify({
      event: "PRODUCTION_BROWSER_SESSION_RESULT",
      project: testInfo.project.name,
      browserName,
      status: testSucceeded ? "success" : "failed",
      loginSetCookies,
      cookieMetadata,
      serviceWorkerCount,
      requestCount: entries.length,
      rscRequestCount: entries.filter((entry) => entry.request.rsc).length,
      prefetchRequestCount: entries.filter((entry) => entry.request.prefetch).length,
      firstFailure,
      requests: entries,
    }, null, 2));
    console.log(JSON.stringify({
      event: "PRODUCTION_BROWSER_SESSION_RESULT",
      project: testInfo.project.name,
      status: testSucceeded ? "success" : "failed",
      requests: entries.length,
      rscRequests: entries.filter((entry) => entry.request.rsc).length,
      prefetchRequests: entries.filter((entry) => entry.request.prefetch).length,
      firstFailure: firstFailure ? {
        url: firstFailure.url,
        resourceType: firstFailure.resourceType,
        cookieHeaderPresent: firstFailure.request.cookieHeaderPresent,
        cookieCandidateCount: firstFailure.request.cookieCandidateCount,
        status: firstFailure.response?.status,
      } : null,
    }));
  }
});

async function login(page: Page, baseURL: string, email: string, password: string, landingPath: string) {
  await page.goto(new URL("/login", baseURL).toString(), { waitUntil: "domcontentloaded" });
  const responsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === "/api/auth/login" && response.request().method() === "POST";
  });
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  await page.waitForURL((url) => url.pathname !== "/login", { waitUntil: "domcontentloaded" });
  assertProtectedPath(page, landingPath);
  return response;
}

async function gotoProtected(page: Page, baseURL: string, path: string) {
  const response = await page.goto(new URL(path, baseURL).toString(), { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  assertProtectedPath(page, path);
}

async function clickProtectedLink(page: Page, path: string, isMobile: boolean) {
  const navLabel = isMobile ? "学習メニュー" : "メインナビゲーション";
  const link = page.locator(`nav[aria-label="${navLabel}"] a[href="${path}"]`);
  await expect(link).toHaveCount(1);
  await Promise.all([
    page.waitForURL((url) => url.pathname === path, { waitUntil: "domcontentloaded" }),
    link.click(),
  ]);
  assertProtectedPath(page, path);
}

function assertProtectedPath(page: Page, expectedPath: string) {
  const url = new URL(page.url());
  expect(url.pathname).toBe(expectedPath);
  expect(url.pathname).not.toBe("/login");
}

function attachNetworkCapture(
  page: Page,
  entries: SafeNetworkEntry[],
  requestEntries: WeakMap<Request, SafeNetworkEntry>,
  pendingCaptures: Set<Promise<void>>,
) {
  page.on("request", (request) => {
    const entry: SafeNetworkEntry = {
      id: entries.length + 1,
      url: safeUrl(request.url()),
      method: request.method(),
      resourceType: request.resourceType(),
      navigation: request.isNavigationRequest(),
      redirectFrom: request.redirectedFrom() ? safeUrl(request.redirectedFrom()!.url()) : null,
      request: {
        cookieHeaderPresent: false,
        cookieCandidateCount: 0,
        cookieNames: [],
        rsc: new URL(request.url()).searchParams.has("_rsc"),
        prefetch: false,
        headerNames: [],
      },
    };
    entries.push(entry);
    requestEntries.set(request, entry);
    track(pendingCaptures, (async () => {
      const headers = await request.allHeaders();
      const cookie = headers.cookie ?? "";
      const cookieNames = cookie.split(";").map((part) => part.split("=", 1)[0].trim()).filter(Boolean);
      entry.request.cookieHeaderPresent = Boolean(cookie);
      entry.request.cookieNames = cookieNames;
      entry.request.cookieCandidateCount = cookieNames.filter((name) => name === sessionCookieName || name === "em-study-session").length;
      entry.request.rsc = entry.request.rsc || headers.rsc === "1";
      entry.request.prefetch = Boolean(headers["next-router-prefetch"] || headers.purpose === "prefetch" || headers["sec-purpose"] === "prefetch");
      entry.request.headerNames = Object.keys(headers).filter((name) => name === "rsc" || name.startsWith("next-router-") || name === "purpose" || name === "sec-purpose").sort();
    })());
  });

  page.on("response", (response) => {
    const entry = requestEntries.get(response.request());
    if (!entry) return;
    track(pendingCaptures, captureResponse(response, entry));
  });
}

async function captureResponse(response: Response, entry: SafeNetworkEntry) {
  const headersArray = await response.headersArray();
  const headers = Object.fromEntries(headersArray.map((header) => [header.name.toLowerCase(), header.value]));
  const setCookies = safeSetCookies(headersArray);
  entry.response = {
    status: response.status(),
    location: headers.location ? safeUrl(new URL(headers.location, response.url()).toString()) : null,
    setCookieCount: setCookies.length,
    setCookies,
    cacheControl: headers["cache-control"] ?? null,
    vary: headers.vary ?? null,
    xMiddlewareHeaders: selectedHeaders(headers, (name) => name.startsWith("x-middleware")),
    nextHeaders: selectedHeaders(headers, (name) => name.startsWith("x-nextjs") || name.startsWith("next-")),
  };
}

function track(pending: Set<Promise<void>>, promise: Promise<void>) {
  pending.add(promise);
  void promise.finally(() => pending.delete(promise));
}

function selectedHeaders(headers: Record<string, string>, include: (name: string) => boolean) {
  return Object.fromEntries(Object.entries(headers).filter(([name]) => include(name)));
}

function safeSetCookies(headers: Array<{ name: string; value: string }>) {
  return headers
    .filter((header) => header.name.toLowerCase() === "set-cookie")
    .flatMap((header) => splitSetCookie(header.value))
    .map(cookieAttributes);
}

function assertLoginSetCookies(cookies: SafeCookie[]) {
  const session = cookies.find((cookie) => cookie.name === sessionCookieName);
  const legacy = cookies.find((cookie) => cookie.name === "em-study-session");
  expect(session).toMatchObject({
    domainAttributePresent: false,
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 604800,
  });
  expect(legacy?.maxAge).toBe(0);
  expect(cookies).toHaveLength(2);
}

function splitSetCookie(value: string) {
  return value.split(/,(?=\s*[^;,]+=)/g).map((item) => item.trim()).filter(Boolean);
}

function cookieAttributes(setCookie: string): SafeCookie {
  const parts = setCookie.split(";").map((part) => part.trim());
  const cookie: SafeCookie = {
    name: parts[0].split("=", 1)[0],
    domainAttributePresent: false,
    path: null,
    secure: false,
    httpOnly: false,
    sameSite: null,
    maxAge: null,
    expiresPresent: false,
  };
  for (const part of parts.slice(1)) {
    const [rawName, ...rest] = part.split("=");
    const name = rawName.toLowerCase();
    const value = rest.join("=");
    if (name === "domain") cookie.domainAttributePresent = true;
    else if (name === "path") cookie.path = value;
    else if (name === "secure") cookie.secure = true;
    else if (name === "httponly") cookie.httpOnly = true;
    else if (name === "samesite") cookie.sameSite = value.toLowerCase();
    else if (name === "max-age") cookie.maxAge = Number(value);
    else if (name === "expires") cookie.expiresPresent = true;
  }
  return cookie;
}

async function sanitizeHar(rawPath: string, destinationPath: string) {
  const har = JSON.parse(await readFile(rawPath, "utf8"));
  for (const page of har.log?.pages ?? []) page.title = "<redacted>";
  for (const entry of har.log?.entries ?? []) {
    entry.request.url = safeUrl(entry.request.url);
    entry.request.headers = sanitizeHarHeaders(entry.request.headers ?? []);
    entry.request.cookies = (entry.request.cookies ?? []).map((cookie: { name: string }) => ({ name: cookie.name, value: "<redacted>" }));
    entry.request.queryString = (entry.request.queryString ?? []).map((query: { name: string }) => ({ name: query.name, value: "<redacted>" }));
    delete entry.request.postData;
    entry.response.headers = sanitizeHarHeaders(entry.response.headers ?? []);
    entry.response.cookies = (entry.response.cookies ?? []).map((cookie: { name: string }) => ({ name: cookie.name, value: "<redacted>" }));
    if (entry.response.redirectURL) entry.response.redirectURL = safeUrl(new URL(entry.response.redirectURL, entry.request.url).toString());
    if (entry.response.content) {
      delete entry.response.content.text;
      delete entry.response.content.encoding;
    }
  }
  await writeFile(destinationPath, JSON.stringify(har, null, 2));
}

function sanitizeHarHeaders(headers: Array<{ name: string; value: string }>) {
  const allowed = new Set([
    "accept", "cache-control", "content-type", "location", "purpose", "rsc", "sec-purpose", "user-agent", "vary",
  ]);
  return headers.flatMap((header) => {
    const name = header.name.toLowerCase();
    if (name === "cookie" || name === "authorization") return [{ name: header.name, value: "<redacted>" }];
    if (name === "set-cookie") return splitSetCookie(header.value).map((cookie) => ({ name: header.name, value: safeSetCookieHeader(cookie) }));
    if (allowed.has(name) || name.startsWith("next-router-") || name.startsWith("x-middleware") || name.startsWith("x-nextjs")) return [header];
    return [];
  });
}

function safeSetCookieHeader(value: string) {
  const cookie = cookieAttributes(value);
  return [
    `${cookie.name}=<redacted>`,
    cookie.path ? `Path=${cookie.path}` : null,
    cookie.domainAttributePresent ? "Domain=<redacted>" : null,
    cookie.maxAge === null ? null : `Max-Age=${cookie.maxAge}`,
    cookie.expiresPresent ? "Expires=<redacted>" : null,
    cookie.secure ? "Secure" : null,
    cookie.httpOnly ? "HttpOnly" : null,
    cookie.sameSite ? `SameSite=${cookie.sameSite}` : null,
  ].filter(Boolean).join("; ");
}

function safeUrl(value: string) {
  const url = new URL(value);
  for (const [name] of url.searchParams) {
    if (name !== "_rsc" && name !== "next") url.searchParams.set(name, "<redacted>");
  }
  return url.toString();
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
