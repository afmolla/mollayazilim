"use client";

import { isNavActive } from "@/lib/nav-active";

export type PreviewNavItem = { label: string; href: string; newTab?: boolean };

/** Panel içindeki tam sayfa önizlemesi: üst çubuk sitenin header menüsünü taklit eder (tıklama yok). */
export function PanelPreviewSiteChrome(props: {
  brand: string;
  links: PreviewNavItem[];
  /** Örn. `/p/sayfa-slug` — hangi menü öğesinin vurgulu görüneceği */
  activePath: string;
}) {
  const { brand, links, activePath } = props;
  const nav = links.filter((l) => l.label?.trim() && l.href?.trim());

  return (
    <div className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="shrink-0 truncate text-sm font-bold tracking-tight text-[var(--text)]">{brand}</p>
        <nav
          className="site-header-nav flex min-w-0 flex-1 items-center justify-center overflow-x-auto sm:justify-center"
          aria-label="Önizleme: üst menü"
        >
          <ul
            role="list"
            className="m-0 flex w-full max-w-full list-none flex-row flex-nowrap items-center justify-center gap-x-1.5 py-0.5 text-[11px] font-medium sm:gap-x-2 sm:text-xs md:gap-2.5 md:text-sm"
          >
            {nav.map((n, i) => {
              const active = isNavActive(activePath, n.href, n.newTab);
              return (
                <li key={`${i}-${n.href}`} className="shrink-0 list-none">
                  <span
                    className={
                      active
                        ? "block cursor-default whitespace-nowrap font-semibold text-[var(--brand)] underline decoration-2 underline-offset-4"
                        : "block cursor-default whitespace-nowrap text-[var(--muted)]"
                    }
                  >
                    {n.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
