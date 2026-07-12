import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

async function main() {
  const existingAdminCount = await prisma.user.count({ where: { role: "admin" } });
  if (existingAdminCount > 0) {
    console.log(JSON.stringify({ existingAdminCount, created: false }));
    return;
  }
  const credentials = z.object({
    email: z.string().email(),
    password: z.string().min(12).regex(/[A-Za-z]/).regex(/[0-9]/),
    name: z.string().min(1).max(80),
  }).parse({
    email: process.env.ADMIN_BOOTSTRAP_EMAIL,
    password: process.env.ADMIN_BOOTSTRAP_PASSWORD,
    name: process.env.ADMIN_BOOTSTRAP_NAME ?? "Administrator",
  });
  await prisma.user.create({
    data: {
      name: credentials.name,
      email: credentials.email,
      passwordHash: await bcrypt.hash(credentials.password, 12),
      role: "admin",
    },
  });
  console.log(JSON.stringify({ existingAdminCount: 0, created: true }));
}

main()
  .catch((error) => {
    console.error("Administrator bootstrap failed without exposing credentials.");
    console.error(error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
