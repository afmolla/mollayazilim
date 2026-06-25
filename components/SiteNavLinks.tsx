"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/menu-store";
import { isNavActive, menuItemActive } from "@/lib/nav-active";
import { usePrefixedNavHref } from "@/components/SitePrefixProvider";

export type NavLinkItem = MenuItem;

function linkClass(active: boolean, tone: "light" | "dark") {
  if (tone === "dark") {
    return active
      ? "block whitespace-nowrap font-semibold text-emerald-300 underline decoration-2 underline-offset-4"
      : "block whitespace-nowrap text-emerald-100/75 transition hover:text-emerald-200";
  }
  return active
    ? "block whitespace-nowrap font-semibold text-[var(--brand)] underline decoration-2 underline-offset-4"
    : "block whitespace-nowrap text-[var(--muted)] transition hover:text-[var(--brand)]";
}

export function SiteNavLinks({ links, tone = "light" }: { links: NavLinkItem[]; tone?: "light" | "dark" }) {
  const pathname = usePathname() ?? "/";
  const pf = usePrefixedNavHref();

  return (
    <ul
      role="list"
      className="m-0 flex w-full max-w-full min-w-0 list-none flex-row flex-nowrap items-center justify-center gap-x-1.5 overflow-x-auto overscroll-x-contain px-0 py-0.5 text-xs font-medium [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-x-2 md:gap-x-2.5 md:text-sm lg:gap-x-3 [&::-webkit-scrollbar]:hidden"
    >
      {links.map((n, i) => {
        const hasChildren = (n.children?.length ?? 0) > 0;
        const active = menuItemActive(pathname, n);

        if (!hasChildren) {
          const leafActive = isNavActive(pathname, n.href, n.newTab);
          return (
            <li key={`${n.href}-${i}`} className="shrink-0 list-none">
              <Link
                href={pf(n.href)}
                target={n.newTab ? "_blank" : undefined}
                rel={n.newTab ? "noreferrer" : undefined}
                className={linkClass(leafActive, tone)}
                aria-current={leafActive ? "page" : undefined}
              >
                {n.label}
              </Link>
            </li>
          );
        }

        return (
          <li key={`${n.label}-${i}`} className="group relative shrink-0 list-none">
            {n.href === "#" ? (
              <span
                className={[
                  linkClass(active, tone),
                  "cursor-default px-0.5 py-0.5",
                  "after:ml-0.5 after:text-[10px] after:content-['▾']",
                ].join(" ")}
                aria-current={active ? "true" : undefined}
              >
                {n.label}
              </span>
            ) : (
              <Link
                href={pf(n.href)}
                target={n.newTab ? "_blank" : undefined}
                rel={n.newTab ? "noreferrer" : undefined}
                className={[linkClass(isNavActive(pathname, n.href, n.newTab) || active, tone), "px-0.5 py-0.5"].join(" ")}
                aria-current={isNavActive(pathname, n.href, n.newTab) ? "page" : undefined}
              >
                {n.label}
                <span className="ml-0.5 text-[10px] opacity-70">▾</span>
              </Link>
            )}
            <div className="pointer-events-none invisible absolute left-0 top-full z-[60] min-w-[10rem] pt-1 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              <ul
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl"
                role="list"
              >
                {(n.children ?? []).map((c, ci) => {
                  const cActive = isNavActive(pathname, c.href, c.newTab);
                  return (
                    <li key={`${c.href}-${ci}`} className="list-none">
                      <Link
                        href={pf(c.href)}
                        target={c.newTab ? "_blank" : undefined}
                        rel={c.newTab ? "noreferrer" : undefined}
                        className={
                          cActive
                            ? "block px-3 py-2 text-sm font-semibold text-[var(--brand)]"
                            : "block px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
                        }
                        aria-current={cActive ? "page" : undefined}
                      >
                        {c.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
