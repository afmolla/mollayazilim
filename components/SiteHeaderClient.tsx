"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWithBase } from "@/components/SitePrefixProvider";
import type { MenuItem } from "@/lib/menu-store";
import { MobileNav } from "@/components/MobileNav";
import { SiteNavLinks } from "@/components/SiteNavLinks";
import { SiteAnalyticsBadge } from "@/components/SiteAnalyticsBadge";
import { CartButton } from "@/components/ambalaj/CartButton";

export function SiteHeaderClient(props: {
  brand: string;
  items: MenuItem[];
  navLinks: MenuItem[];
  ambalaj?: boolean;
}) {
  const wb = useWithBase();
  const pathname = usePathname() ?? "";
  const isRestaurant = pathname.includes("/restaurant");
  const isEmlak = pathname.includes("/emlak");
  const isAvukat = pathname.includes("/avukat");
  const isOtoyikama = pathname.includes("/otoyikama");
  const isKuaforKadin = pathname.includes("/kuafor-kadin");
  const isKuaforErkek = pathname.includes("/kuafor") && !isKuaforKadin;
  const isAmbalaj = props.ambalaj || pathname.includes("/ambalaj") || pathname.includes("/esnek-ambalaj");
  /** Beyaz şerit navbar yerine cam koyu vitrinler */
  const darkNav =
    isRestaurant ||
    isEmlak ||
    isAvukat ||
    isOtoyikama ||
    isKuaforErkek ||
    isKuaforKadin ||
    isAmbalaj;
  return (
    <header
      data-fixed-header
      className={
        isRestaurant
          ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-amber-900/25 bg-[#14110e]/88 backdrop-blur-xl"
          : isAmbalaj
            ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-emerald-500/20 bg-[#041008]/92 backdrop-blur-xl"
            : darkNav
            ? isEmlak
              ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-sky-500/15 bg-[#0a1628]/92 backdrop-blur-xl"
              : isAvukat
                ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-amber-500/20 bg-[#0c1525]/94 backdrop-blur-xl"
                : isOtoyikama
                  ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-cyan-400/25 bg-[#040608]/92 backdrop-blur-xl"
                  : isKuaforKadin
                  ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-rose-500/20 bg-[#140810]/92 backdrop-blur-xl"
                  : isKuaforErkek
                    ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-orange-500/20 bg-[#09090b]/92 backdrop-blur-xl"
                    : "fixed inset-x-0 top-0 z-50 h-16 border-b border-white/10 bg-black/45 backdrop-blur-xl"
            : "fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6 lg:gap-5">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <MobileNav brand={props.brand} items={props.items} />
          <Link
            href={wb("/anasayfa")}
            className={
              isRestaurant
                ? "truncate font-[family-name:var(--font-restaurant)] text-base font-semibold uppercase tracking-[0.18em] text-[#f5f0e8] md:text-[15px]"
                : darkNav
                  ? "truncate text-lg font-bold tracking-tight text-white drop-shadow-sm"
                  : "truncate text-lg font-bold tracking-tight text-[var(--text)]"
            }
          >
            {props.brand}
          </Link>
        </div>

        <nav className="site-header-nav hidden min-w-0 flex-1 items-center justify-center md:flex" aria-label="Ana menü">
          <SiteNavLinks links={props.navLinks} />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {isAmbalaj ? <CartButton /> : null}
          <div className="hidden md:block">
            <SiteAnalyticsBadge />
          </div>
        </div>
      </div>
    </header>
  );
}
