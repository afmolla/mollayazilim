import { readFile } from "fs/promises";
import path from "path";

/** Let's Encrypt http-01 — IIS proxy uzerinden Node dosyayi sunar */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!token || !/^[A-Za-z0-9_-]+$/.test(token)) {
    return new Response("Not found", { status: 404 });
  }
  const candidates = [
    path.join(process.cwd(), "public", ".well-known", "acme-challenge", token),
    path.join(process.cwd(), ".well-known", "acme-challenge", token),
  ];
  for (const file of candidates) {
    try {
      const body = await readFile(file, "utf8");
      return new Response(body.trim(), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch {
      /* sonraki yol */
    }
  }
  return new Response("Not found", { status: 404 });
}
