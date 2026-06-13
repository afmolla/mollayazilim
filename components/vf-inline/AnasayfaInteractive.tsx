"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { HomeFeature, HomeHeroAltBlok, SiteIcerik } from "@/lib/content-store";
import type { SiteAyarlar } from "@/lib/settings-store";
import type { VfHiza } from "@/lib/vf-hiza";
import { publicHref } from "@/lib/base-path";
import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";
import { EditableText } from "@/components/vf-inline/EditableText";
import { newVfId } from "@/components/vf-inline/newVfId";
import { VfContextMenu, type VfMenuItem } from "@/components/vf-inline/VfContextMenu";
import { vfHizaFlexClass, vfKolonClass } from "@/components/vf-inline/vf-layout";
import { VfHeroImageStack } from "@/components/vf-inline/VfHeroImageStack";
import { RestaurantFullscreenHero } from "@/components/vitrin/RestaurantFullscreenHero";
import { EmlakFullscreenHero } from "@/components/vitrin/EmlakFullscreenHero";
import { AvukatFullscreenHero } from "@/components/vitrin/AvukatFullscreenHero";
import { OtoyikamaFullscreenHero } from "@/components/vitrin/OtoyikamaFullscreenHero";
import { EsnekAmbalajFullscreenHero } from "@/components/vitrin/EsnekAmbalajFullscreenHero";
import { OtoyikamaVisualBands } from "@/components/vitrin/OtoyikamaVisualBands";
import { CtaBlock } from "@/components/vf-inline/CtaBlock";
import { VitrinImage } from "@/components/vitrin/VitrinImage";
import { normalizeOtoImageSrc, OTOYIKAMA_IMAGES } from "@/lib/otoyikama-images";
import { KuaforErkekHero } from "@/components/kuafor-vitrin/KuaforErkekHero";
import { KuaforKadinHero } from "@/components/kuafor-vitrin/KuaforKadinHero";

type Home = SiteIcerik["home"];

