"use client";

import Image from "next/image";
import { publicHref } from "@/lib/base-path";
import { CtaBlock } from "@/components/vf-inline/CtaBlock";
import { EditableText } from "@/components/vf-inline/EditableText";
import { newVfId } from "@/components/vf-inline/newVfId";
import { vfHizaFlexClass } from "@/components/vf-inline/vf-layout";
import type { KuaforHeroProps } from "@/components/kuafor-vitrin/kuafor-hero-types";

/** Avukatlık — tam ekran güven hissi, kurumsal koyu tema */
export function AvukatFullscreenHero(props: KuaforHeroProps) {
  const { home, inline, salonAdLive, setSalonAdLive, patchSalonAd, updateHome, pathname, openCtx, heroAltBlokMenuItems } =
    props;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a1628]">
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
          className="object-cover opacity-35"
          sizes="100vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2847]/95 to-[#0a1628]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,168,83,0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-center px-5 pb-20 pt-28 md:px-12 md:pb-28 md:pt-32">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.42em] text-[var(--brand)]">
          Demo hukuk vitrini · vekalet ilişkisi oluşturmaz
        </p>
        <div className="max-w-3xl">
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
            className="mt-5 font-[family-name:var(--font-restaurant)] text-4xl font-semibold leading-[1.12] tracking-tight text-slate-50 md:text-6xl"
            value={home.baslik}
            onCommit={(v) => updateHome((h) => ({ ...h, baslik: v }))}
          />
          <div className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            <EditableText
              active={inline}
              tag="span"
              className="font-medium text-white"
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
                      const u = window.prompt("Link (ör. /randevu)", home.ctaPrimaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaPrimaryHref: u.trim() || h.ctaPrimaryHref }));
                    },
                  },
                ])
              }
              className="rounded-xl bg-[var(--brand)] px-8 py-3.5 text-sm font-semibold text-[var(--on-brand)] shadow-lg shadow-black/30 ring-1 ring-white/10"
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
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur-sm hover:bg-white/10"
            />
          </div>
        </div>

        {(home.heroAltBloklar ?? []).length > 0 || inline ? (
          <div className="mt-14 grid max-w-3xl grid-cols-1 gap-4 border-t border-white/10 pt-10" data-vf-hero-below>
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
                        const src = window.prompt(
                          "Görsel URL (https://…)",
                          "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
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
                Hero altı — sağ tık
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
