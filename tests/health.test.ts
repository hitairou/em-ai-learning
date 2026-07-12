import assert from "node:assert/strict";
import test from "node:test";
import { createHealthResult } from "../src/lib/health";

test("health result is 200 only when database and required migration are ready", () => {
  const result = createHealthResult({
    databaseConnected: true,
    appliedMigrationCount: 2,
    expectedMigrationApplied: true,
    failedMigrationCount: 0,
  }, new Date("2026-07-12T00:00:00.000Z"));
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.status, "ok");
  assert.equal(result.body.database, "connected");
  assert.equal(result.body.migrations.status, "up_to_date");
});

test("health result is 503 without database connectivity or required migration", () => {
  for (const probe of [
    { databaseConnected: false, appliedMigrationCount: 0, expectedMigrationApplied: false, failedMigrationCount: 0 },
    { databaseConnected: true, appliedMigrationCount: 1, expectedMigrationApplied: false, failedMigrationCount: 0 },
    { databaseConnected: true, appliedMigrationCount: 2, expectedMigrationApplied: true, failedMigrationCount: 1 },
  ]) {
    assert.equal(createHealthResult(probe).statusCode, 503);
  }
});
