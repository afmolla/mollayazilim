"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { stripSitePrefix } from "@/lib/base-path";
import { panelEditUrlFromPathname } from "@/lib/panel-deeplink";
import { useWithBase } from "@/components/SitePrefixProvider";

const EDIT_Q = "vf_edit";

/**
 * Vitrin layout’unda: ?vf_edit=1 ve panel oturumu varken üstte Elementor-benzeri çubuk.
 */
export function SiteEditModeHost({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const wb = useWithBase();
  const searchParams = useSearchParams();
  const vfEdit = searchParams.get(EDIT_Q) === "1";
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    try {
      const res = await fetch(wb("/api/panel/session"), { credentials: "same-origin", cache: "no-store" });
      const j = (await res.json()) as { ok?: boolean };
      setSessionOk(!!j.ok);
    } catch {
      setSessionOk(false);
    }
  }, [wb]);

  useEffect(() => {
    if (!vfEdit) return;
    queueMicrotask(() => {
      setSessionOk(null);
      void check();
    });
  }, [vfEdit, check, wb]);

  const showBar = vfEdit && sessionOk === true;
  const showNeedLogin = vfEdit && sessionOk === false;
  const showChecking = vfEdit && sessionOk === null;
  const deep = panelEditUrlFromPathname(pathname);
  const vitrinSayfa = useMemo(() => {
    const p = stripSitePrefix(pathname).replace(/\/+$/, "") || "/";
    return (
      p.startsWith("/p/") ||
      ["/anasayfa", "/hizmetler", "/galeri", "/iletisim", "/qr-menu"].includes(p) ||
      p === "/"
    );
  }, [pathname]);

  const closeEditBarHref = useMemo(() => {
    const q = new URLSearchParams(searchParams.toString());
    q.delete(EDIT_Q);
    const s = q.toString();
    return s ? `${pathname}?${s}` : pathname;
  }, [pathname, searchParams]);

  return (
    <>
      {showChecking ? (
        <div
          className="fixed inset-x-0 top-0 z-[100] border-b border-black/10 bg-[var(--brand)]/90 px-3 py-2 text-center text-[11px] text-[var(--on-brand)] sm:text-xs"
          role="status"
          aria-live="polite"
        >
          Oturum kontrol ediliyor…
        </div>
      ) : null}

      {showNeedLogin ? (
        <div
          className="fixed inset-x-0 top-0 z-[100] flex flex-wrap items-center gap-2 border-b border-amber-900/20 bg-amber-100 px-3 py-2 text-xs text-amber-950 shadow-md dark:bg-amber-950/90 dark:text-amber-50 sm:text-sm"
          role="region"
          aria-label="Düzenleme için giriş gerekli"
        >
          <span className="font-semibold">Görsel düzenleme</span>
          <span className="opacity-90">
            Turuncu çubuk için önce yönetim paneline giriş yapın (bu sekmede veya yeni sekmede açın).
          </span>
          <Link
            href={wb("/panel")}
            className="ml-auto inline-flex items-center rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95 dark:bg-amber-200 dark:text-amber-950 sm:ml-0"
          >
            Panele giriş
          </Link>
          <Link
            href={closeEditBarHref}
            className="inline-flex items-center rounded-lg px-2 py-1 text-[11px] underline sm:text-xs"
            prefetch={false}
          >
            Modu kapat
          </Link>
        </div>
      ) : null}

      {showBar ? (
        <div
          className="fixed inset-x-0 top-0 z-[100] flex flex-wrap items-center gap-2 border-b border-black/10 bg-[var(--brand)] px-3 py-2 text-xs text-[var(--on-brand)] shadow-md sm:text-sm"
          role="region"
          aria-label="Görsel düzenleme modu"
        >
          <span className="font-semibold">Görsel düzenleme</span>
          <span className="hidden opacity-90 sm:inline">
            — Tıklayarak ilgili içeriği panelde açın.
            {vitrinSayfa
              ? " Bu sayfada çift tık metin; sağ tık menü; menüden açtığınız tüm vitrin ve /p/... sayfalarında aynı mantık."
              : ""}
          </span>
          <Link
            href={deep.href}
            className="ml-auto inline-flex items-center rounded-lg bg-[var(--on-brand)] px-3 py-1.5 text-xs font-semibold text-[var(--brand)] hover:opacity-95 sm:ml-0"
          >
            Bu sayfayı düzenle ({deep.label})
          </Link>
          <Link
            href={wb("/panel")}
            className="inline-flex items-center rounded-lg border border-[var(--on-brand)]/40 bg-transparent px-3 py-1.5 text-xs font-medium hover:bg-[var(--on-brand)]/15"
          >
            Panele dön
          </Link>
          <Link
            href={closeEditBarHref}
            className="inline-flex items-center rounded-lg px-2 py-1 text-[11px] opacity-90 hover:underline sm:text-xs"
            prefetch={false}
          >
            Çubuğu kapat
          </Link>
        </div>
      ) : null}

      {showChecking || showNeedLogin || showBar ? (
        <div className="pointer-events-none h-11 shrink-0 sm:h-12" aria-hidden />
      ) : null}

      {children}
    </>
  );
}
