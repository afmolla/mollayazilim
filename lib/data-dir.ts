import path from "path";
import { getSiteContext } from "@/lib/site-context";
import { slugFromPrefix } from "@/lib/site-config";

/** Tek deploy’da varsayılan veri klasörü (örn. `kuafor`) */
function defaultDataSubdir(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH;
  if (raw === undefined) return "kuafor";
  const t = raw.trim();
  if (t === "" || t === "/") return "default";
  return slugFromPrefix(t.startsWith("/") ? t : `/${t}`);
}

/**
 * JSON veri dosyalarının kökü: `data/kuafor`, `data/restaurant`, …
 * İstek içinde `site-context` doluysa onu kullanır.
 */
export function getDataDir(): string {
  const ctx = getSiteContext();
  const sub = ctx?.subdir ?? defaultDataSubdir();
  return path.join(process.cwd(), "data", sub);
}
