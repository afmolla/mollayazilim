"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { MenuItem } from "@/lib/menu-store";
import { isNavActive, menuItemActive } from "@/lib/nav-active";
import { useWithBase } from "@/components/SitePrefixProvider";

function filterMenu(items: MenuItem[]): MenuItem[] {
  return items
    .map((x) => ({
      ...x,
      children: x.children?.length ? filterMenu(x.children) : undefined,
    }))
    .filter((x) => x.label && (x.href || (x.children?.length ?? 0) > 0));
}

export function MobileNav(props: { brand: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const wb = useWithBase();
  const items = filterMenu(props.items);

  function Row({ n, depth }: { n: MenuItem; depth: number }) {
    const hasChildren = (n.children?.length ?? 0) > 0;
    const active = menuItemActive(pathname, n);

    if (!hasChildren) {
      const leafActive = isNavActive(pathname, n.href, n.newTab);
      return (
        <li>
          <Link
            href={n.href}
            target={n.newTab ? "_blank" : undefined}
            rel={n.newTab ? "noreferrer" : undefined}
            onClick={() => setOpen(false)}
            aria-current={leafActive ? "page" : undefined}
            style={{ paddingLeft: `${12 + depth * 12}px` }}
            className={
              leafActive
                ? "block rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--brand)]"
                : "block rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
            }
          >
            {n.label}
          </Link>
        </li>
      );
    }

    return (
      <li>
        <details className="group" open={active}>
          <summary
            className={[
              "cursor-pointer list-none rounded-xl px-3 py-2 text-sm font-medium marker:content-none",
              active ? "bg-[var(--surface-2)] text-[var(--brand)]" : "text-[var(--text)] hover:bg-[var(--surface-2)]",
            ].join(" ")}
            style={{ paddingLeft: `${12 + depth * 12}px` }}
          >
            <span className="mr-1 inline-block w-4 text-[10px] opacity-60">▸</span>
            {n.label}
            {n.href && n.href !== "#" ? (
              <Link
                href={n.href}
                className="ml-2 text-[11px] font-normal text-[var(--muted)] underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
              >
                git
              </Link>
            ) : null}
          </summary>
          <ul className="mt-0.5 space-y-0.5 border-l border-[var(--border)] pl-2">
            {(n.children ?? []).map((c, ci) => (
              <Row key={`${c.href}-${ci}`} n={c} depth={depth + 1} />
            ))}
          </ul>
        </details>
      </li>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)] md:hidden"
        aria-label="Menüyü aç"
      >
        <span className="h-0.5 w-5 rounded bg-[var(--text)]" />
        <span className="h-0.5 w-5 rounded bg-[var(--text)]" />
        <span className="h-0.5 w-5 rounded bg-[var(--text)]" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-xs border-r border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                href={wb("/anasayfa")}
                onClick={() => setOpen(false)}
                className="truncate text-base font-bold text-[var(--text)]"
              >
                {props.brand}
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
              >
                Kapat
              </button>
            </div>

            <nav className="mt-5">
              <ul className="space-y-1">
                {items.map((n, i) => (
                  <Row key={`${n.label}-${i}`} n={n} depth={0} />
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
