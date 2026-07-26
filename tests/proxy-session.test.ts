import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import { signSession } from "../src/lib/auth/session-core";
import {
  HOST_PREFIX_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
} from "../src/lib/auth/session-cookie";

const AUTH_SECRET = "proxy-session-test-secret-with-32-chars";

async function withProductionEnv(run: () => Promise<void>) {
  const env = process.env as Record<string, string | undefined>;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousAuthSecret = process.env.AUTH_SECRET;
  env.NODE_ENV = "production";
  env.AUTH_SECRET = AUTH_SECRET;
  try {
    await run();
  } finally {
    if (previousNodeEnv === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = previousNodeEnv;
    if (previousAuthSecret === undefined) delete env.AUTH_SECRET;
    else env.AUTH_SECRET = previousAuthSecret;
  }
}

function protectedRequest(path: string, cookie?: string, headers?: Record<string, string>) {
  return new NextRequest(`https://edesign.tairoh.com${path}`, {
    headers: {
      host: "edesign.tairoh.com",
      "x-forwarded-host": "edesign.tairoh.com",
      "x-forwarded-proto": "https",
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
  });
}

function redirectPath(response: Response) {
  const location = response.headers.get("location");
  return location ? new URL(location).pathname + new URL(location).search : null;
}

test("proxy accepts valid production host-prefix session cookies", async () => {
  await withProductionEnv(async () => {
    const token = await signSession({ userId: "user-1", role: "admin" });
    const response = await proxy(protectedRequest("/admin/problems", `${HOST_PREFIX_SESSION_COOKIE}=${token}`));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("location"), null);
  });
});

test("proxy falls back to a valid legacy cookie during migration", async () => {
  await withProductionEnv(async () => {
    const token = await signSession({ userId: "user-1", role: "admin" });
    const response = await proxy(protectedRequest("/home", `${LEGACY_SESSION_COOKIE}=${token}`));
    assert.equal(response.status, 200);
  });
});

test("proxy prefers valid new cookies and ignores invalid legacy cookies", async () => {
  await withProductionEnv(async () => {
    const token = await signSession({ userId: "user-1", role: "admin" });
    const response = await proxy(protectedRequest(
      "/practice",
      `${HOST_PREFIX_SESSION_COOKIE}=${token}; ${LEGACY_SESSION_COOKIE}=invalid`,
    ));
    assert.equal(response.status, 200);
  });
});

test("proxy uses a valid legacy cookie when the new cookie is invalid", async () => {
  await withProductionEnv(async () => {
    const token = await signSession({ userId: "user-1", role: "admin" });
    const response = await proxy(protectedRequest(
      "/review",
      `${HOST_PREFIX_SESSION_COOKIE}=invalid; ${LEGACY_SESSION_COOKIE}=${token}`,
    ));
    assert.equal(response.status, 200);
  });
});

test("proxy checks all same-name cookie candidates before redirecting", async () => {
  await withProductionEnv(async () => {
    const token = await signSession({ userId: "user-1", role: "admin" });
    const response = await proxy(protectedRequest(
      "/profile",
      `${HOST_PREFIX_SESSION_COOKIE}=invalid; ${HOST_PREFIX_SESSION_COOKIE}=${token}`,
    ));
    assert.equal(response.status, 200);
  });
});

test("proxy redirects safely when all cookie candidates are invalid", async () => {
  await withProductionEnv(async () => {
    const response = await proxy(protectedRequest(
      "/home?unit=em1&next=https://evil.example",
      `${HOST_PREFIX_SESSION_COOKIE}=invalid; ${LEGACY_SESSION_COOKIE}=invalid`,
    ));
    assert.equal(response.status, 307);
    assert.equal(redirectPath(response), "/login?next=%2Fhome%3Funit%3Dem1%26next%3Dhttps%3A%2F%2Fevil.example");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  });
});

test("proxy redirects missing cookies to login", async () => {
  await withProductionEnv(async () => {
    const response = await proxy(protectedRequest("/review"));
    assert.equal(response.status, 307);
    assert.equal(redirectPath(response), "/login?next=%2Freview");
  });
});

test("proxy canonicalizes non-production hostnames before protected routing", async () => {
  await withProductionEnv(async () => {
    const response = await proxy(protectedRequest(
      "/home",
      undefined,
      { host: "www.edesign.tairoh.com", "x-forwarded-host": "www.edesign.tairoh.com" },
    ));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), "https://edesign.tairoh.com/home");
  });
});
