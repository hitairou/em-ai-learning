import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const limitIndex = process.argv.indexOf("--limit");
const limit = limitIndex >= 0 ? Math.max(1, Number.parseInt(process.argv[limitIndex + 1] ?? "", 10)) : 1000;
const configuredRoot = process.env.UPLOAD_DIR?.trim() || "data/uploads";
const root = path.resolve(process.cwd(), configuredRoot);

async function safeDelete(filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(`${root}${path.sep}`)) return "rejected";
  const stat = await fs.lstat(resolved).catch(() => null);
  if (!stat) return "missing";
  if (stat.isSymbolicLink() || !stat.isFile()) return "rejected";
  const real = await fs.realpath(resolved).catch(() => "");
  if (!real || !real.startsWith(`${root}${path.sep}`)) return "rejected";
  if (!dryRun) await fs.unlink(resolved);
  return "deleted";
}

const result = { dryRun, limit, targeted: 0, success: 0, alreadyMissing: 0, failed: 0, rejectedPath: 0 };
try {
  const sessions = await prisma.questionSession.findMany({ where: { originalFileDeleteAt: { lte: new Date() }, originalFileDeletedAt: null, originalFilePath: { not: null } }, orderBy: { originalFileDeleteAt: "asc" }, take: limit, select: { id: true, originalFilePath: true } });
  result.targeted = sessions.length;
  for (const session of sessions) {
    try {
      const status = dryRun ? "deleted" : await safeDelete(session.originalFilePath);
      if (status === "rejected") { result.rejectedPath++; continue; }
      if (status === "missing") result.alreadyMissing++;
      if (!dryRun) await prisma.questionSession.update({ where: { id: session.id }, data: { originalFilePath: null, originalFileDeletedAt: new Date() } });
      result.success++;
    } catch { result.failed++; }
  }
  console.log(JSON.stringify(result));
  process.exitCode = result.failed || result.rejectedPath ? 1 : 0;
} finally { await prisma.$disconnect(); }
