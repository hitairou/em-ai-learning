import { Prisma, type User } from "@prisma/client";
import { db } from "@/lib/db";
import { normalizeEmail } from "@/lib/auth/email-verification";

type UserClient = typeof db;

export async function findUserByEmail(email: string, client: UserClient = db): Promise<{ user: User | null; ambiguous: boolean; usedFallback: boolean }> {
  const normalized = normalizeEmail(email);
  const exact = await client.user.findUnique({ where: { email: normalized } });
  if (exact) return { user: exact, ambiguous: false, usedFallback: false };
  const matches = await client.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "User"
    WHERE LOWER(TRIM("email")) = LOWER(TRIM(${normalized}))
    LIMIT 2
  `);
  if (matches.length !== 1) return { user: null, ambiguous: matches.length > 1, usedFallback: matches.length > 0 };
  return { user: await client.user.findUnique({ where: { id: matches[0].id } }), ambiguous: false, usedFallback: true };
}
