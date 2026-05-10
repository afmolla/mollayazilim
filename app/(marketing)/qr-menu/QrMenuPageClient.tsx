"use client";

import type { QrMenuData } from "@/lib/qr-menu-store";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function QrMenuPageClient({ menu }: { menu: QrMenuData }) {
  const pathname = usePathname() ?? "";
  const isRestaurant = pathname.includes("/restaurant");
  const sorted = [...menu.kategoriler].sort((a, b) => a.sira - b.sira);

  return (
    <div
      className={
        isRestaurant
          ? "restaurant-menu-root mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16"
          : "mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14"
      }
    >
      <header className="text-center">
        <h1
          className={
            isRestaurant
              ? "font-[family-name:var(--font-restaurant)] text-4xl font-semibold tracking-tight text-[#faf7f2] md:text-5xl"
              : "text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl"
          }
        >
          {menu.baslik}
        </h1>
        {menu.altBaslik ? (
          <p
            className={
              isRestaurant ? "mt-4 text-base text-[#a89f94] md:text-lg" : "mt-3 text-base text-[var(--muted)] md:text-lg"
            }
          >
            {menu.altBaslik}
          </p>
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
                      className={
                        isRestaurant
                          ? "group flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 shadow-none backdrop-blur-sm transition hover:border-[var(--brand)]/30 hover:bg-white/[0.06]"
                          : "group flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      }
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
