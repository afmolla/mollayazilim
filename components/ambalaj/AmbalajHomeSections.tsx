"use client";

import Link from "next/link";
import type { AmbalajHome } from "@/lib/ambalaj-home-defaults";
import { normalizeAmbalajImageSrc, ESNEK_AMBALAJ_IMAGES } from "@/lib/esnek-ambalaj-images";
import { publicHref } from "@/lib/base-path";
import { VitrinImage } from "@/components/vitrin/VitrinImage";

type Props = {
  data: AmbalajHome;
  pathname: string;
};

export function AmbalajHomeSections({ data, pathname }: Props) {
  const ph = (href: string) => publicHref(href, pathname);

  return (
    <div className="ambalaj-home-sections bg-[#041008] text-emerald-50">
      {data.promoBar?.trim() ? (
        <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-cyan-950/50 px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-emerald-100/90 md:text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
            {data.promoBar}
          </span>
        </div>
      ) : null}

      {/* Kategori vitrin — bento grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-400/80">Katalog</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">{data.kategoriBaslik}</h2>
          <p className="mt-4 text-sm leading-relaxed text-emerald-100/65 md:text-base">{data.kategoriAciklama}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2 lg:gap-5">
          {data.kategoriler.map((k, i) => {
            const span =
              i === 0
                ? "lg:col-span-3 lg:row-span-2"
                : i === 1
                  ? "lg:col-span-3"
                  : "lg:col-span-2";
            const tall = i === 0;
            return (
              <Link
                key={k.id}
                href={ph(k.href)}
                className={`group relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-950/30 shadow-xl transition hover:-translate-y-1 hover:border-emerald-400/35 hover:shadow-emerald-900/30 ${span}`}
              >
                <div className={`relative w-full ${tall ? "min-h-[280px] lg:min-h-full lg:h-full" : "min-h-[160px]"}`}>
                  <VitrinImage
                    src={normalizeAmbalajImageSrc(k.imageSrc, ESNEK_AMBALAJ_IMAGES.texture1)}
                    alt={k.imageAlt}
                    fill
                    className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-85"
                    sizes="(max-width:768px) 100vw, 400px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#041008] via-[#041008]/50 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.15),transparent_50%)]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  {k.vurgu ? (
                    <span className="mb-2 inline-block rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-100">
                      {k.vurgu}
                    </span>
                  ) : null}
                  <h3 className={`font-bold text-white ${tall ? "text-xl md:text-2xl" : "text-lg"}`}>{k.baslik}</h3>
                  <p className="mt-1 text-sm text-emerald-100/70">{k.altBaslik}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 opacity-0 transition group-hover:opacity-100">
                    İncele <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Öne çıkan formatlar */}
      <section className="border-y border-emerald-500/10 bg-[#061510]/80 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400/80">Referans formatlar</p>
              <h2 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">{data.oneCikanBaslik}</h2>
              <p className="mt-2 max-w-2xl text-sm text-emerald-100/60">{data.oneCikanAciklama}</p>
            </div>
            <Link
              href={ph("/hizmetler")}
              className="shrink-0 rounded-xl border border-emerald-400/25 px-5 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/10"
            >
              Tüm ürün listesi
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.oneCikan.map((p) => (
              <Link
                key={p.id}
                href={ph(p.href)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-emerald-500/[0.06]"
              >
                {p.imageSrc ? (
                  <div className="relative h-36 w-full shrink-0 border-b border-white/6">
                    <VitrinImage
                      src={normalizeAmbalajImageSrc(p.imageSrc, ESNEK_AMBALAJ_IMAGES.doypack)}
                      alt={p.imageAlt ?? p.baslik}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="400px"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061510] via-transparent to-transparent" />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold leading-snug text-white group-hover:text-emerald-50">{p.baslik}</h3>
                  {p.etiket ? (
                    <span className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                      {p.etiket}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-emerald-100/55">{p.ozellik}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-xs font-medium text-emerald-400/90">{p.minSiparis}</span>
                  <span className="text-xs font-semibold text-emerald-300 opacity-0 transition group-hover:opacity-100">
                    Teklif al →
                  </span>
                </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Güven şeridi */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <h2 className="sr-only">{data.guvenBaslik}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.guven.map((g) => (
            <div
              key={g.baslik}
              className="rounded-2xl border border-emerald-500/12 bg-gradient-to-br from-emerald-950/40 to-transparent p-5"
            >
              <p className="text-sm font-bold text-emerald-300">{g.baslik}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/55">{g.aciklama}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sektör bandı */}
      <section className="bg-[#081810] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">{data.sektorBaslik}</h2>
            <p className="mt-3 text-sm text-emerald-100/60">{data.sektorAciklama}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {data.sektorler.map((s) => (
              <Link
                key={s.baslik}
                href={ph(s.href)}
                className="group overflow-hidden rounded-2xl border border-emerald-500/12 bg-black/20"
              >
                <div className="relative h-40">
                  <VitrinImage
                    src={normalizeAmbalajImageSrc(s.imageSrc, ESNEK_AMBALAJ_IMAGES.texture2)}
                    alt={s.imageAlt}
                    fill
                    className="object-cover opacity-45 transition group-hover:scale-105 group-hover:opacity-60"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081810] to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white">{s.baslik}</h3>
                  <p className="mt-2 text-sm text-emerald-100/60">{s.aciklama}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden border-t border-emerald-500/15 py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.12),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">{data.ctaBand.baslik}</h2>
          <p className="mt-4 text-sm leading-relaxed text-emerald-100/70 md:text-base">{data.ctaBand.aciklama}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ph(data.ctaBand.primaryHref)}
              className="rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400"
            >
              {data.ctaBand.primaryLabel}
            </Link>
            <Link
              href={ph(data.ctaBand.secondaryHref)}
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              {data.ctaBand.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
