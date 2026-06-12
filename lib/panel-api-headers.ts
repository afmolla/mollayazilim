import { dataSubdirForPrefix } from "@/lib/site-config";
import { MOLLA_SITE_PREFIX_SENTINEL } from "@/lib/site-proxy-headers";

/** Panel istemcisinden API'ye kiracı bağlamı (proxy yedeklemesi). */
export function panelApiHeaders(prefix: string): Record<string, string> {
  const p = prefix.trim();
  if (!p) {
    return { "x-site-prefix": MOLLA_SITE_PREFIX_SENTINEL, "x-data-subdir": "molla" };
  }
  return { "x-site-prefix": p, "x-data-subdir": dataSubdirForPrefix(p) };
}

export function mergePanelApiHeaders(prefix: string, init?: RequestInit): RequestInit {
  const h = new Headers(init?.headers);
  for (const [k, v] of Object.entries(panelApiHeaders(prefix))) {
    h.set(k, v);
  }
  return { ...init, headers: h, credentials: init?.credentials ?? "same-origin" };
}
