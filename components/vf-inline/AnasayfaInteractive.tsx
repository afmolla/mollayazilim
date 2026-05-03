"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { HomeFeature, HomeHeroAltBlok, SiteIcerik } from "@/lib/content-store";
import type { SiteAyarlar } from "@/lib/settings-store";
import type { VfHiza } from "@/lib/vf-hiza";
import { withBase } from "@/lib/base-path";
import { EditableText } from "@/components/vf-inline/EditableText";
import { newVfId } from "@/components/vf-inline/newVfId";
import { VfContextMenu, type VfMenuItem } from "@/components/vf-inline/VfContextMenu";
import { vfHizaFlexClass, vfKolonClass } from "@/components/vf-inline/vf-layout";

type Home = SiteIcerik["home"];

function cloneHome(h: Home): Home {
  return {
    ...h,
    features: (h.features ?? []).map((f) => ({ ...f })),
    heroAltBloklar: (h.heroAltBloklar ?? []).map((b) =>
      b.tur === "metin" ? { ...b } : { ...b }
    ),
  };
}

function newFeatureCard(): HomeFeature {
  return { id: newVfId(), baslik: "Yeni kart", aciklama: "Metin ekleyin.", hiza: "orta", kolon: 1 };
}

function CtaBlock(props: {
  inline: boolean;
  className: string;
  href: string;
  label: string;
  onLabel: (v: string) => void;
  onCtxHref: (e: ReactMouseEvent) => void;
}) {
  const { inline, className, href, label, onLabel, onCtxHref } = props;
  if (!inline) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <div className="inline-flex flex-col gap-0.5">
      <span className={`${className} inline-flex`} onContextMenu={onCtxHref}>
        <EditableText active value={label} onCommit={onLabel} className="font-semibold" />
      </span>
      <Link
        href={href}
        className="text-[11px] font-medium text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
        tabIndex={0}
      >
        Linki aç →
      </Link>
    </div>
  );
}

