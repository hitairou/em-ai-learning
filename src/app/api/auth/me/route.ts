import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";

export async function GET() {
  const auth = await apiUser();
  if (auth.error) return auth.error;
  return NextResponse.json({ user: auth.user }, { headers: { "Cache-Control": "private, no-store" } });
}
