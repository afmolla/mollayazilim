"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { SiteIcerik } from "@/lib/content-store";
import { EditableText } from "@/components/vf-inline/EditableText";
import { useVfInlineSession } from "@/components/vf-inline/useVfInlineSession";

type Hiz = SiteIcerik["hizmetler"];

type CtxItem = { id: string; label: string; run: () => void };

export function HizmetlerInteractive(props: { initial: Hiz }) {
  const wb = useWithBase();
  const router = useRouter();
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
      const res = await fetch(wb("/api/panel/content"), { credentials: "same-origin", cache: "no-store" });
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
        const res = await fetch(wb("/api/panel/content"), {
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
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium shadow-lg">
        {saveMsg === "saving" ? "Kaydediliyor…" : saveMsg === "ok" ? "Kaydedildi" : "Hata"}
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6">
      {float}
      {ctx ? (
        <div
          className="fixed z-[130] min-w-[11rem] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 text-sm shadow-xl"
          style={{ left: ctx.x, top: ctx.y }}
          onClick={(e) => e.stopPropagation()}
          role="menu"
        >
          {ctx.items.map((it) => (
            <button
              key={it.id}
              type="button"
              className="block w-full px-3 py-2 text-left hover:bg-[var(--surface-2)]"
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
        <h1 className="text-3xl font-bold text-[var(--text)]">Hizmetler</h1>
        <EditableText
          active={inline}
          tag="p"
          className="mt-2 text-[var(--muted)]"
          multiline
          value={h.sayfaAciklama}
          onCommit={(v) => update((cur) => ({ ...cur, sayfaAciklama: v }))}
        />
        <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Hizmet</th>
                <th className="px-4 py-3 font-medium">Süre</th>
                <th className="px-4 py-3 font-medium">Başlangıç</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {h.rows.map((r, i) => (
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
                  <td className="px-4 py-4 font-medium text-[var(--text)]">
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
                  <td className="px-4 py-4 text-[var(--muted)]">
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
                  <td className="px-4 py-4 text-[var(--text)]">
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
              ))}
            </tbody>
          </table>
        </div>
        {inline ? (
          <p className="mt-4 text-center text-[11px] text-[var(--muted)]">
            Sayfa veya tabloda boş alanda sağ tık — yeni satır
          </p>
        ) : null}
      </div>
    </div>
  );
}
