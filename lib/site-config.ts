/**
 * Aynı deploy’da birden fazla vitrin kökü: `/kuafor`, `/restaurant`, …
 * `NEXT_PUBLIC_PORTFOLIO_PREFIXES=/kuafor,/restaurant` (varsayılan bu ikisi).
 * Her önek için veri: `data/{slug}/` (slug = önekten `/` kaldırılmış).
 */
function normalizeList(raw: string | undefined): string[] {
  const s = (raw ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const seg of s) {
    const p = seg.startsWith("/") ? seg : `/${seg}`;
    const clean = p.replace(/\/+$/, "") || "";
    if (clean && !out.includes(clean)) out.push(clean);
  }
  return out;
}

/** Ortam değişkeni boş/bozuksa vitrin yolları kaybolmasın */
const DEFAULT_PORTFOLIO_PREFIXES = [
  "/kuafor",
  "/kuafor-kadin",
  "/restaurant",
  "/emlak",
  "/avukat",
] as const;

export function portfolioPrefixes(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_PORTFOLIO_PREFIXES;
  if (fromEnv !== undefined && fromEnv.trim() !== "") {
    const list = normalizeList(fromEnv);
    if (list.length > 0) return list;
  }
  return [...DEFAULT_PORTFOLIO_PREFIXES];
}

export function slugFromPrefix(prefix: string): string {
  const p = prefix.startsWith("/") ? prefix.slice(1) : prefix;
  return p.replace(/\/+$/, "") || "default";
}

export function dataSubdirForPrefix(prefix: string): string {
  return slugFromPrefix(prefix);
}

export function isPortfolioPath(pathname: string): string | null {
  const p = pathname.split("?")[0] || "/";
  for (const base of portfolioPrefixes()) {
    if (p === base || p === `${base}/`) return base;
    if (p.startsWith(`${base}/`)) return base;
  }
  return null;
}
