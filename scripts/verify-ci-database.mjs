import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const requiredTables = {
  User: ["emailVerifiedAt", "emailVerificationStatus"],
  PendingRegistration: ["verificationCodeDigest", "verificationAttempts", "lastSentAt"],
  EmailDailyQuota: ["dateKey", "sendCount", "updatedAt"],
  QuestionSession: ["uploadRightsConfirmedAt", "uploadPolicyVersion", "originalFileDeleteAt", "originalFileDeletedAt"],
};

async function main() {
  const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type = 'table'");
  const availableTables = new Set(tables.map((row) => row.name));
  const missingTables = Object.keys(requiredTables).filter((table) => !availableTables.has(table));
  if (missingTables.length) throw new Error(`Missing required tables: ${missingTables.join(",")}`);

  const missingColumns = [];
  for (const [table, columns] of Object.entries(requiredTables)) {
    const rows = await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`);
    const availableColumns = new Set(rows.map((row) => row.name));
    for (const column of columns) if (!availableColumns.has(column)) missingColumns.push(`${table}.${column}`);
  }
  if (missingColumns.length) throw new Error(`Missing required columns: ${missingColumns.join(",")}`);
  console.log(JSON.stringify({ requiredTables: Object.keys(requiredTables), missingTables: [], missingColumns: [] }));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
