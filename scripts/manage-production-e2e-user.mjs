import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const action = process.argv[2];
const marker = process.env.PRODUCTION_E2E_MARKER ?? "";
const password = process.env.PRODUCTION_E2E_PASSWORD ?? "";
const prisma = new PrismaClient();

if (!/^production-e2e-[a-zA-Z0-9-]+$/.test(marker)) {
  throw new Error("PRODUCTION_E2E_MARKER is missing or invalid");
}
if (!new Set(["create", "delete"]).has(action)) {
  throw new Error("Expected create or delete action");
}

const emails = {
  admin: `${marker}-admin@example.test`,
  learner: `${marker}-learner@example.test`,
};

try {
  if (action === "create") {
    if (password.length < 16) throw new Error("PRODUCTION_E2E_PASSWORD is too short");
    const existing = await prisma.user.count({ where: { email: { in: Object.values(emails) } } });
    if (existing) throw new Error("Managed production E2E users already exist");

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.create({
        data: {
          name: "Production E2E Admin",
          email: emails.admin,
          passwordHash,
          role: "admin",
          selectedCourse: "em1",
          learningPurpose: "exam",
          onboardingCompleted: true,
          diagnosticCompleted: true,
        },
      }),
      prisma.user.create({
        data: {
          name: "Production E2E Learner",
          email: emails.learner,
          passwordHash,
          role: "user",
          selectedCourse: "em1",
          learningPurpose: "foundation",
          onboardingCompleted: true,
          diagnosticCompleted: true,
        },
      }),
    ]);
  } else {
    await prisma.user.deleteMany({ where: { email: { in: Object.values(emails) } } });
  }

  const remaining = await prisma.user.count({ where: { email: { in: Object.values(emails) } } });
  const expected = action === "create" ? 2 : 0;
  if (remaining !== expected) throw new Error(`Managed user count is ${remaining}, expected ${expected}`);
  console.log(JSON.stringify({ event: "PRODUCTION_E2E_USER_RESULT", action, managedUsers: expected }));
} finally {
  await prisma.$disconnect();
}
