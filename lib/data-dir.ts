import path from "path";
import { getSiteContext } from "@/lib/site-context";
import { getRequestSite } from "@/lib/site-request";
import { slugFromPrefix } from "@/lib/site-config";

/** Tek deploy’da varsayılan veri klasörü — `getRequestSite` dışı */
function defaultDataSubdir(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH;
  if (raw === undefined) return "kuafor";
  const t = raw.trim();
  if (t === "" || t === "/") return "default";
  return slugFromPrefix(t.startsWith("/") ? t : `/${t}`);
}

/** `data/{subdir}` mutlak yol (sitemap / toplu işler). */
export function siteDataRoot(subdir: string): string {
  return path.join(process.cwd(), "data", subdir);
}

/**
 * JSON veri kökü: önce API `runWithSiteContext`, yoksa `getRequestSite()` (RSC).
 */
export async function getDataDir(): Promise<string> {
  const ctx = getSiteContext();
  if (ctx?.subdir) return siteDataRoot(ctx.subdir);
  try {
    const { subdir } = await getRequestSite();
    return siteDataRoot(subdir);
  } catch {
    return siteDataRoot(defaultDataSubdir());
  }
}
