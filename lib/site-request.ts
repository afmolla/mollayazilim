import { headers } from "next/headers";
import { dataSubdirForPrefix, portfolioPrefixes } from "@/lib/site-config";

/** Sunucu bileşenlerinde middleware başlıklarından site öneği ve veri alt klasörü. */
export async function siteFromRequestHeaders(): Promise<{ prefix: string; subdir: string }> {
  try {
    const h = await headers();
    let prefix = h.get("x-site-prefix")?.trim() ?? "";
    let subdir = h.get("x-data-subdir")?.trim() ?? "";
    if (!prefix) {
      const first = portfolioPrefixes()[0];
      prefix = first;
      subdir = dataSubdirForPrefix(first);
    }
    return { prefix, subdir };
  } catch {
    const first = portfolioPrefixes()[0];
    return { prefix: first, subdir: dataSubdirForPrefix(first) };
  }
}
