import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHealthResult } from "@/lib/health";

const REQUIRED_MIGRATION = "20260712062046_integrate_electromagnetics_question_bank_834";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRawUnsafe("SELECT 1");
    const migrations = await db.$queryRawUnsafe<Array<{
      migration_name: string;
      finished_at: string | null;
      rolled_back_at: string | null;
    }>>("SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations");
    const result = createHealthResult({
      databaseConnected: true,
      appliedMigrationCount: migrations.filter((migration) => migration.finished_at && !migration.rolled_back_at).length,
      expectedMigrationApplied: migrations.some((migration) => migration.migration_name === REQUIRED_MIGRATION && migration.finished_at && !migration.rolled_back_at),
      failedMigrationCount: migrations.filter((migration) => !migration.finished_at && !migration.rolled_back_at).length,
    });
    return NextResponse.json(result.body, {
      status: result.statusCode,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    const result = createHealthResult({
      databaseConnected: false,
      appliedMigrationCount: 0,
      expectedMigrationApplied: false,
      failedMigrationCount: 0,
    });
    return NextResponse.json(result.body, {
      status: result.statusCode,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
