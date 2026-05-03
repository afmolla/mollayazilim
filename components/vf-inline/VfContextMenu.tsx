"use client";

import { useEffect, useState } from "react";

export type VfMenuItem = {
  id: string;
  label: string;
  /** Başlık satırı (tıklanamaz) */
  header?: boolean;
  disabled?: boolean;
  run?: () => void;
  children?: VfMenuItem[];
};

type Props = {
  open: boolean;
  x: number;
  y: number;
  items: VfMenuItem[];
  onClose: () => void;
};

export function VfContextMenu({ open, x, y, items, onClose }: Props) {
  const [openSub, setOpenSub] = useState<string | null>(null);

  useEffect(() => {
    if (!open) queueMicrotask(() => setOpenSub(null));
  }, [open]);

  if (!open) return null;

  const left = Math.min(x, typeof window !== "undefined" ? Math.max(8, window.innerWidth - 220) : x);
  const top = Math.min(y, typeof window !== "undefined" ? Math.max(8, window.innerHeight - 320) : y);

  return (
    <div
      className="fixed z-[140] min-w-[13rem] max-w-[min(100vw-1rem,18rem)] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 text-sm shadow-2xl"
      style={{ left, top }}
      onClick={(e) => e.stopPropagation()}
      role="menu"
    >
      {items.map((it) => {
        if (it.header) {
          return (
            <div
              key={it.id}
              className="pointer-events-none px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]"
            >
              {it.label}
            </div>
          );
        }
        if (it.children?.length) {
          const subOpen = openSub === it.id;
          return (
            <div key={it.id} className="relative">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[var(--surface-2)]"
                onClick={() => setOpenSub(subOpen ? null : it.id)}
              >
                <span>{it.label}</span>
                <span className="text-[10px] opacity-70">{subOpen ? "▾" : "▸"}</span>
              </button>
              {subOpen ? (
                <div className="border-t border-[var(--border)] bg-[var(--surface-2)] py-1">
                  {it.children.map((ch) =>
                    ch.header ? (
                      <div
                        key={ch.id}
                        className="pointer-events-none px-3 py-1 text-[10px] font-semibold uppercase text-[var(--muted)]"
                      >
                        {ch.label}
                      </div>
                    ) : (
                      <button
                        key={ch.id}
                        type="button"
                        role="menuitem"
                        disabled={ch.disabled}
                        className="block w-full px-4 py-2 text-left text-[13px] hover:bg-[var(--surface)] disabled:opacity-40"
                        onClick={() => {
                          ch.run?.();
                          onClose();
                        }}
                      >
                        {ch.label}
                      </button>
                    )
                  )}
                </div>
              ) : null}
            </div>
          );
        }
        return (
          <button
            key={it.id}
            type="button"
            role="menuitem"
            disabled={it.disabled}
            className="block w-full px-3 py-2 text-left hover:bg-[var(--surface-2)] disabled:opacity-40"
            onClick={() => {
              it.run?.();
              onClose();
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
