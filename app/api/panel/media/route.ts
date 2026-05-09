import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { ensureUploadDir, medyaKaydet, medyaListele, uploadDir } from "@/lib/media-store";
import path from "path";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { withSiteFromRequest } from "@/lib/api-site-context";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024; // 6MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function safeBaseName(name: string): string {
  const base = path.basename(name);
  return base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 80) || "dosya";
}

function extFor(mime: string, original: string): string {
  const ext = path.extname(original).toLowerCase();
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (/^\.[a-z0-9]{1,6}$/.test(ext)) return ext;
  return "";
}

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const list = await medyaListele();
    return NextResponse.json({ medya: list });
  });
}

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json({ error: "multipart/form-data bekleniyor" }, { status: 400 });
    }
    const fd = await req.formData();
    /** `@types/node` FormData çakışması — Web FormData kullanılır */
    const file = (fd as unknown as globalThis.FormData).get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadı (file)" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Sadece jpg/png/webp/gif yükleyin" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Dosya boyutu çok büyük" }, { status: 400 });
    }

    await ensureUploadDir();

    const id = randomUUID();
    const originalName = safeBaseName(file.name || "gorsel");
    const ext = extFor(file.type, originalName);
    const filename = `${id}${ext}`;
    const target = path.join(uploadDir(), filename);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(target, buf);

    const url = `/uploads/${filename}`;
    const m = await medyaKaydet({
      id,
      ad: originalName,
      url,
      mime: file.type,
      boyut: file.size,
    });

    return NextResponse.json({ ok: true, medya: m });
  });
}
