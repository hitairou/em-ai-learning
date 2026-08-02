import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";

const db = new PrismaClient();
const args = new Set(process.argv.slice(2));
const emailIndex = process.argv.indexOf("--email");
const email = emailIndex >= 0 ? process.argv[emailIndex + 1] : null;

if (!email || (!args.has("--dry-run") && !args.has("--apply")) || (args.has("--dry-run") && args.has("--apply"))) {
  console.error("Usage: node scripts/repair-legacy-login.mjs --email <address> --dry-run|--apply");
  process.exitCode = 2;
} else {
  try {
    const rows = await db.$queryRaw(Prisma.sql`SELECT id, email, role, "emailVerificationStatus", "emailVerifiedAt", "selectedCourse", "passwordHash", "createdAt", "updatedAt" FROM "User" WHERE LOWER(TRIM(email)) = LOWER(TRIM(${email}))`);
    if (rows.length !== 1) throw new Error(`Expected exactly one matching user; found ${rows.length}`);
    const user = rows[0];
    const hash = String(user.passwordHash);
    const before = { email: mask(user.email), role: user.role, emailVerificationStatus: user.emailVerificationStatus, emailVerifiedAt: user.emailVerifiedAt, selectedCourse: user.selectedCourse, bcryptFormat: /^\$2[aby]\$\d{2}\$/.test(hash), hashLength: hash.length, hashPrefix: hash.slice(0, 4), createdAt: user.createdAt, updatedAt: user.updatedAt };
    console.log(JSON.stringify({ mode: args.has("--apply") ? "apply" : "dry-run", before }, null, 2));
    if (args.has("--apply")) {
      if (!before.bcryptFormat || before.hashLength !== 60) throw new Error("Refusing repair: password hash is not bcrypt format");
      await db.user.update({ where: { id: user.id }, data: { emailVerificationStatus: "legacy_exempt", emailVerifiedAt: null } });
      console.log(JSON.stringify({ after: { email: mask(user.email), emailVerificationStatus: "legacy_exempt", emailVerifiedAt: null } }));
    }
  } finally { await db.$disconnect(); }
}

function mask(value) { const [local, domain] = String(value).split("@"); return `${local.slice(0, 2)}***@${domain ?? "***"}`; }
