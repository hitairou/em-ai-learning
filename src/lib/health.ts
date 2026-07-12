export const APPLICATION_NAME = "em-ai-learning";

export type HealthProbe = {
  databaseConnected: boolean;
  appliedMigrationCount: number;
  expectedMigrationApplied: boolean;
  failedMigrationCount: number;
};

export function createHealthResult(probe: HealthProbe, now = new Date()) {
  const migrationReady = probe.expectedMigrationApplied && probe.failedMigrationCount === 0;
  const healthy = probe.databaseConnected && migrationReady;
  return {
    statusCode: healthy ? 200 : 503,
    body: {
      status: healthy ? "ok" : "unavailable",
      application: APPLICATION_NAME,
      database: probe.databaseConnected ? "connected" : "unavailable",
      migrations: {
        status: migrationReady ? "up_to_date" : "not_ready",
        appliedCount: probe.appliedMigrationCount,
      },
      currentTime: now.toISOString(),
    },
  };
}
