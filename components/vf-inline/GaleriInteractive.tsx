"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { SiteIcerik } from "@/lib/content-store";
import type { VfHiza } from "@/lib/vf-hiza";
import { EditableText } from "@/components/vf-inline/EditableText";
import { useVfInlineSession } from "@/components/vf-inline/useVfInlineSession";
import { VfContextMenu, type VfMenuItem } from "@/components/vf-inline/VfContextMenu";
import { vfHizaFlexClass, vfKolonClass } from "@/components/vf-inline/vf-layout";

type G = SiteIcerik["galeri"];

function newGalImage(src: string, alt: string): G["images"][number] {
  return { src, alt, hiza: "orta", kolon: 1 };
}

export function GaleriInteractive(props: { initial: G }) {
  const wb = useWithBase();
  const router = useRouter();
  const { inline } = useVfInlineSession();
  const [g, setG] = useState<G>(() => ({
    ...props.initial,
    images: props.initial.images.map((im) => ({ ...im })),
  }));
  const [saveMsg, setSaveMsg] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number; items: VfMenuItem[] } | null>(null);

  useEffect(() => {
    queueMicrotask(() =>
      setG({ ...props.initial, images: props.initial.images.map((im) => ({ ...im })) })
    );
  }, [props.initial]);

  useEffect(() => {
    if (!inline) return;
    let c = false;
    void (async () => {
      const res = await fetch(wb("/api/panel/content"), { credentials: "same-origin", cache: "no-store" });
      if (!res.ok || c) return;
      const j = (await res.json()) as { icerik: SiteIcerik };
      if (!c) setG({ ...j.icerik.galeri, images: j.icerik.galeri.images.map((x) => ({ ...x })) });
    })();
    return () => {
      c = true;
    };
  }, [inline]);

  const patch = useCallback(
    async (partial: Partial<G>) => {
      setSaveMsg("saving");
      try {
        const res = await fetch(wb("/api/panel/content"), {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ galeri: partial }),
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
        setG({ ...j.icerik.galeri, images: j.icerik.galeri.images.map((x) => ({ ...x })) });
        setSaveMsg("ok");
        router.refresh();
      } catch {
        setSaveMsg("err");
      }
    },
    [router]
  );

  const schedule = useCallback(
    (next: G) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void patch(next), 700);
    },
    [patch]
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
    return () => window.removeEventListener("click", close);
  }, [ctx]);

  function update(updater: (x: G) => G) {
    setG((prev) => {
      const next = updater({ ...prev, images: prev.images.map((x) => ({ ...x })) });
      schedule(next);
      return next;
    });
  }

  function appendGenelGal(items: VfMenuItem[]): VfMenuItem[] {
    const promptAdd = () => {
      const src = window.prompt("Görsel URL", "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80");
      if (src == null || !src.trim()) return;
      const alt = window.prompt("Alt metin", "Görsel") ?? "";
      update((cur) => ({
        ...cur,
        images: [...cur.images, newGalImage(src.trim(), alt.trim() || "Görsel")],
      }));
    };
    return [
      ...items,
      { id: "gal-h-page", header: true, label: "Sayfa" },
      {
        id: "gal-panel",
        label: "Paneli yeni sekmede aç",
        run: () => window.open(wb("/panel"), "_blank", "noopener,noreferrer"),
      },
      {
        id: "gal-add",
        label: "Galeri ▸",
        children: [
          { id: "gal-end", label: "Görseli sona ekle", run: promptAdd },
          {
            id: "gal-pos",
            label: "Sıraya görsel ekle (numara)…",
            run: () => {
              const raw = window.prompt("Sıra numarası (1 = en başta)", "1");
              if (raw == null) return;
              const idx = Math.max(0, parseInt(raw, 10) - 1);
              if (!Number.isFinite(idx)) return;
              const src = window.prompt("Görsel URL", "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80");
              if (src == null || !src.trim()) return;
              const alt = window.prompt("Alt metin", "Görsel") ?? "";
              update((cur) => {
                const images = [...cur.images];
                const pos = Math.min(Math.max(0, idx), images.length);
                images.splice(pos, 0, newGalImage(src.trim(), alt.trim() || "Görsel"));
                return { ...cur, images };
              });
            },
          },
        ],
      },
    ];
  }

  function openCtx(e: ReactMouseEvent, items: VfMenuItem[]) {
    if (!inline) return;
    e.preventDefault();
    e.stopPropagation();
    setCtx({ x: e.clientX, y: e.clientY, items: appendGenelGal(items) });
  }

  function imageMenuItems(i: number): VfMenuItem[] {
    const n = g.images.length;
    const im = g.images[i]!;
    return [
      { id: "gal-h-here", header: true, label: "Bu görsel" },
      {
        id: "gal-above",
        label: "Üstüne görsel ekle",
        run: () => {
          const src = window.prompt("Görsel URL", "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80");
          if (src == null || !src.trim()) return;
          const alt = window.prompt("Alt metin", "Görsel") ?? "";
          update((cur) => {
            const images = [...cur.images];
            images.splice(i, 0, newGalImage(src.trim(), alt.trim() || "Görsel"));
            return { ...cur, images };
          });
        },
      },
      {
        id: "gal-below",
        label: "Altına görsel ekle",
        run: () => {
          const src = window.prompt("Görsel URL", "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80");
          if (src == null || !src.trim()) return;
          const alt = window.prompt("Alt metin", "Görsel") ?? "";
          update((cur) => {
            const images = [...cur.images];
            images.splice(i + 1, 0, newGalImage(src.trim(), alt.trim() || "Görsel"));
            return { ...cur, images };
          });
        },
      },
      { id: "gal-h-hiza", header: true, label: "Hiza" },
      {
        id: "gal-hz-sol",
        label: "Sola",
        run: () =>
          update((cur) => {
            const images = [...cur.images];
            images[i] = { ...images[i]!, hiza: "sol" satisfies VfHiza };
            return { ...cur, images };
          }),
      },
      {
        id: "gal-hz-orta",
        label: "Ortala",
        run: () =>
          update((cur) => {
            const images = [...cur.images];
            images[i] = { ...images[i]!, hiza: "orta" satisfies VfHiza };
            return { ...cur, images };
          }),
      },
      {
        id: "gal-hz-sag",
        label: "Sağa",
        run: () =>
          update((cur) => {
            const images = [...cur.images];
            images[i] = { ...images[i]!, hiza: "sag" satisfies VfHiza };
            return { ...cur, images };
          }),
      },
      { id: "gal-h-kol", header: true, label: "Genişlik" },
      {
        id: "gal-k1",
        label: "1 sütun",
        run: () =>
          update((cur) => {
            const images = [...cur.images];
            images[i] = { ...images[i]!, kolon: 1 };
            return { ...cur, images };
          }),
      },
      {
        id: "gal-k2",
        label: "2 sütun (satır kaplar)",
        run: () =>
          update((cur) => {
            const images = [...cur.images];
            images[i] = { ...images[i]!, kolon: 2 };
            return { ...cur, images };
          }),
      },
      { id: "gal-h-move", header: true, label: "Sıra" },
      {
        id: "gal-up",
        label: "Yukarı taşı",
        disabled: i === 0,
        run: () =>
          update((cur) => {
            const images = [...cur.images];
            if (i <= 0) return cur;
            const a = images[i]!;
            const b = images[i - 1]!;
            images[i - 1] = a;
            images[i] = b;
            return { ...cur, images };
          }),
      },
      {
        id: "gal-down",
        label: "Aşağı taşı",
        disabled: i >= n - 1,
        run: () =>
          update((cur) => {
            const images = [...cur.images];
            if (i >= images.length - 1) return cur;
            const a = images[i]!;
            const b = images[i + 1]!;
            images[i + 1] = a;
            images[i] = b;
            return { ...cur, images };
          }),
      },
      {
        id: "gal-url",
        label: "Görsel URL…",
        run: () => {
          const u = window.prompt("URL", im.src);
          if (u == null) return;
          update((cur) => {
            const images = [...cur.images];
            images[i] = { ...images[i]!, src: u.trim() || im.src };
            return { ...cur, images };
          });
        },
      },
      {
        id: "gal-alt",
        label: "Alt metin…",
        run: () => {
          const a = window.prompt("Alt", im.alt);
          if (a == null) return;
          update((cur) => {
            const images = [...cur.images];
            images[i] = { ...images[i]!, alt: a };
            return { ...cur, images };
          });
        },
      },
      {
        id: "gal-del",
        label: "Görseli kaldır",
        run: () => {
          if (g.images.length < 2) {
            window.alert("Son görseli silemezsiniz.");
            return;
          }
          update((cur) => ({ ...cur, images: cur.images.filter((_, j) => j !== i) }));
        },
      },
    ];
  }

  const float =
    inline && saveMsg !== "idle" ? (
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium shadow-lg">
        {saveMsg === "saving" ? "Kaydediliyor…" : saveMsg === "ok" ? "Kaydedildi" : "Hata"}
      </div>
    ) : null;

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-14 md:px-6"
      onContextMenu={(e) => {
        if (!inline) return;
        openCtx(e, [{ id: "gal-root", header: true, label: "Galeri vitrin" }]);
      }}
    >
      {float}
      <VfContextMenu
        open={!!ctx}
        x={ctx?.x ?? 0}
        y={ctx?.y ?? 0}
        items={ctx?.items ?? []}
        onClose={() => setCtx(null)}
      />

      <h1 className="text-3xl font-bold text-[var(--text)]">Galeri</h1>
      <EditableText
        active={inline}
        tag="p"
        className="mt-2 max-w-2xl text-[var(--muted)]"
        multiline
        value={g.sayfaAciklama}
        onCommit={(v) => update((cur) => ({ ...cur, sayfaAciklama: v }))}
      />

      <div
        className="mt-10 grid gap-4 sm:grid-cols-2 sm:items-stretch"
        onContextMenu={(e) => {
          const t = e.target as HTMLElement;
          if (t.closest("[data-vf-gal-cell]")) return;
          openCtx(e, [
            {
              id: "add",
              label: "Boş alana görsel ekle (sona)",
              run: () => {
                const src = window.prompt("Görsel URL", "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80");
                if (src == null || !src.trim()) return;
                const alt = window.prompt("Alt metin", "Görsel") ?? "";
                update((cur) => ({
                  ...cur,
                  images: [...cur.images, newGalImage(src.trim(), alt.trim() || "Görsel")],
                }));
              },
            },
          ]);
        }}
      >
        {g.images.map((im, i) => (
          <div
            key={`${im.src}-${i}`}
            data-vf-gal-cell
            className={[
              "flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]",
              vfHizaFlexClass(im.hiza),
              vfKolonClass(im.kolon, "sm2"),
            ].join(" ")}
            style={{ aspectRatio: "4/3" }}
            onContextMenu={(e) => openCtx(e, imageMenuItems(i))}
          >
            <Image
              key={im.src}
              src={im.src}
              alt={im.alt}
              width={800}
              height={600}
              className="h-auto w-full object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {inline ? (
              <p className="w-full border-t border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--muted)]">
                <EditableText
                  active={inline}
                  tag="span"
                  className="w-full text-[11px] text-[var(--muted)]"
                  value={im.alt}
                  onCommit={(v) =>
                    update((cur) => {
                      const images = [...cur.images];
                      images[i] = { ...images[i], alt: v };
                      return { ...cur, images };
                    })
                  }
                />
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {inline ? (
        <p className="mt-4 text-center text-[11px] text-[var(--muted)]">Izgara boşluğunda sağ tık — yeni görsel</p>
      ) : null}
    </div>
  );
}
