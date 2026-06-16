"use client";
import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteIcerik } from "@/lib/content-store";
import type { SiteAyarlar } from "@/lib/settings-store";
import { whatsappLink } from "@/lib/whatsapp";
import { EditableText } from "@/components/vf-inline/EditableText";
import { useVfInlineSession } from "@/components/vf-inline/useVfInlineSession";

type Ilet = SiteIcerik["iletisim"];

export function IletisimInteractive(props: {
  initial: Ilet;
  ayar: Pick<SiteAyarlar, "whatsapp" | "adresDetay" | "calismaSaatleri">;
}) {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const router = useRouter();
  const { inline } = useVfInlineSession();
  const [ilet, setIlet] = useState<Ilet>(() => ({ ...props.initial }));
  const [ayar, setAyar] = useState(() => ({ ...props.ayar }));
  const [saveMsg, setSaveMsg] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setIlet({ ...props.initial });
      setAyar({ ...props.ayar });
    });
  }, [props.initial, props.ayar]);

  useEffect(() => {
    if (!inline) return;
    let c = false;
    void (async () => {
      const [cr, sr] = await Promise.all([
        panelFetch(wb("/api/panel/content"), { credentials: "same-origin", cache: "no-store" }),
        panelFetch(wb("/api/panel/settings"), { credentials: "same-origin", cache: "no-store" }),
      ]);
      if (!c && cr.ok) {
        const j = (await cr.json()) as { icerik: SiteIcerik };
        setIlet({ ...j.icerik.iletisim });
      }
      if (!c && sr.ok) {
        const j = (await sr.json()) as { ayarlar: SiteAyarlar };
        setAyar({
          whatsapp: j.ayarlar.whatsapp,
          adresDetay: j.ayarlar.adresDetay,
          calismaSaatleri: j.ayarlar.calismaSaatleri,
        });
      }
    })();
    return () => {
      c = true;
    };
  }, [inline, wb]);

  const patchContent = useCallback(
    async (partial: Partial<Ilet>) => {
      setSaveMsg("saving");
      try {
        const res = await panelFetch(wb("/api/panel/content"), {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ iletisim: partial }),
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
        setIlet({ ...j.icerik.iletisim });
        setSaveMsg("ok");
        router.refresh();
      } catch {
        setSaveMsg("err");
      }
    },
    [router, wb]
  );

  const patchSettings = useCallback(
    async (partial: Partial<SiteAyarlar>) => {
      setSaveMsg("saving");
      try {
        const res = await panelFetch(wb("/api/panel/settings"), {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partial),
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
        setAyar({
          whatsapp: j.ayarlar.whatsapp,
          adresDetay: j.ayarlar.adresDetay,
          calismaSaatleri: j.ayarlar.calismaSaatleri,
        });
        setSaveMsg("ok");
        router.refresh();
      } catch {
        setSaveMsg("err");
      }
    },
    [router, wb]
  );

  const scheduleIlet = useCallback(
    (next: Ilet) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void patchContent(next), 700);
    },
    [patchContent]
  );

  const scheduleAyar = useCallback(
    (next: typeof ayar) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void patchSettings(next), 700);
    },
    [patchSettings]
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

  const wa = whatsappLink(ayar.whatsapp, ilet.whatsappMesaj);

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
        value={ilet.sayfaBaslik ?? "İletişim"}
        onCommit={(v) => setIlet((s) => ({ ...s, sayfaBaslik: v }))}
      />
      <EditableText
        active={inline}
        tag="p"
        className="mt-2 text-[var(--muted)]"
        multiline
        value={ilet.sayfaAciklama}
        onCommit={(v) => {
          const next = { ...ilet, sayfaAciklama: v };
          setIlet(next);
          scheduleIlet(next);
        }}
      />
      <div className="mt-10 space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Adres</h2>
          <EditableText
            active={inline}
            tag="p"
            className="mt-1 text-[var(--text)]"
            multiline
            value={ayar.adresDetay}
            onCommit={(v) => {
              const next = { ...ayar, adresDetay: v };
              setAyar(next);
              scheduleAyar(next);
            }}
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Çalışma saatleri</h2>
          <EditableText
            active={inline}
            tag="p"
            className="mt-1 text-[var(--text)]"
            value={ayar.calismaSaatleri}
            onCommit={(v) => {
              const next = { ...ayar, calismaSaatleri: v };
              setAyar(next);
              scheduleAyar(next);
            }}
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">WhatsApp varsayılan mesaj</h2>
          <EditableText
            active={inline}
            tag="p"
            className="mt-1 text-sm text-[var(--muted)]"
            multiline
            value={ilet.whatsappMesaj}
            onCommit={(v) => {
              const next = { ...ilet, whatsappMesaj: v };
              setIlet(next);
              scheduleIlet(next);
            }}
          />
        </div>
        <div>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-xl bg-[#25D366] px-6 py-3 font-semibold text-white hover:opacity-95"
          >
            WhatsApp ile yazın
          </a>
        </div>
      </div>
    </div>
  );
}
