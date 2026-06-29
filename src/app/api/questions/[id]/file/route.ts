import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { isInsideUploadRoot } from "@/lib/uploads";

const contentTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, context: RouteContext<"/api/questions/[id]/file">) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const { id } = await context.params;
  const session = await db.questionSession.findFirst({
    where: { id, userId: auth.user.id },
    select: { originalFilePath: true },
  });
  if (!session?.originalFilePath || !isInsideUploadRoot(session.originalFilePath)) {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
  }
  const bytes = await fs.readFile(session.originalFilePath).catch(() => null);
  if (!bytes) return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": contentTypes[path.extname(session.originalFilePath).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
