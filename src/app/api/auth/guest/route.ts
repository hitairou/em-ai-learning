import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(randomUUID(), 6);
  const user = await db.user.create({
    data: {
      name: "ゲスト",
      email: `guest-${id}@em-pass.local`,
      passwordHash,
    },
  });
  await createSession({ userId: user.id, role: user.role });
  if (prefersHtml(request)) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/onboarding/course",
        "Cache-Control": "private, no-store",
      },
    });
  }
  return NextResponse.json({ user: { id: user.id, name: user.name }, next: "/onboarding/course" }, { status: 201 });
}

function prefersHtml(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html") && !accept.includes("application/json");
}
