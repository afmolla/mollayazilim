"use client";

import Image from "next/image";
import { publicHref } from "@/lib/base-path";
import { CtaBlock } from "@/components/vf-inline/CtaBlock";
import { EditableText } from "@/components/vf-inline/EditableText";
import { VfHeroImageStack } from "@/components/vf-inline/VfHeroImageStack";
import type { KuaforHeroProps } from "@/components/kuafor-vitrin/kuafor-hero-types";
import { KuaforHeroGalleryStrip } from "@/components/kuafor-vitrin/KuaforHeroGalleryStrip";

function heroImageCtx(props: Pick<KuaforHeroProps, "home" | "updateHome" | "openCtx">) {
  const { home, updateHome, openCtx } = props;
  return (e: Parameters<KuaforHeroProps["openCtx"]>[0]) =>
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
    ]);
}

/** Kadın kuaförü — açık tonlar, serif başlık, büyük yuvarlatılmış vitrin görseli */
export function KuaforKadinHero(props: KuaforHeroProps) {
  const {
    home,
    inline,
    salonAdLive,
    setSalonAdLive,
    patchSalonAd,
    updateHome,
    pathname,
    openCtx,
    heroAltBlokMenuItems,
  } = props;

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden overflow-y-visible">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -15%, rgba(251, 207, 232, 0.55) 0%, transparent 55%), radial-gradient(ellipse 70% 45% at 100% 40%, rgba(254, 243, 199, 0.35) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <EditableText
            active={inline}
            tag="p"
            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)] shadow-sm backdrop-blur-sm"
            value={home.badge}
            onCommit={(v) => updateHome((h) => ({ ...h, badge: v }))}
          />
          <EditableText
            active={inline}
            tag="h1"
            className="font-[family-name:var(--font-restaurant)] mt-8 text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-[var(--text)]"
            value={home.baslik}
            onCommit={(v) => updateHome((h) => ({ ...h, baslik: v }))}
          />
          <div className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            <EditableText
              active={inline}
              tag="span"
              className="font-medium text-[var(--text)]"
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
              className="text-[var(--muted)]"
              multiline
              value={home.aciklama}
              onCommit={(v) => updateHome((h) => ({ ...h, aciklama: v }))}
            />
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
              className="rounded-full bg-[var(--brand)] px-9 py-3.5 text-sm font-semibold text-[var(--on-brand)] shadow-[0_14px_40px_rgba(190,24,93,0.28)]"
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
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-9 py-3.5 text-sm font-semibold text-[var(--text)] shadow-sm"
            />
          </div>
        </div>

        <div
          className="relative mx-auto mt-14 max-w-5xl"
          data-vf-zone="hero-image"
          onContextMenu={heroImageCtx({ home, updateHome, openCtx })}
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2.25rem] shadow-[0_28px_80px_rgba(120,53,15,0.18)] ring-1 ring-[var(--border)]">
            <Image
              key={home.heroImageSrc}
              src={home.heroImageSrc}
              alt={home.heroImageAlt}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 1024px"
              priority
            />
          </div>
        </div>

        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-10 w-screen max-w-[100vw]">
          <KuaforHeroGalleryStrip variant="kadin" />
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <VfHeroImageStack
            variant="altTailOnly"
            home={home}
            inline={inline}
            updateHome={updateHome}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
            tailPlaceholder="Metin veya ek görsel — düzenleme modunda bu alana sağ tıklayın"
          />
        </div>
      </div>
    </div>
  );
}
