import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

export async function POST() {
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(randomUUID(), 12);
  const user = await db.user.create({
    data: {
      name: "ゲスト",
      email: `guest-${id}@em-pass.local`,
      passwordHash,
    },
  });
  await createSession({ userId: user.id, role: user.role });
  return NextResponse.json({ user: { id: user.id, name: user.name }, next: "/onboarding/course" }, { status: 201 });
}
