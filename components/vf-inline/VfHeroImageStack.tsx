"use client";

import Image from "next/image";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { HomeHeroAltBlok, SiteIcerik } from "@/lib/content-store";
import { EditableText } from "@/components/vf-inline/EditableText";
import { newVfId } from "@/components/vf-inline/newVfId";
import type { VfMenuItem } from "@/components/vf-inline/VfContextMenu";
import { vfHizaFlexClass } from "@/components/vf-inline/vf-layout";

type Home = SiteIcerik["home"];

export function VfHeroImageStack(props: {
  home: Home;
  inline: boolean;
  updateHome: (fn: (h: Home) => Home) => void;
  openCtx: (e: ReactMouseEvent, items: VfMenuItem[]) => void;
  heroAltBlokMenuItems: (bl: HomeHeroAltBlok, blokIndex: number) => VfMenuItem[];
  /** Özel kahraman düzeninde ana görsel ayrı yerleştirildiğinde yalnızca alt blokları gösterir */
  variant?: "full" | "altTailOnly";
  aspectRatio?: string;
  frameClassName?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageSizes?: string;
  priority?: boolean;
  tailPlaceholder?: string;
}) {
  const {
    home,
    inline,
    updateHome,
    openCtx,
    heroAltBlokMenuItems,
    variant = "full",
    aspectRatio = "4/3",
    frameClassName = "overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl",
    imageWidth = 900,
    imageHeight = 675,
    imageSizes = "(max-width: 768px) 100vw, 480px",
    priority,
    tailPlaceholder = "Görselin altı — boş alanda sağ tık: metin veya görsel",
  } = props;

  const tailGrid =
    (home.heroAltBloklar ?? []).length > 0 || inline ? (
        <div
          className={variant === "altTailOnly" ? "grid grid-cols-1 gap-4" : "mt-4 grid grid-cols-1 gap-4"}
          data-vf-hero-below
        >
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
                  className="w-full text-sm leading-relaxed text-[var(--muted)]"
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
                <div className="w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <Image
                    key={bl.src}
                    src={bl.src}
                    alt={bl.alt}
                    width={800}
                    height={450}
                    className="h-auto max-h-64 w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              )}
            </div>
          ))}
          {inline ? (
            <div
              data-vf-hero-tail
              className="flex min-h-[3.5rem] items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 px-2 py-3 text-center text-[11px] text-[var(--muted)]"
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
                        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
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
              {tailPlaceholder}
            </div>
          ) : null}
        </div>
      ) : null;

  if (variant === "altTailOnly") {
    return <div className="min-w-0">{tailGrid}</div>;
  }

  return (
    <div
      className="min-w-0"
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
      <div className={frameClassName} style={{ aspectRatio }}>
        <Image
          key={home.heroImageSrc}
          src={home.heroImageSrc}
          alt={home.heroImageAlt}
          width={imageWidth}
          height={imageHeight}
          className="h-auto w-full object-cover"
          sizes={imageSizes}
          priority={priority}
        />
      </div>

      {tailGrid}
    </div>
  );
}
