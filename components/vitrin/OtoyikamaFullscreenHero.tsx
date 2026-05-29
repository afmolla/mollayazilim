"use client";

import { VitrinImage } from "@/components/vitrin/VitrinImage";
import { publicHref } from "@/lib/base-path";
import { OTOYIKAMA_HERO_SIDES, OTOYIKAMA_IMAGES, normalizeOtoImageSrc } from "@/lib/otoyikama-images";
import { CtaBlock } from "@/components/vf-inline/CtaBlock";
import { EditableText } from "@/components/vf-inline/EditableText";
import { newVfId } from "@/components/vf-inline/newVfId";
import { vfHizaFlexClass } from "@/components/vf-inline/vf-layout";
import type { KuaforHeroProps } from "@/components/kuafor-vitrin/kuafor-hero-types";

const SERVICE_PILLS = ["Oto yıkama", "Pasta cila", "Seramik kaplama", "İç+dış paket"] as const;

/** Oto yıkama & detailing — su damlası + premium parlaklık teması */
export function OtoyikamaFullscreenHero(props: KuaforHeroProps) {
  const { home, inline, salonAdLive, setSalonAdLive, patchSalonAd, updateHome, pathname, openCtx, heroAltBlokMenuItems } =
    props;

  const heroSrc = normalizeOtoImageSrc(home.heroImageSrc, OTOYIKAMA_IMAGES.hero);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#040608]">
      <div
        className="absolute inset-0 z-0"
        data-vf-zone="hero-image"
        onContextMenu={(e) =>
          openCtx(e, [
            {
              id: "img-url",
              label: "Görsel URL değiştir…",
              run: () => {
                const u = window.prompt("Görsel adresi", home.heroImageSrc);
                if (u == null) return;
                updateHome((h) => ({ ...h, heroImageSrc: u.trim() || h.heroImageSrc }));
              },
            },
            {
              id: "img-alt",
              label: "Alt metin…",
              run: () => {
                const a = window.prompt("Alt metin", home.heroImageAlt);
                if (a == null) return;
                updateHome((h) => ({ ...h, heroImageAlt: a }));
              },
            },
          ])
        }
      >
        <VitrinImage
          key={heroSrc}
          src={heroSrc}
          alt={home.heroImageAlt}
          fill
          className="object-cover opacity-80"
          sizes="100vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#040608]/75 via-[#071018]/55 to-[#040608]/80" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(34,211,238,0.2),transparent_50%)] otoyikama-glow-pulse" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(251,191,36,0.1),transparent_45%)]" />
        <div className="otoyikama-shimmer pointer-events-none absolute inset-0 opacity-25" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#040608] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-24 pt-28 md:grid-cols-2 md:gap-12 md:px-10 md:pb-28 md:pt-32">
        <div className="max-w-xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.42em] text-cyan-400/90">
            Demo oto yıkama vitrini · gerçek işletme değildir
          </p>
          <EditableText
            active={inline}
            tag="p"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400"
            value={home.badge}
            onCommit={(v) => updateHome((h) => ({ ...h, badge: v }))}
          />
          <EditableText
            active={inline}
            tag="h1"
            className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-[3.25rem]"
            value={home.baslik}
            onCommit={(v) => updateHome((h) => ({ ...h, baslik: v }))}
          />
          <div className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 md:text-lg">
            <EditableText
              active={inline}
              tag="span"
              className="font-semibold text-cyan-300"
              value={salonAdLive}
              onCommit={(v) => {
                const next = v.trim() || salonAdLive;
                setSalonAdLive(next);
                void patchSalonAd(next);
              }}
            />{" "}
            <EditableText
              active={inline}
              tag="span"
              className="text-slate-300"
              multiline
              value={home.aciklama}
              onCommit={(v) => updateHome((h) => ({ ...h, aciklama: v }))}
            />
          </div>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Hizmetler">
            {SERVICE_PILLS.map((label) => (
              <li
                key={label}
                className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200/90 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
              >
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            <CtaBlock
              inline={inline}
              href={publicHref(home.ctaPrimaryHref, pathname)}
              label={home.ctaPrimaryLabel}
              onLabel={(v) => updateHome((h) => ({ ...h, ctaPrimaryLabel: v }))}
              onCtxHref={(e) =>
                openCtx(e, [
                  {
                    id: "p-href",
                    label: "Birinci buton linki…",
                    run: () => {
                      const u = window.prompt("Link (ör. /randevu)", home.ctaPrimaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaPrimaryHref: u.trim() || h.ctaPrimaryHref }));
                    },
                  },
                ])
              }
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            />
            <CtaBlock
              inline={inline}
              href={publicHref(home.ctaSecondaryHref, pathname)}
              label={home.ctaSecondaryLabel}
              onLabel={(v) => updateHome((h) => ({ ...h, ctaSecondaryLabel: v }))}
              onCtxHref={(e) =>
                openCtx(e, [
                  {
                    id: "s-href",
                    label: "İkinci buton linki…",
                    run: () => {
                      const u = window.prompt("Link (ör. /hizmetler)", home.ctaSecondaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaSecondaryHref: u.trim() || h.ctaSecondaryHref }));
                    },
                  },
                ])
              }
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur-sm transition hover:bg-white/10"
            />
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-8">
            {[
              { k: "2.500+", v: "Araç / yıl" },
              { k: "9H", v: "Seramik koruma" },
              { k: "pH 7", v: "Nötr köpük" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-xl font-bold tabular-nums text-white md:text-2xl">{s.k}</dt>
                <dd className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Masaüstü görsel kolaj */}
        <div className="relative hidden md:block">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-transparent to-amber-400/10 blur-2xl otoyikama-glow-pulse" />
          <div className="relative grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-md">
            {OTOYIKAMA_HERO_SIDES.map((img) => (
              <div
                key={img.src}
                className={`relative overflow-hidden rounded-xl border border-white/10 ${img.className}`}
              >
                <VitrinImage src={img.src} alt={img.alt} fill className="object-cover transition duration-500 hover:scale-105" sizes="(max-width:768px) 50vw, 400px" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobil yatay görsel şerit */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:hidden snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {OTOYIKAMA_HERO_SIDES.map((img) => (
            <div key={img.src} className="relative h-44 w-64 shrink-0 snap-center overflow-hidden rounded-xl border border-white/10">
              <VitrinImage src={img.src} alt={img.alt} fill className="object-cover" sizes="256px" />
            </div>
          ))}
        </div>
      </div>

      {(home.heroAltBloklar ?? []).length > 0 || inline ? (
        <div className="relative z-10 mx-auto max-w-6xl border-t border-white/10 px-5 pb-16 pt-8 md:px-10">
          <div className="grid max-w-3xl grid-cols-1 gap-4" data-vf-hero-below>
            {(home.heroAltBloklar ?? []).map((bl, bi) => (
              <div
                key={bl.id}
                data-vf-hero-blok
                className={["min-w-0 w-full flex flex-col", vfHizaFlexClass(bl.hiza)].join(" ")}
                onContextMenu={(e) => openCtx(e, heroAltBlokMenuItems(bl, bi))}
              >
                {bl.tur === "metin" ? (
                  <EditableText
                    active={inline}
                    tag="p"
                    className="w-full text-sm leading-relaxed text-slate-400"
                    multiline
                    value={bl.metin}
                    onCommit={(v) =>
                      updateHome((h) => ({
                        ...h,
                        heroAltBloklar: (h.heroAltBloklar ?? []).map((x) =>
                          x.id === bl.id && x.tur === "metin" ? { ...x, metin: v } : x,
                        ),
                      }))
                    }
                  />
                ) : (
                  <div className="w-full overflow-hidden rounded-xl border border-white/15 bg-black/30">
                    <VitrinImage
                      key={bl.src}
                      src={bl.src.startsWith("http") ? OTOYIKAMA_IMAGES.wash : bl.src}
                      alt={bl.alt}
                      width={800}
                      height={450}
                      className="h-auto max-h-56 w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                )}
              </div>
            ))}
            {inline ? (
              <div
                data-vf-hero-tail
                className="flex min-h-[3.5rem] items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 px-2 py-3 text-center text-[11px] text-slate-500"
                onContextMenu={(e) =>
                  openCtx(e, [
                    {
                      id: "tail-txt",
                      label: "Buraya metin ekle",
                      run: () =>
                        updateHome((h) => ({
                          ...h,
                          heroAltBloklar: [
                            ...(h.heroAltBloklar ?? []),
                            { id: newVfId(), tur: "metin", metin: "Yeni metin — çift tıklayarak düzenleyin." },
                          ],
                        })),
                    },
                    {
                      id: "tail-img",
                      label: "Buraya görsel ekle",
                      run: () => {
                        const src = window.prompt("Görsel URL veya /vitrin/… yolu", OTOYIKAMA_IMAGES.wash);
                        if (src == null || !src.trim()) return;
                        const alt = window.prompt("Alt metin", "Görsel") ?? "";
                        updateHome((h) => ({
                          ...h,
                          heroAltBloklar: [
                            ...(h.heroAltBloklar ?? []),
                            { id: newVfId(), tur: "gorsel", src: src.trim(), alt: alt.trim() || "Görsel" },
                          ],
                        }));
                      },
                    },
                  ])
                }
              >
                Hero altı — sağ tık
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
