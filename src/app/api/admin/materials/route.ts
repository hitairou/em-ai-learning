import { NextResponse } from "next/server";
import { apiAdmin } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { extractPdfText, saveUpload } from "@/lib/uploads";
import { firstZodError, materialSchema } from "@/lib/validation";

export async function GET() {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const materials = await db.material.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ materials });
}

export async function POST(request: Request) {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "送信内容を確認してください" }, { status: 400 });
  const fileValue = form.get("file");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  let filePath: string | null = null;
  let type = "text";
  let extractedText = String(form.get("extractedText") ?? "").trim();
  try {
    if (file) {
      const saved = await saveUpload(file);
      filePath = saved.target;
      type = saved.extension === ".pdf" ? "pdf" : "image";
      if (type === "pdf") {
        extractedText = (await extractPdfText(saved.target).catch(() => "")) || extractedText;
      }
    }
    const sourceYearRaw = String(form.get("sourceYear") ?? "").trim();
    const parsed = materialSchema.safeParse({
      course: String(form.get("course") ?? ""),
      title: String(form.get("title") ?? ""),
      extractedText,
      sourceYear: sourceYearRaw ? Number(sourceYearRaw) : null,
      tags: String(form.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    if (!parsed.success) return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    const material = await db.material.create({
      data: {
        course: parsed.data.course,
        type,
        title: parsed.data.title,
        filePath,
        extractedText: parsed.data.extractedText,
        sourceYear: parsed.data.sourceYear ?? null,
        tagsJson: JSON.stringify(parsed.data.tags),
      },
    });
    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "教材を保存できませんでした" },
      { status: 400 },
    );
  }
}
