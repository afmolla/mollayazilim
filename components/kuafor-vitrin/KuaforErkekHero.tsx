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

/** Erkek kuaförü — karanlık split-screen, büyük görsel + güçlü tipografi */
export function KuaforErkekHero(props: KuaforHeroProps) {
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
    <div className="relative min-h-[100dvh] overflow-hidden">
      <div className="lg:grid lg:min-h-[100dvh] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div
          className="relative min-h-[48vh] lg:min-h-full"
          data-vf-zone="hero-image"
          onContextMenu={heroImageCtx({ home, updateHome, openCtx })}
        >
          <Image
            key={home.heroImageSrc}
            src={home.heroImageSrc}
            alt={home.heroImageAlt}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 58vw"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/20 lg:to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--surface)] to-transparent lg:hidden" />
        </div>

        <div className="relative flex flex-col justify-center px-5 py-14 sm:px-8 lg:px-12 lg:py-20 xl:px-16">
          <div className="absolute inset-0 -z-10 bg-[var(--surface)] lg:bg-[var(--surface)]" />
          <EditableText
            active={inline}
            tag="p"
            className="text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--brand)]"
            value={home.badge}
            onCommit={(v) => updateHome((h) => ({ ...h, badge: v }))}
          />
          <EditableText
            active={inline}
            tag="h1"
            className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[var(--text)] sm:text-5xl xl:text-6xl"
            value={home.baslik}
            onCommit={(v) => updateHome((h) => ({ ...h, baslik: v }))}
          />
          <div className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--muted)]">
            <EditableText
              active={inline}
              tag="span"
              className="font-semibold text-[var(--text)]"
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
                      const u = window.prompt("Link (ör. /randevu)", home.ctaPrimaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaPrimaryHref: u.trim() || h.ctaPrimaryHref }));
                    },
                  },
                ])
              }
              className="rounded-xl bg-[var(--brand)] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[var(--on-brand)] shadow-[0_12px_40px_rgba(234,88,12,0.35)]"
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
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-7 py-3.5 text-sm font-semibold text-[var(--text)]"
            />
          </div>
        </div>
      </div>

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw]">
        <KuaforHeroGalleryStrip variant="erkek" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14 pt-4 md:px-6 md:pb-20 md:pt-8">
        <VfHeroImageStack
          variant="altTailOnly"
          home={home}
          inline={inline}
          updateHome={updateHome}
          openCtx={openCtx}
          heroAltBlokMenuItems={heroAltBlokMenuItems}
          tailPlaceholder="Hero altı — metin veya görsel eklemek için düzenleme modunda sağ tıklayın"
        />
      </div>
    </div>
  );
}
