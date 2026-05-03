"use client";

import Link from "next/link";
import { useMemo } from "react";

type MenuItem = { label: string; href: string; newTab?: boolean };

export function SideNav(props: {
  brand: string;
  items: MenuItem[];
  mode: "hover" | "sabit";
}) {
  const isHover = props.mode === "hover";

  const items = useMemo(
    () => props.items.filter((x) => x.label && x.href),
    [props.items]
  );

  return (
    <aside
      className={[
        "group",
        "hidden md:block",
        "fixed left-0 top-0 z-50 h-screen",
        "border-r border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md",
        "transition-[width] duration-200",
        isHover ? "w-16 hover:w-64" : "w-64",
        "overflow-hidden",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-[var(--border)] px-4 py-4">
          <Link
            href="/"
            className="block truncate text-sm font-bold tracking-tight text-[var(--text)]"
            title={props.brand}
          >
            {props.brand}
          </Link>
          {isHover ? (
            <p className="mt-1 hidden text-xs text-[var(--muted)] group-hover:block">
              Menü
            </p>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Sol menü">
          <ul className="space-y-1">
            {items.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  target={n.newTab ? "_blank" : undefined}
                  rel={n.newTab ? "noreferrer" : undefined}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
                    "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--brand)]",
                  ].join(" ")}
                  title={n.label}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--border)]" />
                  <span className={isHover ? "truncate opacity-0 group-hover:opacity-100" : "truncate"}>
                    {n.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