export type EmlakPreviewIlan = {
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

export function AnasayfaInteractive(props: {
  initialHome: Home;
  salonAd: string;
  emlakPreview?: EmlakPreviewIlan[];
}) {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const pathname = usePathname() ?? "/";
  const isRestaurant = pathname.includes("/restaurant");
  const isEmlak = pathname.includes("/emlak");
  const isKuaforKadin = pathname.includes("/kuafor-kadin");
  const isKuaforErkek = pathname.includes("/kuafor") && !isKuaforKadin;
  const isAvukat = pathname.includes("/avukat");
  const isOtoyikama = pathname.includes("/otoyikama");
  const isEsnekAmbalaj = pathname.includes("/esnek-ambalaj");
  const searchParams = useSearchParams();
  const router = useRouter();
  const vfEdit = searchParams.get("vf_edit") === "1";
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [home, setHome] = useState<Home>(() => cloneHome(props.initialHome));
  const [salonAdLive, setSalonAdLive] = useState(props.salonAd);
  const [saveMsg, setSaveMsg] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [saveErrText, setSaveErrText] = useState("");
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
        const res = await panelFetch(wb("/api/panel/session"), { credentials: "same-origin", cache: "no-store" });
        const j = (await res.json()) as { ok?: boolean };
        if (!cancelled) setSessionOk(!!j.ok);
        if (!j.ok || cancelled) return;
        const [cr, sr] = await Promise.all([
          panelFetch(wb("/api/panel/content"), { credentials: "same-origin", cache: "no-store" }),
          panelFetch(wb("/api/panel/settings"), { credentials: "same-origin", cache: "no-store" }),
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
  }, [vfEdit, wb]);

  const inline = vfEdit && sessionOk === true;

  const patchSalonAd = useCallback(
    async (salonAd: string) => {
      setSaveMsg("saving");
      setSaveErrText("");
      try {
        const res = await panelFetch(wb("/api/panel/settings"), {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salonAd } satisfies Partial<SiteAyarlar>),
        });
        if (res.status === 401) {
          router.refresh();
          setSaveMsg("err");
          setSaveErrText("Oturum yok veya süresi doldu; panele giriş yapın.");
          return;
        }
        if (!res.ok) {
          setSaveMsg("err");
          try {
            const j = (await res.json()) as { error?: string };
            setSaveErrText(j.error ?? `Sunucu ${res.status}`);
          } catch {
            setSaveErrText(`Sunucu ${res.status}`);
          }
          return;
        }
        const j = (await res.json()) as { ayarlar: SiteAyarlar };
        setSalonAdLive(j.ayarlar.salonAd);
        setSaveMsg("ok");
        router.refresh();
      } catch {
        setSaveMsg("err");
        setSaveErrText("Ağ hatası.");
      }
    },
    [router, wb]
  );

  const patchHome = useCallback(async (partial: Partial<Home> | Home) => {
    setSaveMsg("saving");
    setSaveErrText("");
    try {
      const res = await panelFetch(wb("/api/panel/content"), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home: partial }),
      });
      if (res.status === 401) {
        router.refresh();
        setSaveMsg("err");
        setSaveErrText("Oturum yok veya süresi doldu; panele giriş yapın.");
        return;
      }
      if (!res.ok) {
        setSaveMsg("err");
        try {
          const j = (await res.json()) as { error?: string };
          setSaveErrText(j.error ?? `Sunucu ${res.status}`);
        } catch {
          setSaveErrText(`Sunucu ${res.status}`);
        }
        return;
      }
      const j = (await res.json()) as { icerik: SiteIcerik };
      setHome(cloneHome(j.icerik.home));
      setSaveMsg("ok");
      router.refresh();
    } catch {
      setSaveMsg("err");
      setSaveErrText("Ağ hatası.");
    }
  }, [router, wb]);

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
        run: () => window.open(wb("/panel"), "_blank", "noopener,noreferrer"),
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
        className="pointer-events-none fixed bottom-6 left-1/2 z-[120] max-w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-center text-xs font-medium text-[var(--text)] shadow-lg"
        role="status"
        title={saveErrText || undefined}
      >
        {saveMsg === "saving" ? (
          "Kaydediliyor…"
        ) : saveMsg === "ok" ? (
          "Kaydedildi"
        ) : (
          <span>
            Kayıt hatası
            {saveErrText ? (
              <span className="mt-1 block text-[11px] font-normal leading-snug text-[var(--muted)]">
                {saveErrText}
              </span>
            ) : null}
          </span>
        )}
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
        className={
          isRestaurant
            ? "relative min-h-[100dvh] overflow-hidden border-0 bg-[var(--surface)]"
            : isEmlak
              ? "relative min-h-[100dvh] overflow-hidden border-0 bg-[var(--surface)]"
              : isAvukat
                ? "relative min-h-[100dvh] overflow-hidden border-0 bg-[#0a1628]"
                : isOtoyikama
                  ? "relative min-h-[100dvh] overflow-hidden border-0 bg-[#040608]"
                  : isKuaforKadin || isKuaforErkek
                  ? "relative min-h-[100dvh] overflow-hidden border-0 bg-[var(--surface)]"
                  : "border-b border-[var(--border)] bg-[var(--surface)]"
        }
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
        {isRestaurant ? (
          <RestaurantFullscreenHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
          />
        ) : isEmlak ? (
          <EmlakFullscreenHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
            emlakPreview={props.emlakPreview}
          />
        ) : isKuaforKadin ? (
          <KuaforKadinHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
          />
        ) : isKuaforErkek ? (
          <KuaforErkekHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
          />
        ) : isAvukat ? (
          <AvukatFullscreenHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
          />
        ) : isOtoyikama ? (
          <OtoyikamaFullscreenHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
          />
        ) : isEsnekAmbalaj ? (
          <EsnekAmbalajFullscreenHero
            home={home}
            inline={inline}
            salonAdLive={salonAdLive}
            setSalonAdLive={setSalonAdLive}
            patchSalonAd={patchSalonAd}
            updateHome={updateHome}
            pathname={pathname}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
          />
        ) : (
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
                className="rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--on-brand)] shadow-lg shadow-[var(--brand)]/25"
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
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-semibold text-[var(--text)]"
              />
            </div>
          </div>
          <VfHeroImageStack
            home={home}
            inline={inline}
            updateHome={updateHome}
            openCtx={openCtx}
            heroAltBlokMenuItems={heroAltBlokMenuItems}
            priority
          />
        </div>
        )}
      </section>

      {isOtoyikama ? <OtoyikamaVisualBands pathname={pathname} /> : null}

      <section
        className={
          isRestaurant
            ? "relative mx-auto max-w-6xl border-t border-white/[0.06] bg-[var(--surface-2)] px-4 py-20 md:px-6"
            : isEmlak
              ? "relative mx-auto max-w-6xl border-t border-emerald-900/25 bg-[var(--surface-2)] px-4 py-20 md:px-6"
              : isAvukat
                ? "relative mx-auto max-w-6xl border-t border-white/[0.06] bg-[#0c1829] px-4 py-20 md:px-6"
                : isOtoyikama
                  ? "relative mx-auto max-w-6xl border-t border-cyan-500/10 bg-[#060a10] px-4 py-20 md:px-6"
                  : isKuaforErkek
                  ? "relative mx-auto max-w-6xl border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-20 md:px-6"
                  : isKuaforKadin
                    ? "relative mx-auto max-w-6xl border-t border-[var(--border)] bg-[var(--surface)] px-4 py-20 md:px-6"
                    : "mx-auto max-w-6xl px-4 py-16 md:px-6"
        }
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
          className={
            isRestaurant
              ? "block text-center font-[family-name:var(--font-restaurant)] text-3xl font-semibold tracking-tight text-[#faf7f2] md:text-4xl"
              : isEmlak
                ? "block text-center text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl"
                : isAvukat
                  ? "block text-center text-3xl font-semibold tracking-tight text-[#e8eef8] md:text-4xl"
                  : isOtoyikama
                    ? "block text-center text-3xl font-extrabold tracking-tight text-white md:text-4xl"
                    : isKuaforErkek
                    ? "block text-center text-3xl font-extrabold uppercase tracking-tight text-[var(--text)] md:text-4xl"
                    : isKuaforKadin
                      ? "font-[family-name:var(--font-restaurant)] block text-center text-3xl font-semibold tracking-tight text-[var(--text)] md:text-[2.65rem]"
                      : "block text-center text-2xl font-bold text-[var(--text)]"
          }
          value={home.bolumBaslik}
          onCommit={(v) => updateHome((h) => ({ ...h, bolumBaslik: v }))}
        />
        <EditableText
          active={inline}
          tag="p"
          className={
            isRestaurant
              ? "mx-auto mt-3 block max-w-2xl text-center text-base text-[#a89f94]"
              : isEmlak
                ? "mx-auto mt-3 block max-w-2xl text-center text-sm text-[var(--muted)] md:text-base"
                : isAvukat
                  ? "mx-auto mt-3 block max-w-2xl text-center text-sm text-slate-400 md:text-base"
                  : isOtoyikama
                    ? "mx-auto mt-3 block max-w-2xl text-center text-sm text-slate-400 md:text-base"
                    : isKuaforErkek
                    ? "mx-auto mt-3 block max-w-2xl text-center text-sm text-[var(--muted)] md:text-base"
                    : "mx-auto mt-2 block max-w-2xl text-center text-[var(--muted)]"
          }
          multiline
          value={home.bolumAciklama}
          onCommit={(v) => updateHome((h) => ({ ...h, bolumAciklama: v }))}
        />
        <div
          className={
            isRestaurant
              ? "mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-4 md:items-stretch"
              : isEmlak || isAvukat || isOtoyikama
                ? "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch"
                : isKuaforErkek || isKuaforKadin
                  ? "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch"
                  : "mt-10 grid gap-6 md:grid-cols-3 md:items-stretch"
          }
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
                isRestaurant &&
                  "!border-white/[0.08] !bg-white/[0.03] !shadow-none backdrop-blur-md transition hover:border-[var(--brand)]/35",
                isEmlak &&
                  "!rounded-2xl !border-emerald-900/30 !bg-[var(--surface)] !shadow-sm transition hover:border-emerald-600/35",
                isAvukat &&
                  "!rounded-2xl !border-white/[0.08] !bg-white/[0.04] !shadow-none backdrop-blur-md transition hover:border-amber-400/25",
                isOtoyikama &&
                  "!rounded-2xl !border-cyan-500/15 !bg-cyan-950/20 !shadow-none backdrop-blur-md transition hover:border-cyan-400/35",
                isKuaforErkek &&
                  "!rounded-xl !border-zinc-600/55 !bg-zinc-950/45 !shadow-none backdrop-blur-md transition hover:border-[var(--brand)]/40",
                isKuaforKadin &&
                  "!rounded-xl !border-[var(--border)] !bg-[var(--surface-2)]/95 !shadow-none backdrop-blur-md transition hover:border-[var(--brand)]/35",
                vfHizaFlexClass(x.hiza),
                vfKolonClass(x.kolon),
              ]
                .filter(Boolean)
                .join(" ")}
              onContextMenu={(e) => openCtx(e, featureMenuItems(i))}
            >
              {isOtoyikama && x.imageSrc ? (
                <div className="relative mb-4 h-40 w-full shrink-0 overflow-hidden rounded-xl border border-cyan-500/10">
                  <VitrinImage
                    src={normalizeOtoImageSrc(x.imageSrc, OTOYIKAMA_IMAGES.wash)}
                    alt={x.baslik}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 280px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : null}
              <EditableText
                active={inline}
                tag="h3"
                className={
                  isRestaurant
                    ? "w-full font-[family-name:var(--font-restaurant)] text-lg font-semibold text-[#faf7f2]"
                    : isEmlak
                      ? "w-full text-lg font-semibold text-[var(--text)]"
                      : isAvukat
                        ? "w-full text-lg font-semibold text-[#e8eef8]"
                        : isOtoyikama
                          ? "w-full text-lg font-bold text-cyan-50"
                          : isKuaforErkek
                          ? "w-full text-lg font-bold text-[var(--text)]"
                          : isKuaforKadin
                            ? "font-[family-name:var(--font-restaurant)] w-full text-xl font-semibold text-[var(--text)]"
                            : "w-full font-semibold text-[var(--text)]"
                }
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
                className={
                  isRestaurant
                    ? "mt-2 w-full text-sm text-[#a89f94]"
                    : isAvukat
                      ? "mt-2 w-full text-sm text-slate-400"
                      : isOtoyikama
                        ? "mt-2 w-full text-sm text-slate-400"
                        : "mt-2 w-full text-sm text-[var(--muted)]"
                }
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
