import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";

const email = process.env.TARGET_LOGIN_EMAIL?.trim() || null;

const db = new PrismaClient();
try {
  const normalized = email?.toLowerCase() || null;
  const exact = normalized ? await db.$queryRaw(Prisma.sql`SELECT id FROM "User" WHERE email = ${normalized}`) : [];
  const matches = normalized ? await db.$queryRaw(Prisma.sql`SELECT id, email, role, "emailVerificationStatus", "emailVerifiedAt", "selectedCourse", "passwordHash", "createdAt", "updatedAt" FROM "User" WHERE LOWER(TRIM(email)) = LOWER(TRIM(${normalized})) LIMIT 3`) : [];
  const administrators = await db.$queryRaw(Prisma.sql`SELECT email, role, "emailVerificationStatus", "passwordHash", "createdAt", "updatedAt" FROM "User" WHERE role = 'admin' ORDER BY "createdAt"`);
  const users = matches.map((user) => {
    const hash = String(user.passwordHash);
    return {
      email: mask(user.email),
      role: user.role,
      emailVerificationStatus: user.emailVerificationStatus,
      emailVerifiedAtPresent: Boolean(user.emailVerifiedAt),
      selectedCourse: user.selectedCourse,
      passwordHash: { bcryptFormat: /^\$2[aby]\$\d{2}\$/.test(hash), length: hash.length, prefix: hash.slice(0, 4) },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });
  console.log(JSON.stringify({
    email: email ? mask(email) : null,
    exactMatchCount: exact.length,
    normalizedMatchCount: matches.length,
    ambiguous: matches.length > 1,
    users,
    administrators: administrators.map((admin) => {
      const hash = String(admin.passwordHash);
      return { email: mask(admin.email), role: admin.role, emailVerificationStatus: admin.emailVerificationStatus, passwordHash: { bcryptFormat: /^\$2[aby]\$\d{2}\$/.test(hash), length: hash.length, prefix: hash.slice(0, 4) }, createdAt: admin.createdAt, updatedAt: admin.updatedAt };
    }),
  }, null, 2));
} finally {
  await db.$disconnect();
}

function mask(value) {
  const [local, domain] = String(value).split("@");
  return `${local.slice(0, 2)}***@${domain ?? "***"}`;
}
