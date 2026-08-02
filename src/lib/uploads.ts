import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".pdf"]);

export function uploadRoot() {
  const configured = process.env.UPLOAD_DIR?.trim() || "data/uploads";
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export async function saveUpload(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) throw new Error("対応していないファイル形式です");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("ファイルは10MB以下にしてください");
  const root = uploadRoot();
  await fs.mkdir(root, { recursive: true });
  const target = path.join(root, `${randomUUID()}${extension}`);
  await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
  return { target, extension };
}

export async function extractPdfText(filePath: string) {
  const pdf = (await import("pdf-parse")).default;
  const data = await pdf(await fs.readFile(filePath));
  return data.text.trim();
}

export function isInsideUploadRoot(filePath: string) {
  const root = path.resolve(uploadRoot()) + path.sep;
  return path.resolve(filePath).startsWith(root);
}

export async function safeDeleteUpload(filePath: string) {
  if (!isInsideUploadRoot(filePath)) return "rejected" as const;
  const root = path.resolve(uploadRoot());
  const resolved = path.resolve(filePath);
  const stat = await fs.lstat(resolved).catch(() => null);
  if (!stat) return "missing" as const;
  if (stat.isSymbolicLink() || !stat.isFile()) return "rejected" as const;
  const realPath = await fs.realpath(resolved).catch(() => "");
  if (!realPath || !realPath.startsWith(`${root}${path.sep}`)) return "rejected" as const;
  await fs.unlink(resolved);
  return "deleted" as const;
}
