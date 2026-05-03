import { embedIframeSrc, parseVideoUrl } from "@/lib/video-embed";

/** Sunucu + istemci güvenli: fs yok — panel önizlemesi buradan import eder */
export type SayfaBlok =
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "button"; label: string; href: string; newTab?: boolean }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; kaynak?: string }
  | { type: "video"; url: string }
  | { type: "divider" }
  | { type: "html"; html: string };

function slugify(raw: string): string {
  return raw
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Panelde başlıktan slug önerisi — `pages-store` ile aynı kurallar */
export function sayfaSlugify(raw: string): string {
  return slugify(raw);
}

export function bloklardanHtml(bloklar: SayfaBlok[]): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  return bloklar
    .map((b) => {
      if (b.type === "heading") {
        const lvl = b.level === 3 ? 3 : 2;
        return `<h${lvl}>${esc(b.text ?? "")}</h${lvl}>`;
      }
      if (b.type === "paragraph") {
        return `<p>${esc(b.text ?? "")}</p>`;
      }
      if (b.type === "list") {
        const items = (b.items ?? []).map((x) => `<li>${esc(String(x))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      if (b.type === "button") {
        const label = esc(b.label ?? "Buton");
        const href = esc(b.href ?? "#");
        const extra = b.newTab ? ` target="_blank" rel="noreferrer"` : "";
        return `<p><a href="${href}"${extra} class="inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-[var(--on-brand)]">${label}</a></p>`;
      }
      if (b.type === "image") {
        const src = esc(b.src ?? "");
        const alt = esc(b.alt ?? "");
        const cap = b.caption ? `<figcaption class="mt-2 text-sm text-[var(--muted)]">${esc(b.caption)}</figcaption>` : "";
        return `<figure class="mt-6"><img src="${src}" alt="${alt}" class="w-full rounded-2xl border border-[var(--border)]" />${cap}</figure>`;
      }
      if (b.type === "quote") {
        const text = esc(b.text ?? "");
        const kaynak = b.kaynak?.trim()
          ? `<cite class="mt-2 block text-sm not-italic text-[var(--muted)]">— ${esc(b.kaynak)}</cite>`
          : "";
        return `<blockquote class="my-6 border-l-4 border-[var(--brand)] pl-4 italic">${text}${kaynak}</blockquote>`;
      }
      if (b.type === "video") {
        const info = parseVideoUrl(b.url ?? "");
        if (!info) {
          return `<p class="text-sm text-red-600">Geçersiz video adresi (YouTube veya Vimeo).</p>`;
        }
        const src = esc(embedIframeSrc(info));
        return `<div class="relative my-6 aspect-video overflow-hidden rounded-2xl border border-[var(--border)]"><iframe src="${src}" class="absolute inset-0 h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="Video"></iframe></div>`;
      }
      if (b.type === "divider") {
        return `<hr class="my-8 border-[var(--border)]" />`;
      }
      return b.type === "html" ? String(b.html ?? "") : "";
    })
    .join("\n");
}
