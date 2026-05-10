"use client";

import Image from "next/image";
import Link from "next/link";
import { publicHref } from "@/lib/base-path";
import { useWithBase } from "@/components/SitePrefixProvider";
import { CtaBlock } from "@/components/vf-inline/CtaBlock";
import { EditableText } from "@/components/vf-inline/EditableText";
import { VfHeroImageStack } from "@/components/vf-inline/VfHeroImageStack";
import { EmlakQuickSearch } from "@/components/emlak/EmlakQuickSearch";
import { fmtIlanPrice } from "@/lib/emlak-format";
import type { KuaforHeroProps } from "@/components/kuafor-vitrin/kuafor-hero-types";

export type EmlakPreviewMini = {
  id: string;
  baslik: string;
  il: string;
  ilce: string;
  tip: "satilik" | "kiralik";
  fiyat: number;
  kapakSrc: string;
  oda: string;
  metrekare: number;
};

export type EmlakFullscreenHeroProps = KuaforHeroProps & {
  emlakPreview?: EmlakPreviewMini[];
};

/** Emlak — tam ekran şehir görseli + cam kartta arama (ilan portalı hissi) */
export function EmlakFullscreenHero(props: EmlakFullscreenHeroProps) {
  const wb = useWithBase();
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
    emlakPreview,
  } = props;

  return (
    <>
      <div className="relative min-h-[100dvh] w-full overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          data-vf-zone="hero-image"
          onContextMenu={(e) =>
            openCtx(e, [
              {
                id: "img-url",
                label: "Arka plan görseli URL…",
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
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/65 to-slate-950/90" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(14,165,233,0.15),transparent_60%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-center px-4 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.38em] text-sky-200/90">
            Demo emlak vitrini · gerçek ilan değildir
          </p>
          <div className="mx-auto max-w-3xl text-center">
            <EditableText
              active={inline}
              tag="p"
              className="text-sm font-semibold uppercase tracking-wider text-sky-300"
              value={home.badge}
              onCommit={(v) => updateHome((h) => ({ ...h, badge: v }))}
            />
            <EditableText
              active={inline}
              tag="h1"
              className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
              value={home.baslik}
              onCommit={(v) => updateHome((h) => ({ ...h, baslik: v }))}
            />
            <div className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
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
          </div>

          <div className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-white/20 border-l-4 border-l-[#ffd800] bg-white/10 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-6">
            <EmlakQuickSearch />
          </div>

          <div className="mx-auto mt-10 flex flex-wrap justify-center gap-3">
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
                      const u = window.prompt("Link (ör. /ilanlar)", home.ctaPrimaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaPrimaryHref: u.trim() || h.ctaPrimaryHref }));
                    },
                  },
                ])
              }
              className="rounded-xl bg-sky-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 hover:bg-sky-400"
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
                      const u = window.prompt("Link (ör. /iletisim)", home.ctaSecondaryHref);
                      if (u == null) return;
                      updateHome((h) => ({ ...h, ctaSecondaryHref: u.trim() || h.ctaSecondaryHref }));
                    },
                  },
                ])
              }
              className="rounded-xl border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 md:px-6">
        <VfHeroImageStack
          variant="altTailOnly"
          home={home}
          inline={inline}
          updateHome={updateHome}
          openCtx={openCtx}
          heroAltBlokMenuItems={heroAltBlokMenuItems}
          tailPlaceholder="Özet bilgi satırı eklemek için düzenleme modunda sağ tıklayın"
        />
      </div>

      {(emlakPreview ?? []).length > 0 ? (
        <div className="mx-auto max-w-6xl border-t border-[var(--border)] px-4 pb-16 pt-12 md:px-6">
          <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--text)] md:text-2xl">
            Öne çıkan ilanlar
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            Örnek kayıtlar — gelişmiş liste ve filtre için İlanlar’a gidin.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(emlakPreview ?? []).map((ilan) => (
              <Link
                key={ilan.id}
                href={wb(`/ilan/${ilan.id}`)}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:border-sky-400/40 hover:shadow-[var(--emlak-shadow)]"
              >
                <div className="relative aspect-[4/3] bg-[var(--surface-3)]">
                  <Image
                    src={ilan.kapakSrc}
                    alt={ilan.baslik}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width:640px) 100vw, 25vw"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {ilan.tip === "kiralik" ? "Kiralık" : "Satılık"}
                  </span>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--text)] group-hover:text-sky-700">
                    {ilan.baslik}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {ilan.ilce}, {ilan.il}
                  </p>
                  <p className="mt-2 text-base font-bold text-sky-700">{fmtIlanPrice(ilan)}</p>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    {ilan.oda} · {ilan.metrekare} m²
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={wb("/ilanlar")}
              className="inline-flex rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--emlak-shadow)] hover:bg-sky-500"
            >
              Tüm ilanları görüntüle
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
