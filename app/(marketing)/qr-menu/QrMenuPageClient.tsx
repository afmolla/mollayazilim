"use client";

import type { QrMenuData } from "@/lib/qr-menu-store";
import Image from "next/image";

export function QrMenuPageClient({ menu }: { menu: QrMenuData }) {
  const sorted = [...menu.kategoriler].sort((a, b) => a.sira - b.sira);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl">{menu.baslik}</h1>
        {menu.altBaslik ? (
          <p className="mt-3 text-base text-[var(--muted)] md:text-lg">{menu.altBaslik}</p>
        ) : null}
      </header>

      <div className="mt-12 space-y-12">
        {sorted.map((kat) => (
          <section key={kat.id} className="scroll-mt-24">
            <h2 className="border-b border-[var(--border)] pb-2 text-xl font-semibold text-[var(--text)]">
              {kat.baslik}
            </h2>
            {kat.aciklama ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{kat.aciklama}</p>
            ) : null}
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {[...kat.ogeler]
                .sort((a, b) => a.sira - b.sira)
                .map((u) => {
                  const hasImg = !!(u.gorselSrc && u.gorselSrc.trim());
                  return (
                    <li
                      key={u.id}
                      className="group flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                        {hasImg ? (
                          <Image
                            src={u.gorselSrc!}
                            alt={u.gorselAlt || u.ad}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[var(--muted)]">
                            {u.ad?.trim()?.slice(0, 2)?.toUpperCase() || "•"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 truncate font-semibold text-[var(--text)]">{u.ad}</p>
                          {u.fiyat ? (
                            <p className="shrink-0 rounded-full bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--brand)]">
                              {u.fiyat}
                            </p>
                          ) : null}
                        </div>
                        {u.aciklama ? (
                          <p className="mt-1 overflow-hidden text-sm text-[var(--muted)] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                            {u.aciklama}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
