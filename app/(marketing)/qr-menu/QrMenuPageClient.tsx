"use client";

import type { QrMenuData } from "@/lib/qr-menu-store";

export function QrMenuPageClient({ menu }: { menu: QrMenuData }) {
  const sorted = [...menu.kategoriler].sort((a, b) => a.sira - b.sira);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
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
            <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              {[...kat.ogeler]
                .sort((a, b) => a.sira - b.sira)
                .map((u) => (
                  <li key={u.id} className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--text)]">{u.ad}</p>
                      {u.aciklama ? (
                        <p className="mt-0.5 text-sm text-[var(--muted)]">{u.aciklama}</p>
                      ) : null}
                    </div>
                    {u.fiyat ? (
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand)]">{u.fiyat}</p>
                    ) : null}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