export function AnasayfaInteractive(props: { initialHome: Home; salonAd: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vfEdit = searchParams.get("vf_edit") === "1";
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [home, setHome] = useState<Home>(() => cloneHome(props.initialHome));
  const [salonAdLive, setSalonAdLive] = useState(props.salonAd);
  const [saveMsg, setSaveMsg] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number; items: VfMenuItem[] } | null>(null);

  useEffect(() => {
    queueMicrotask(() => setHome(cloneHome(props.initialHome)));
  }, [props.initialHome]);

  useEffect(() => {
    queueMicrotask(() => setSalonAdLive(props.salonAd));
  }, [props.salonAd]);

  useEffect(() => {
    if (!vfEdit) {
      queueMicrotask(() => setSessionOk(null));
      return;
    }
    let cancelled = false;
    queueMicrotask(() => setSessionOk(null));
    void (async () => {
      try {
        const res = await fetch(withBase("/api/panel/session"), { credentials: "same-origin", cache: "no-store" });
        const j = (await res.json()) as { ok?: boolean };
        if (!cancelled) setSessionOk(!!j.ok);
        if (!j.ok || cancelled) return;
        const [cr, sr] = await Promise.all([
          fetch(withBase("/api/panel/content"), { credentials: "same-origin", cache: "no-store" }),
          fetch(withBase("/api/panel/settings"), { credentials: "same-origin", cache: "no-store" }),
        ]);
        if (cr.ok) {
          const cj = (await cr.json()) as { icerik: SiteIcerik };
          if (!cancelled) setHome(cloneHome(cj.icerik.home));
        }
        if (sr.ok) {
          const sj = (await sr.json()) as { ayarlar: SiteAyarlar };
          if (!cancelled) setSalonAdLive(sj.ayarlar.salonAd);
        }
      } catch {
        if (!cancelled) setSessionOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vfEdit]);

  const inline = vfEdit && sessionOk === true;

  const patchSalonAd = useCallback(
    async (salonAd: string) => {
      setSaveMsg("saving");
      try {
        const res = await fetch(withBase("/api/panel/settings"), {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salonAd } satisfies Partial<SiteAyarlar>),
        });
        if (res.status === 401) {
          router.refresh();
          setSaveMsg("err");
          return;
        }
        if (!res.ok) {
          setSaveMsg("err");
          return;
        }
        const j = (await res.json()) as { ayarlar: SiteAyarlar };
        setSalonAdLive(j.ayarlar.salonAd);
        setSaveMsg("ok");
        router.refresh();
      } catch {
        setSaveMsg("err");
      }
    },
    [router]
  );

  const patchHome = useCallback(async (partial: Partial<Home> | Home) => {
    setSaveMsg("saving");
    try {
      const res = await fetch(withBase("/api/panel/content"), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home: partial }),
      });
      if (res.status === 401) {
        router.refresh();
        setSaveMsg("err");
        return;
      }
      if (!res.ok) {
        setSaveMsg("err");
        return;
      }
      const j = (await res.json()) as { icerik: SiteIcerik };
      setHome(cloneHome(j.icerik.home));
      setSaveMsg("ok");
      router.refresh();
    } catch {
      setSaveMsg("err");
    }
  }, [router]);

  const scheduleSave = useCallback(
    (nextHome: Home) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void patchHome(nextHome);
      }, 700);
    },
    [patchHome]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (saveMsg !== "ok" && saveMsg !== "err") return;
    const t = setTimeout(() => setSaveMsg("idle"), 2200);
    return () => clearTimeout(t);
  }, [saveMsg]);

  useEffect(() => {
    if (!ctx) return;
    const close = () => setCtx(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [ctx]);

  function updateHome(updater: (h: Home) => Home) {
    setHome((prev) => {
      const next = updater(cloneHome(prev));
      scheduleSave(next);
      return next;
    });
  }

  function appendGenelMenu(items: VfMenuItem[]): VfMenuItem[] {
    const insertHeroText = () =>
      updateHome((h) => ({
        ...h,
        heroAltBloklar: [
          ...(h.heroAltBloklar ?? []),
          { id: newVfId(), tur: "metin", metin: "Yeni metin — çift tıklayarak düzenleyin." },
        ],
      }));
    const insertHeroImage = () => {
      const src =
        window.prompt(
          "Görsel URL (https://…)",
          "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80"
        )?.trim();
      if (!src) return;
      const alt = window.prompt("Alt metin", "Görsel") ?? "";
      updateHome((h) => ({
        ...h,
        heroAltBloklar: [
          ...(h.heroAltBloklar ?? []),
          { id: newVfId(), tur: "gorsel", src, alt: alt.trim() || "Görsel" },
        ],
      }));
    };
    return [
      ...items,
      { id: "vf-h-page", header: true, label: "Sayfa" },
      {
        id: "vf-panel",
        label: "Paneli yeni sekmede aç",
        run: () => window.open(withBase("/panel"), "_blank", "noopener,noreferrer"),
      },
      {
        id: "vf-add",
        label: "İçerik ekle ▸",
        children: [
          {
            id: "vf-f-end",
            label: "Özellik kartını sona ekle",
            run: () => updateHome((h) => ({ ...h, features: [...(h.features ?? []), newFeatureCard()] })),
          },
          {
            id: "vf-f-pos",
            label: "Kartı sıraya ekle (numara)…",
            run: () => {
              const raw = window.prompt("Sıra numarası (1 = en üstte)", "1");
              if (raw == null) return;
              const idx = Math.max(0, parseInt(raw, 10) - 1);
              if (!Number.isFinite(idx)) return;
              updateHome((h) => {
                const fe = [...(h.features ?? [])];
                const pos = Math.min(Math.max(0, idx), fe.length);
                fe.splice(pos, 0, newFeatureCard());
                return { ...h, features: fe };
              });
            },
          },
          { id: "vf-hero-txt", label: "Hero altına metin", run: insertHeroText },
          { id: "vf-hero-img", label: "Hero altına görsel", run: insertHeroImage },
        ],
      },
    ];
  }

  function openCtx(e: ReactMouseEvent, items: VfMenuItem[]) {
    if (!inline) return;
    e.preventDefault();
    e.stopPropagation();
    setCtx({ x: e.clientX, y: e.clientY, items: appendGenelMenu(items) });
  }

  function featureMenuItems(cardIndex: number): VfMenuItem[] {
    const n = home.features?.length ?? 0;
    return [
      { id: "vf-h-here", header: true, label: "Bu konum" },
      {
        id: "vf-ins-above",
        label: "Üstüne kart ekle",
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            fe.splice(cardIndex, 0, newFeatureCard());
            return { ...h, features: fe };
          }),
      },
      {
        id: "vf-ins-below",
        label: "Altına kart ekle",
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            fe.splice(cardIndex + 1, 0, newFeatureCard());
            return { ...h, features: fe };
          }),
      },
      { id: "vf-h-hiza", header: true, label: "Kart hizası" },
      {
        id: "vf-hz-sol",
        label: "Sola",
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            if (!fe[cardIndex]) return h;
            fe[cardIndex] = { ...fe[cardIndex], hiza: "sol" satisfies VfHiza };
            return { ...h, features: fe };
          }),
      },
      {
        id: "vf-hz-orta",
        label: "Ortala",
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            if (!fe[cardIndex]) return h;
            fe[cardIndex] = { ...fe[cardIndex], hiza: "orta" satisfies VfHiza };
            return { ...h, features: fe };
          }),
      },
      {
        id: "vf-hz-sag",
        label: "Sağa",
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            if (!fe[cardIndex]) return h;
            fe[cardIndex] = { ...fe[cardIndex], hiza: "sag" satisfies VfHiza };
            return { ...h, features: fe };
          }),
      },
      { id: "vf-h-kol", header: true, label: "Genişlik (masaüstü)" },
      {
        id: "vf-k1",
        label: "1 sütun",
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            if (!fe[cardIndex]) return h;
            fe[cardIndex] = { ...fe[cardIndex], kolon: 1 };
            return { ...h, features: fe };
          }),
      },
      {
        id: "vf-k2",
        label: "2 sütun",
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            if (!fe[cardIndex]) return h;
            fe[cardIndex] = { ...fe[cardIndex], kolon: 2 };
            return { ...h, features: fe };
          }),
      },
      {
        id: "vf-k3",
        label: "3 sütun (satır kaplar)",
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            if (!fe[cardIndex]) return h;
            fe[cardIndex] = { ...fe[cardIndex], kolon: 3 };
            return { ...h, features: fe };
          }),
      },
      { id: "vf-h-move", header: true, label: "Sıra" },
      {
        id: "vf-up",
        label: "Yukarı taşı",
        disabled: cardIndex === 0,
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            if (cardIndex <= 0) return h;
            const a = fe[cardIndex]!;
            const b = fe[cardIndex - 1]!;
            fe[cardIndex - 1] = a;
            fe[cardIndex] = b;
            return { ...h, features: fe };
          }),
      },
      {
        id: "vf-down",
        label: "Aşağı taşı",
        disabled: cardIndex >= n - 1,
        run: () =>
          updateHome((h) => {
            const fe = [...(h.features ?? [])];
            if (cardIndex >= fe.length - 1) return h;
            const a = fe[cardIndex]!;
            const b = fe[cardIndex + 1]!;
            fe[cardIndex + 1] = a;
            fe[cardIndex] = b;
            return { ...h, features: fe };
          }),
      },
      {
        id: "vf-del-card",
        label: "Bu kartı sil",
        run: () => {
          if (n < 2) {
            window.alert("Son kartı silemezsiniz.");
            return;
          }
          updateHome((h) => ({
            ...h,
            features: (h.features ?? []).filter((_, j) => j !== cardIndex),
          }));
        },
      },
    ];
  }

  function heroAltBlokMenuItems(bl: HomeHeroAltBlok, blokIndex: number): VfMenuItem[] {
    const list = (home.heroAltBloklar ?? []).length;
    const setHiza = (hiza: VfHiza) =>
      updateHome((h) => ({
        ...h,
        heroAltBloklar: (h.heroAltBloklar ?? []).map((x, j) => (j === blokIndex ? { ...x, hiza } : x)),
      }));
    const insertMetin = (at: number) =>
      updateHome((h) => {
        const arr = [...(h.heroAltBloklar ?? [])];
        arr.splice(at, 0, { id: newVfId(), tur: "metin", metin: "Yeni metin — çift tıklayarak düzenleyin." });
        return { ...h, heroAltBloklar: arr };
      });
    const insertGorsel = (at: number) => {
      const src =
        window.prompt(
          "Görsel URL (https://…)",
          "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80"
        )?.trim();
      if (!src) return;
      const alt = window.prompt("Alt metin", "Görsel") ?? "";
      updateHome((h) => {
        const arr = [...(h.heroAltBloklar ?? [])];
        arr.splice(at, 0, { id: newVfId(), tur: "gorsel", src, alt: alt.trim() || "Görsel" });
        return { ...h, heroAltBloklar: arr };
      });
    };
    const base: VfMenuItem[] = [
      { id: "vf-hb-here", header: true, label: "Bu blok" },
      { id: "vf-hb-up-t", label: "Üstüne metin ekle", run: () => insertMetin(blokIndex) },
      { id: "vf-hb-up-g", label: "Üstüne görsel ekle", run: () => insertGorsel(blokIndex) },
      { id: "vf-hb-below-t", label: "Altına metin ekle", run: () => insertMetin(blokIndex + 1) },
      { id: "vf-hb-below-g", label: "Altına görsel ekle", run: () => insertGorsel(blokIndex + 1) },
      { id: "vf-hb-hiza-h", header: true, label: "Blok hizası" },
      { id: "vf-hb-sol", label: "Sola", run: () => setHiza("sol") },
      { id: "vf-hb-orta", label: "Ortala", run: () => setHiza("orta") },
      { id: "vf-hb-sag", label: "Sağa", run: () => setHiza("sag") },
      { id: "vf-hb-move-h", header: true, label: "Sıra" },
      {
        id: "vf-hb-up",
        label: "Yukarı taşı",
        disabled: blokIndex === 0,
        run: () =>
          updateHome((h) => {
            const arr = [...(h.heroAltBloklar ?? [])];
            if (blokIndex <= 0) return h;
            const a = arr[blokIndex]!;
            const b = arr[blokIndex - 1]!;
            arr[blokIndex - 1] = a;
            arr[blokIndex] = b;
            return { ...h, heroAltBloklar: arr };
          }),
      },
      {
        id: "vf-hb-down",
        label: "Aşağı taşı",
        disabled: blokIndex >= list - 1,
        run: () =>
          updateHome((h) => {
            const arr = [...(h.heroAltBloklar ?? [])];
            if (blokIndex >= arr.length - 1) return h;
            const a = arr[blokIndex]!;
            const b = arr[blokIndex + 1]!;
            arr[blokIndex + 1] = a;
            arr[blokIndex] = b;
            return { ...h, heroAltBloklar: arr };
          }),
      },
      {
        id: "vf-hb-del",
        label: "Bu bloğu kaldır",
        run: () =>
          updateHome((h) => ({
            ...h,
            heroAltBloklar: (h.heroAltBloklar ?? []).filter((x) => x.id !== bl.id),
          })),
      },
    ];
    if (bl.tur === "gorsel") {
      return [
        ...base,
        { id: "vf-hb-g-h", header: true, label: "Görsel" },
        {
          id: "vf-hb-src",
          label: "Görsel URL…",
          run: () => {
            const u = window.prompt("Görsel adresi", bl.src);
            if (u == null) return;
            updateHome((h) => ({
              ...h,
              heroAltBloklar: (h.heroAltBloklar ?? []).map((x) =>
                x.id === bl.id && x.tur === "gorsel" ? { ...x, src: u.trim() || x.src } : x
              ),
            }));
          },
        },
        {
          id: "vf-hb-alt",
          label: "Alt metin…",
          run: () => {
            const a = window.prompt("Alt metin", bl.alt);
            if (a == null) return;
            updateHome((h) => ({
              ...h,
              heroAltBloklar: (h.heroAltBloklar ?? []).map((x) =>
                x.id === bl.id && x.tur === "gorsel" ? { ...x, alt: a } : x
              ),
            }));
          },
        },
      ];
    }
    return base;
  }

  const floatSave =
    inline && saveMsg !== "idle" ? (
      <div
        className="pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--text)] shadow-lg"
        role="status"
      >
        {saveMsg === "saving" ? "Kaydediliyor…" : saveMsg === "ok" ? "Kaydedildi" : "Kayıt hatası"}
      </div>
    ) : null;

  return (
    <div
      onContextMenu={(e) => {
        if (!inline) return;
        openCtx(e, [{ id: "vf-root-h", header: true, label: "Anasayfa vitrin" }]);
      }}
    >
      {floatSave}

      <VfContextMenu
        open={!!ctx}
        x={ctx?.x ?? 0}
        y={ctx?.y ?? 0}
        items={ctx?.items ?? []}
        onClose={() => setCtx(null)}
      />

      <section
        className="border-b border-[var(--border)] bg-[var(--surface)]"
        data-vf-zone="hero"
        onContextMenu={(e) =>
          openCtx(e, [
            {
              id: "hero-url",
              label: "Hero görseli (URL)…",
              run: () => {
                const u = window.prompt("Görsel adresi (https://…)", home.heroImageSrc);
                if (u == null) return;
                updateHome((h) => ({ ...h, heroImageSrc: u.trim() || h.heroImageSrc }));
              },
            },
            {
              id: "hero-alt",
              label: "Görsel alt metni…",
              run: () => {
                const a = window.prompt("Alt metin", home.heroImageAlt);
                if (a == null) return;
                updateHome((h) => ({ ...h, heroImageAlt: a }));
              },
            },
            {
              id: "add-card",
              label: "Özellik kartını sona ekle",
              run: () => updateHome((h) => ({ ...h, features: [...(h.features ?? []), newFeatureCard()] })),
            },
          ])
        }
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24">
          <div className="min-w-0">
            <EditableText
              active={inline}
              tag="p"
              className="text-sm font-semibold uppercase tracking-wider text-[var(--brand)]"
              value={home.badge}
              onCommit={(v) => updateHome((h) => ({ ...h, badge: v }))}
            />
            <EditableText
              active={inline}
              tag="h1"
              className="mt-3 text-4xl font-bold tracking-tight text-[var(--text)] md:text-5xl"
              value={home.baslik}
              onCommit={(v) => updateHome((h) => ({ ...h, baslik: v }))}
            />
            <div className="mt-4 max-w-lg text-lg text-[var(--muted)]">
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
                className="text-lg text-[var(--muted)]"
                multiline
                value={home.aciklama}
                onCommit={(v) => updateHome((h) => ({ ...h, aciklama: v }))}
              />
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <CtaBlock
                inline={inline}
                href={home.ctaPrimaryHref}
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
                className="rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--on-brand)] shadow-lg shadow-[var(--brand)]/25"
              />
              <CtaBlock
                inline={inline}
                href={home.ctaSecondaryHref}
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
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-semibold text-[var(--text)]"
              />
            </div>
          </div>
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
            <div
              className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl"
              style={{ aspectRatio: "4/3" }}
            >
              <Image
                key={home.heroImageSrc}
                src={home.heroImageSrc}
                alt={home.heroImageAlt}
                width={900}
                height={675}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
                priority
              />
            </div>

            {(home.heroAltBloklar ?? []).length > 0 || inline ? (
              <div className="mt-4 grid grid-cols-1 gap-4" data-vf-hero-below>
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
                              x.id === bl.id && x.tur === "metin" ? { ...x, metin: v } : x
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
                              "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80"
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
                    Görselin altı — boş alanda sağ tık: metin veya görsel
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-16 md:px-6"
        data-vf-zone="below"
        onContextMenu={(e) =>
          openCtx(e, [
            {
              id: "add-feat",
              label: "Yeni özellik kartı ekle (sona)",
              run: () => updateHome((h) => ({ ...h, features: [...(h.features ?? []), newFeatureCard()] })),
            },
          ])
        }
      >
        <EditableText
          active={inline}
          tag="h2"
          className="block text-center text-2xl font-bold text-[var(--text)]"
          value={home.bolumBaslik}
          onCommit={(v) => updateHome((h) => ({ ...h, bolumBaslik: v }))}
        />
        <EditableText
          active={inline}
          tag="p"
          className="mx-auto mt-2 block max-w-2xl text-center text-[var(--muted)]"
          multiline
          value={home.bolumAciklama}
          onCommit={(v) => updateHome((h) => ({ ...h, bolumAciklama: v }))}
        />
        <div
          className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch"
          onContextMenu={(e) => {
            if (!inline) return;
            const t = e.target as HTMLElement;
            if (t.closest("[data-vf-card]")) return;
            openCtx(e, [
              {
                id: "grid-add",
                label: "Boş alana yeni kart ekle (sona)",
                run: () => updateHome((h) => ({ ...h, features: [...(h.features ?? []), newFeatureCard()] })),
              },
            ]);
          }}
        >
          {(home.features ?? []).map((x, i) => (
            <div
              key={x.id ?? `feat-${i}`}
              data-vf-card
              className={[
                "flex h-full min-h-[10.5rem] w-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm",
                vfHizaFlexClass(x.hiza),
                vfKolonClass(x.kolon),
              ].join(" ")}
              onContextMenu={(e) => openCtx(e, featureMenuItems(i))}
            >
              <EditableText
                active={inline}
                tag="h3"
                className="w-full font-semibold text-[var(--text)]"
                value={x.baslik}
                onCommit={(v) =>
                  updateHome((h) => {
                    const next = [...(h.features ?? [])];
                    next[i] = { ...next[i], baslik: v };
                    return { ...h, features: next };
                  })
                }
              />
              <EditableText
                active={inline}
                tag="p"
                className="mt-2 w-full text-sm text-[var(--muted)]"
                multiline
                value={x.aciklama}
                onCommit={(v) =>
                  updateHome((h) => {
                    const next = [...(h.features ?? [])];
                    next[i] = { ...next[i], aciklama: v };
                    return { ...h, features: next };
                  })
                }
              />
            </div>
          ))}
          {inline ? (
            <div
              className="col-span-full flex min-h-[3.5rem] items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/30 px-3 py-4 text-center text-[11px] text-[var(--muted)]"
              onContextMenu={(e) =>
                openCtx(e, [
                  {
                    id: "below-grid",
                    label: "Buraya yeni özellik kartı ekle (sona)",
                    run: () => updateHome((h) => ({ ...h, features: [...(h.features ?? []), newFeatureCard()] })),
                  },
                ])
              }
            >
              Kartların altındaki boş alanda sağ tık — yeni kart
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
