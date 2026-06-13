"use client";

import Image from "next/image";
import { publicHref } from "@/lib/base-path";
import { ESNEK_AMBALAJ_IMAGES, normalizeAmbalajImageSrc } from "@/lib/esnek-ambalaj-images";
import { CtaBlock } from "@/components/vf-inline/CtaBlock";
import { EditableText } from "@/components/vf-inline/EditableText";
import type { KuaforHeroProps } from "@/components/kuafor-vitrin/kuafor-hero-types";

const PILLS = ["OPP · CPP", "PET · LDPE", "Torba & rulo", "Baskılı ambalaj"] as const;

/** Esnek ambalaj — endüstriyel yeşil / mavi tema */
export function EsnekAmbalajFullscreenHero(props: KuaforHeroProps) {
  const { home, inline, salonAdLive, setSalonAdLive, patchSalonAd, updateHome, pathname, openCtx } = props;

  const heroSrc = normalizeAmbalajImageSrc(home.heroImageSrc, ESNEK_AMBALAJ_IMAGES.hero);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#061510]">
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
        <Image key={heroSrc} src={heroSrc} alt={home.heroImageAlt} fill className="object-cover opacity-40" sizes="100vw" priority />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#061510]/90 via-[#0a2418]/85 to-[#061510]/95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_85%,rgba(56,189,248,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-24 pt-28 md:grid-cols-2 md:gap-12 md:px-10 md:pb-28 md:pt-32">
        <div className="max-w-xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.42em] text-emerald-400/90">
            Esnek ambalaj tedarik & aracılık
          </p>
          <EditableText
            active={inline}
            tag="p"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70"
            value={home.badge}
            onCommit={(v) => updateHome((h) => ({ ...h, badge: v }))}
          />
          <EditableText
            active={inline}
            tag="h1"
            className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-[3.1rem]"
            value={home.baslik}
            onCommit={(v) => updateHome((h) => ({ ...h, baslik: v }))}
          />
          <div className="mt-5 text-base leading-relaxed text-emerald-50/80 md:text-lg">
            <EditableText
              active={inline}
              tag="span"
              className="font-semibold text-white"
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
              multiline
              value={home.aciklama}
              onCommit={(v) => updateHome((h) => ({ ...h, aciklama: v }))}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {PILLS.map((p) => (
              <span
                key={p}
                className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
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
                      const u = window.prompt("Link", home.ctaPrimaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaPrimaryHref: u.trim() || h.ctaPrimaryHref }));
                    },
                  },
                ])
              }
              className="rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-900/40"
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
                      const u = window.prompt("Link", home.ctaSecondaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaSecondaryHref: u.trim() || h.ctaSecondaryHref }));
                    },
                  },
                ])
              }
              className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10"
            />
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-black/30 shadow-2xl">
            <Image
              src={ESNEK_AMBALAJ_IMAGES.rulo}
              alt="OPP CPP rulo ambalaj"
              width={640}
              height={480}
              className="h-64 w-full object-cover"
            />
            <div className="border-t border-emerald-400/15 p-4">
              <p className="text-sm font-semibold text-white">Online fiyat tahmini</p>
              <p className="mt-1 text-xs text-emerald-100/70">
                Mikron, en-boy, baskı ve adet — anlaşmalı üreticilerden ön teklif aralığı.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
