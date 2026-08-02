import "dotenv/config";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

const input = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(12).regex(/[A-Za-z]/).regex(/[0-9]/),
  name: z.string().trim().min(1).max(80),
}).parse({
  email: process.env.ADMIN_RECOVERY_EMAIL,
  password: process.env.ADMIN_RECOVERY_PASSWORD,
  name: process.env.ADMIN_RECOVERY_NAME ?? "EM PASS Administrator",
});

const prisma = new PrismaClient();

try {
  const result = await prisma.$transaction(async (tx) => {
    const matches = await tx.$queryRaw(Prisma.sql`SELECT id, email, role FROM "User" WHERE LOWER(TRIM(email)) = ${input.email} LIMIT 2`);
    if (matches.length > 0) throw new Error("Refusing recovery: an account already exists for this email");

    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12),
        role: "admin",
        termsAcceptedAt: new Date(),
        termsVersion: "2026-08-02",
        privacyAcknowledgedAt: new Date(),
        privacyVersion: "2026-08-02",
        emailVerificationStatus: "system",
      },
      select: { id: true, email: true, role: true, emailVerificationStatus: true },
    });
    return user;
  });
  console.log(JSON.stringify({ created: true, id: result.id, email: mask(result.email), role: result.role, emailVerificationStatus: result.emailVerificationStatus }));
} catch (error) {
  console.error("Administrator recovery failed without exposing credentials.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

function mask(value) {
  const [local, domain] = String(value).split("@");
  return `${local.slice(0, 2)}***@${domain ?? "***"}`;
}
