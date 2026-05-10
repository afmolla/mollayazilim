"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWithBase } from "@/components/SitePrefixProvider";
import type { MenuItem } from "@/lib/menu-store";
import { MobileNav } from "@/components/MobileNav";
import { SiteNavLinks } from "@/components/SiteNavLinks";
import { SiteAnalyticsBadge } from "@/components/SiteAnalyticsBadge";

export function SiteHeaderClient(props: {
  brand: string;
  items: MenuItem[];
  navLinks: MenuItem[];
}) {
  const wb = useWithBase();
  const pathname = usePathname() ?? "";
  const isRestaurant = pathname.includes("/restaurant");
  const isEmlak = pathname.includes("/emlak");
  return (
    <header
      data-fixed-header
      className={
        isRestaurant
          ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-white/10 bg-black/45 backdrop-blur-xl"
          : isEmlak
            ? "fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--border)] bg-[var(--surface)] shadow-[var(--emlak-shadow)] backdrop-blur-md"
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
                : "truncate text-lg font-bold tracking-tight text-[var(--text)]"
            }
          >
            {props.brand}
          </Link>
        </div>

        <nav className="site-header-nav hidden min-w-0 flex-1 items-center justify-center md:flex" aria-label="Ana menü">
          <SiteNavLinks links={props.navLinks} />
        </nav>

        <div className="ml-auto hidden shrink-0 md:block">
          <SiteAnalyticsBadge />
        </div>
      </div>
    </header>
  );
}
