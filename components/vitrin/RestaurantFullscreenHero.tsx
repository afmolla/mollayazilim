"use client";

import Image from "next/image";
import { publicHref } from "@/lib/base-path";
import { CtaBlock } from "@/components/vf-inline/CtaBlock";
import { EditableText } from "@/components/vf-inline/EditableText";
import { newVfId } from "@/components/vf-inline/newVfId";
import { vfHizaFlexClass } from "@/components/vf-inline/vf-layout";
import type { KuaforHeroProps } from "@/components/kuafor-vitrin/kuafor-hero-types";

/** Restoran — tam ekran görsel, fine dining hissi, mutfak odaklı demo */
export function RestaurantFullscreenHero(props: KuaforHeroProps) {
  const { home, inline, salonAdLive, setSalonAdLive, patchSalonAd, updateHome, pathname, openCtx, heroAltBlokMenuItems } =
    props;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
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
        <Image
          key={home.heroImageSrc}
          src={home.heroImageSrc}
          alt={home.heroImageAlt}
          fill
          className="object-cover brightness-[0.42] contrast-[1.05]"
          sizes="100vw"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060504] via-[#0a0908]/72 to-[#0a0908]/40"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#0a0908]/92 via-transparent to-transparent md:block"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-end px-5 pb-14 pt-28 md:px-12 md:pb-24 md:pt-36">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.42em] text-amber-200/95">
          Demo vitrin · canlı menü & rezervasyon akışı
        </p>
        <div className="max-w-2xl">
          <EditableText
            active={inline}
            tag="p"
            className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand)]"
            value={home.badge}
            onCommit={(v) => updateHome((h) => ({ ...h, badge: v }))}
          />
          <EditableText
            active={inline}
            tag="h1"
            className="mt-5 font-[family-name:var(--font-restaurant)] text-5xl font-semibold leading-[1.05] tracking-tight text-[#faf7f2] md:text-7xl md:leading-[1.02]"
            value={home.baslik}
            onCommit={(v) => updateHome((h) => ({ ...h, baslik: v }))}
          />
          <div className="mt-5 max-w-xl text-lg leading-relaxed text-[#c9bfb4]">
            <EditableText
              active={inline}
              tag="span"
              className="font-medium text-[#ebe4dc]"
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
              className="text-[#c9bfb4]"
              multiline
              value={home.aciklama}
              onCommit={(v) => updateHome((h) => ({ ...h, aciklama: v }))}
            />
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
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
                      const u = window.prompt("Link (ör. /qr-menu)", home.ctaPrimaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaPrimaryHref: u.trim() || h.ctaPrimaryHref }));
                    },
                  },
                ])
              }
              className="rounded-full bg-[var(--brand)] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[var(--on-brand)] shadow-lg shadow-black/40 ring-1 ring-white/10"
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
                      const u = window.prompt("Link (ör. /randevu)", home.ctaSecondaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaSecondaryHref: u.trim() || h.ctaSecondaryHref }));
                    },
                  },
                ])
              }
              className="rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#faf7f2] backdrop-blur-sm hover:bg-white/10"
            />
          </div>
        </div>

        {(home.heroAltBloklar ?? []).length > 0 || inline ? (
          <div className="mt-12 grid max-w-2xl grid-cols-1 gap-4 border-t border-white/10 pt-10" data-vf-hero-below>
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
                    className="w-full text-sm leading-relaxed text-[#a89f94]"
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
                    <Image
                      key={bl.src}
                      src={bl.src}
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
                className="flex min-h-[3.5rem] items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 px-2 py-3 text-center text-[11px] text-[#a89f94]"
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
                        const src = window.prompt(
                          "Görsel URL (https://…)",
                          "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
                        );
                        if (src == null || !src.trim()) return;
                        const alt = window.prompt("Alt metin", "Görsel") ?? "";
                        updateHome((h) => ({
                          ...h,
                          heroAltBloklar: [
                            ...(h.heroAltBloklar ?? []),
                            {
                              id: newVfId(),
                              tur: "gorsel",
                              src: src.trim(),
                              alt: alt.trim() || "Görsel",
                            },
                          ],
                        }));
                      },
                    },
                  ])
                }
              >
                Hero altı — sağ tık: metin veya görsel
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
