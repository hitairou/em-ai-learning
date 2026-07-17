import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";

export async function apiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "認証が必要です" },
        { status: 401, headers: { "Cache-Control": "private, no-store" } },
      ),
    };
  }
  return { user, error: null };
}

export async function apiAdmin() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth;
  if (auth.user.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 }),
    };
  }
  return auth;
}
