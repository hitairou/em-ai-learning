import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const index = process.argv.indexOf("--limit");
const limit = index >= 0 ? Math.max(1, Number.parseInt(process.argv[index + 1] ?? "", 10)) : 1000;
const result = { dryRun, limit, targeted: 0, deleted: 0, failed: 0 };
try {
  const rows = await prisma.pendingRegistration.findMany({ where: { expiresAt: { lte: new Date() } }, orderBy: { expiresAt: "asc" }, take: limit, select: { id: true } });
  result.targeted = rows.length;
  if (!dryRun) for (const row of rows) { try { await prisma.pendingRegistration.delete({ where: { id: row.id } }); result.deleted++; } catch { result.failed++; } }
  console.log(JSON.stringify(result));
  process.exitCode = result.failed ? 1 : 0;
} finally { await prisma.$disconnect(); }
