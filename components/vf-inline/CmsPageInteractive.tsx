"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Sayfa } from "@/lib/pages-store";
import { withBase } from "@/lib/base-path";
import { CmsSayfaBody } from "@/components/CmsSayfaBody";
import { EditableText } from "@/components/vf-inline/EditableText";
import { useVfInlineSession } from "@/components/vf-inline/useVfInlineSession";

export function CmsPageInteractive(props: { slug: string; initial: Sayfa }) {
  const router = useRouter();
  const { inline } = useVfInlineSession();
  const [s, setS] = useState<Sayfa>(() => ({ ...props.initial }));
  const [saveMsg, setSaveMsg] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    queueMicrotask(() => setS({ ...props.initial }));
  }, [props.initial]);

  useEffect(() => {
    if (!inline) return;
    let c = false;
    void (async () => {
      const res = await fetch(withBase(`/api/panel/pages/${encodeURIComponent(props.slug)}`), {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok || c) return;
      const j = (await res.json()) as { sayfa: Sayfa };
      if (!c) setS({ ...j.sayfa });
    })();
    return () => {
      c = true;
    };
  }, [inline, props.slug]);

  const save = useCallback(
    async (next: Sayfa) => {
      setSaveMsg("saving");
      try {
        const res = await fetch(withBase(`/api/panel/pages/${encodeURIComponent(props.slug)}`), {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baslik: next.baslik,
            aciklama: next.aciklama,
            icerikHtml: next.icerikHtml,
            bloklar: next.bloklar,
            seoIndex: next.seoIndex !== false,
            yayin: next.yayin,
          }),
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
        const j = (await res.json()) as { sayfa: Sayfa };
        setS({ ...j.sayfa });
        setSaveMsg("ok");
        router.refresh();
      } catch {
        setSaveMsg("err");
      }
    },
    [props.slug, router]
  );

  const schedule = useCallback(
    (next: Sayfa) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void save(next), 700);
    },
    [save]
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

  const float =
    inline && saveMsg !== "idle" ? (
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium shadow-lg">
        {saveMsg === "saving" ? "Kaydediliyor…" : saveMsg === "ok" ? "Kaydedildi" : "Hata"}
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      {float}
      <EditableText
        active={inline}
        tag="h1"
        className="text-3xl font-bold text-[var(--text)]"
        value={s.baslik}
        onCommit={(v) => {
          const next = { ...s, baslik: v || s.baslik };
          setS(next);
          schedule(next);
        }}
      />
      {inline || (s.aciklama && s.aciklama.length > 0) ? (
        <EditableText
          active={inline}
          tag="p"
          className="mt-2 text-[var(--muted)]"
          multiline
          value={s.aciklama ?? ""}
          onCommit={(v) => {
            const next = { ...s, aciklama: v || undefined };
            setS(next);
            schedule(next);
          }}
        />
      ) : null}
      <CmsSayfaBody sayfa={s} />
      {inline ? (
        <p className="mt-8 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs text-[var(--muted)]">
          Blokları ve gelişmiş içeriği düzenlemek için panelde{" "}
          <strong className="text-[var(--text)]">İçerik → Ek sayfalar</strong> bölümünü kullanın.
        </p>
      ) : null}
    </div>
  );
}
