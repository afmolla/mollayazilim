"use client";
import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";
import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { SiteIcerik } from "@/lib/content-store";
import { EditableText } from "@/components/vf-inline/EditableText";
import { useVfInlineSession } from "@/components/vf-inline/useVfInlineSession";
import { isAmbalajPath } from "@/lib/site-config";

type Hiz = SiteIcerik["hizmetler"];

type CtxItem = { id: string; label: string; run: () => void };

export function HizmetlerInteractive(props: { initial: Hiz }) {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const isAvukat = pathname.includes("/avukat");
  const isAmbalaj = isAmbalajPath(pathname);
  const { inline } = useVfInlineSession();
  const [h, setH] = useState<Hiz>(() => ({
    ...props.initial,
    rows: props.initial.rows.map((r) => ({ ...r })),
  }));
  const [saveMsg, setSaveMsg] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number; items: CtxItem[] } | null>(null);

  useEffect(() => {
    queueMicrotask(() =>
      setH({ ...props.initial, rows: props.initial.rows.map((r) => ({ ...r })) })
    );
  }, [props.initial]);

  useEffect(() => {
    if (!inline) return;
    let c = false;
    void (async () => {
      const res = await panelFetch(wb("/api/panel/content"), { credentials: "same-origin", cache: "no-store" });
      if (!res.ok || c) return;
      const j = (await res.json()) as { icerik: SiteIcerik };
      if (!c) setH({ ...j.icerik.hizmetler, rows: j.icerik.hizmetler.rows.map((r) => ({ ...r })) });
    })();
    return () => {
      c = true;
    };
  }, [inline, wb]);

  const patch = useCallback(
    async (partial: Partial<Hiz>) => {
      setSaveMsg("saving");
      try {
        const res = await panelFetch(wb("/api/panel/content"), {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hizmetler: partial }),
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
        setH({ ...j.icerik.hizmetler, rows: j.icerik.hizmetler.rows.map((r) => ({ ...r })) });
        setSaveMsg("ok");
        router.refresh();
      } catch {
        setSaveMsg("err");
      }
    },
    [router, wb]
  );

  const schedule = useCallback(
    (next: Hiz) => {
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

  function openCtx(e: ReactMouseEvent, items: CtxItem[]) {
    if (!inline) return;
    e.preventDefault();
    e.stopPropagation();
    setCtx({ x: e.clientX, y: e.clientY, items });
  }

  function update(updater: (x: Hiz) => Hiz) {
    setH((prev) => {
      const next = updater({
        ...prev,
        rows: prev.rows.map((r) => ({ ...r })),
      });
      schedule(next);
      return next;
    });
  }

  const float =
    inline && saveMsg !== "idle" ? (
      <div
        className={[
          "pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border px-4 py-2 text-xs font-medium shadow-lg",
          isAvukat
            ? "border-amber-500/25 bg-[#0c1525]/95 text-amber-100/90 backdrop-blur-md"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]",
        ].join(" ")}
      >
        {saveMsg === "saving" ? "Kaydediliyor…" : saveMsg === "ok" ? "Kaydedildi" : "Hata"}
      </div>
    ) : null;

  const pageBody = (
    <>
      {float}
      {ctx ? (
        <div
          className={[
            "fixed z-[130] min-w-[11rem] rounded-xl border py-1 text-sm shadow-xl",
            isAvukat
              ? "border-amber-500/20 bg-[#0f1f3d]/98 text-slate-100 backdrop-blur-xl"
              : "border-[var(--border)] bg-[var(--surface)]",
          ].join(" ")}
          style={{ left: ctx.x, top: ctx.y }}
          onClick={(e) => e.stopPropagation()}
          role="menu"
        >
          {ctx.items.map((it) => (
            <button
              key={it.id}
              type="button"
              className={[
                "block w-full px-3 py-2 text-left",
                isAvukat ? "hover:bg-white/[0.06]" : "hover:bg-[var(--surface-2)]",
              ].join(" ")}
              onClick={() => {
                it.run();
                setCtx(null);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        onContextMenu={(e) =>
          openCtx(e, [
            {
              id: "add",
              label: "Yeni satır ekle",
              run: () =>
                update((cur) => ({
                  ...cur,
                  rows: [...cur.rows, { ad: "Yeni hizmet", sure: "30 dk", fiyat: "—" }],
                })),
            },
          ])
        }
      >
        <EditableText
          active={inline}
          tag="h1"
          className={[
            "text-3xl font-bold tracking-tight md:text-4xl",
            isAvukat ? "text-slate-50" : "text-[var(--text)]",
          ].join(" ")}
          value={h.sayfaBaslik ?? "Hizmetler"}
          onCommit={(v) => update((cur) => ({ ...cur, sayfaBaslik: v }))}
        />
        <EditableText
          active={inline}
          tag="p"
          className={isAvukat ? "mt-3 text-base text-slate-400 md:text-lg" : "mt-2 text-[var(--muted)]"}
          multiline
          value={h.sayfaAciklama}
          onCommit={(v) => update((cur) => ({ ...cur, sayfaAciklama: v }))}
        />
        <div
          className={[
            "mt-10 overflow-hidden rounded-2xl shadow-sm",
            isAvukat
              ? "rounded-3xl border border-amber-500/20 bg-slate-950/45 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              : isAmbalaj
                ? "border border-emerald-500/15 bg-emerald-950/20"
                : "border border-[var(--border)] bg-[var(--surface)]",
          ].join(" ")}
        >
          <table className="w-full text-left text-sm">
            <thead
              className={
                isAvukat
                  ? "border-b border-amber-500/15 bg-white/[0.05] text-[11px] font-semibold uppercase tracking-wider text-amber-200/75"
                  : isAmbalaj
                    ? "border-b border-emerald-500/15 bg-emerald-950/40 text-[11px] font-semibold uppercase tracking-wider text-emerald-200/75"
                    : "bg-[var(--surface-2)] text-[var(--muted)]"
              }
            >
              <tr>
                <th className="px-4 py-3 font-medium">{h.kolonAd ?? "Hizmet"}</th>
                <th className="px-4 py-3 font-medium">{h.kolonSure ?? "Süre"}</th>
                <th className="px-4 py-3 font-medium">{h.kolonFiyat ?? "Başlangıç"}</th>
              </tr>
            </thead>
            <tbody className={isAvukat ? "divide-y divide-white/[0.06]" : isAmbalaj ? "divide-y divide-emerald-500/10" : "divide-y divide-[var(--border)]"}>
              {h.rows.map((r, i) => {
                if (r.anchorId) {
                  return (
                    <tr key={`sec-${r.anchorId}`} id={r.anchorId} className="scroll-mt-28">
                      <td
                        colSpan={3}
                        className={
                          isAmbalaj
                            ? "border-t border-emerald-500/20 bg-emerald-950/30 px-4 py-5 first:border-t-0"
                            : "border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 first:border-t-0"
                        }
                      >
                        <h2
                          className={
                            isAmbalaj
                              ? "text-lg font-bold text-emerald-50 md:text-xl"
                              : "text-base font-bold text-[var(--text)]"
                          }
                        >
                          <EditableText
                            active={inline}
                            value={r.ad}
                            onCommit={(v) =>
                              update((cur) => {
                                const rows = [...cur.rows];
                                rows[i] = { ...rows[i], ad: v };
                                return { ...cur, rows };
                              })
                            }
                          />
                        </h2>
                        {r.sure ? (
                          <p className={isAmbalaj ? "mt-1 text-xs text-emerald-100/55" : "mt-1 text-xs text-[var(--muted)]"}>
                            {r.sure}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  );
                }
                return (
                <tr
                  key={i}
                  onContextMenu={(e) =>
                    openCtx(e, [
                      {
                        id: "del",
                        label: "Bu satırı sil",
                        run: () => {
                          if (h.rows.length < 2) {
                            window.alert("Son satırı silemezsiniz.");
                            return;
                          }
                          update((cur) => ({ ...cur, rows: cur.rows.filter((_, j) => j !== i) }));
                        },
                      },
                    ])
                  }
                >
                  <td
                    className={
                      isAvukat
                        ? "px-4 py-4 font-medium text-slate-50"
                        : isAmbalaj
                          ? "px-4 py-4 font-medium text-emerald-50"
                          : "px-4 py-4 font-medium text-[var(--text)]"
                    }
                  >
                    <EditableText
                      active={inline}
                      value={r.ad}
                      onCommit={(v) =>
                        update((cur) => {
                          const rows = [...cur.rows];
                          rows[i] = { ...rows[i], ad: v };
                          return { ...cur, rows };
                        })
                      }
                    />
                  </td>
                  <td
                    className={
                      isAvukat
                        ? "px-4 py-4 text-slate-400"
                        : isAmbalaj
                          ? "px-4 py-4 text-emerald-100/60"
                          : "px-4 py-4 text-[var(--muted)]"
                    }
                  >
                    <EditableText
                      active={inline}
                      value={r.sure}
                      onCommit={(v) =>
                        update((cur) => {
                          const rows = [...cur.rows];
                          rows[i] = { ...rows[i], sure: v };
                          return { ...cur, rows };
                        })
                      }
                    />
                  </td>
                  <td
                    className={
                      isAvukat
                        ? "px-4 py-4 text-amber-100/95"
                        : isAmbalaj
                          ? "px-4 py-4 text-emerald-200"
                          : "px-4 py-4 text-[var(--text)]"
                    }
                  >
                    <EditableText
                      active={inline}
                      value={r.fiyat}
                      onCommit={(v) =>
                        update((cur) => {
                          const rows = [...cur.rows];
                          rows[i] = { ...rows[i], fiyat: v };
                          return { ...cur, rows };
                        })
                      }
                    />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {inline ? (
          <p className={isAvukat ? "mt-4 text-center text-[11px] text-slate-500" : "mt-4 text-center text-[11px] text-[var(--muted)]"}>
            Sayfa veya tabloda boş alanda sağ tık — yeni satır
          </p>
        ) : null}
      </div>
    </>
  );

  if (isAvukat) {
    return (
      <div className="relative min-h-[calc(100dvh-6rem)] w-full overflow-hidden pb-16 pt-4 md:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=85"
            alt=""
            fill
            className="object-cover object-[center_35%] brightness-[0.42]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1428]/97 via-[#0c1525]/92 to-[#050a14]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,168,83,0.12),_transparent_55%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 md:px-8">{pageBody}</div>
      </div>
    );
  }

  return <div className={isAmbalaj ? "mx-auto max-w-4xl px-4 py-14 md:px-6 text-emerald-50" : "mx-auto max-w-4xl px-4 py-14 md:px-6"}>{pageBody}</div>;
}
