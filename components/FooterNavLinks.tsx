"use client";

import Link from "next/link";
import type { MenuItem } from "@/lib/menu-store";
import { usePrefixedNavHref } from "@/components/SitePrefixProvider";

function FooterMenuEntry({
  item,
  hoverClass,
  labelClass,
}: {
  item: MenuItem;
  hoverClass: string;
  labelClass: string;
}) {
  const pf = usePrefixedNavHref();
  const hasChildren = (item.children?.length ?? 0) > 0;
  return (
    <li className="shrink-0">
      {item.href && item.href !== "#" ? (
        <Link
          href={pf(item.href)}
          className={`inline-block whitespace-nowrap ${hoverClass}`}
          target={item.newTab ? "_blank" : undefined}
          rel={item.newTab ? "noreferrer" : undefined}
        >
          {item.label}
        </Link>
      ) : (
        <span className={`font-medium ${labelClass}`}>{item.label}</span>
      )}
      {hasChildren ? (
        <ul className="mt-1.5 space-y-1 border-l border-[var(--border)] pl-3">
          {(item.children ?? []).map((c, j) => (
            <li key={`${c.href}-${j}`}>
              <Link
                href={pf(c.href)}
                className={`inline-block whitespace-nowrap ${hoverClass}`}
                target={c.newTab ? "_blank" : undefined}
                rel={c.newTab ? "noreferrer" : undefined}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function FooterNavLinks({ items, tone = "light" }: { items: MenuItem[]; tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-emerald-100/60" : "text-[var(--muted)]";
  const hover = tone === "dark" ? "hover:text-emerald-200" : "hover:text-[var(--brand)]";
  return (
    <ul className={`mt-3 flex flex-col gap-3 text-sm ${muted}`}>
      {items.map((n, i) => (
        <FooterMenuEntry key={`${n.label}-${i}`} item={n} hoverClass={hover} labelClass={tone === "dark" ? "text-emerald-100" : "text-[var(--text)]"} />
      ))}
    </ul>
  );
}
