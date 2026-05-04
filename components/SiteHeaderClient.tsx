"use client";

import Link from "next/link";
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
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 md:flex-row md:items-center md:gap-3 md:px-6 lg:gap-5">
        <div className="flex w-full min-w-0 shrink-0 items-center gap-2 md:w-auto md:max-w-[min(100%,220px)] lg:max-w-[260px]">
          <div className="flex min-w-0 items-center gap-3">
            <MobileNav brand={props.brand} items={props.items} />
            <Link href={wb("/anasayfa")} className="truncate text-lg font-bold tracking-tight text-[var(--text)]">
              {props.brand}
            </Link>
          </div>
        </div>

        <nav
          className="site-header-nav flex min-w-0 flex-1 items-center justify-center md:justify-center"
          aria-label="Ana menü"
        >
          <SiteNavLinks links={props.navLinks} />
        </nav>

        <div className="hidden shrink-0 md:block">
          <SiteAnalyticsBadge />
        </div>
      </div>
    </header>
  );
}
