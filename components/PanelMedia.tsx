"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Medya = {
  id: string;
  ad: string;
  url: string;
  mime: string;
  boyut: number;
  olusturulma: string;
};

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function normalize(s: string) {
  return s.trim().toLocaleLowerCase("tr-TR");
}

export function PanelMedia(props: {
  const wb = useWithBase(); onPickUrl?: (url: string) => void }) {
  const router = useRouter();
  const [list, setList] = useState<Medya[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchList = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(wb("/api/panel/media"), {
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });
    if (res.status === 401) {
      setLoading(false);
      router.refresh();
      return;
    }
    if (!res.ok) {
      setErr("Medya yüklenemedi");
      setLoading(false);
      return;
    }
    const j = (await res.json()) as { medya: Medya[] };
    setList(j.medya);
    setErr("");
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const ac = new AbortController();
    const { signal } = ac;
    void (async () => {
      try {
        const res = await fetch(wb("/api/panel/media"), {
          cache: "no-store",
          credentials: "same-origin",
          signal,
        });
        if (signal.aborted) return;
        if (res.status === 401) {
          setLoading(false);
          router.refresh();
          return;
        }
        if (!res.ok) {
          setErr("Medya yüklenemedi");
          setLoading(false);
          return;
        }
        const j = (await res.json()) as { medya: Medya[] };
        setList(j.medya);
        setErr("");
        setLoading(false);
      } catch {
        if (signal.aborted) return;
        setErr("Medya yüklenemedi");
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [router]);

  const filtered = useMemo(() => {
    const qn = normalize(q);
    if (!qn) return list;
    return list.filter((m) => normalize(`${m.ad} ${m.url}`).includes(qn));
  }, [list, q]);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErr("");
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch(wb("/api/panel/media"), { method: "POST", body: fd });
        const j = (await res.json()) as { ok?: boolean; error?: string };
        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok || !j.ok) {
          setErr(j.error ?? "Yüklenemedi");
          return;
        }
      }
      await fetchList();
    } finally {
      setUploading(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Silinsin mi?")) return;
    const res = await fetch(wb(`/api/panel/media/${encodeURIComponent(id)}`), { method: "DELETE" });
    if (res.status === 401) {
      router.refresh();
      return;
    }
    if (!res.ok) {
      setErr("Silinemedi");
      return;
    }
    await fetchList();
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  }

  if (loading) return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Medya</h1>
          <p className="text-sm text-[var(--muted)]">Görsel yükleyin, URL kopyalayın veya sayfaya ekleyin.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]">
            {uploading ? "Yükleniyor…" : "Görsel yükle"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => void upload(e.target.files)}
            />
          </label>
          <button
            type="button"
            onClick={() => void fetchList()}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            Yenile
          </button>
        </div>
      </div>

      <div className="w-full md:max-w-sm">
        <label className="sr-only" htmlFor="qmedia">Ara</label>
        <input
          id="qmedia"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ara: dosya adı…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
        />
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">
          {err}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div
              className="relative w-full overflow-hidden bg-[var(--surface-2)]"
              style={{ aspectRatio: "4/3" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={m.ad}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <div className="space-y-2 p-4">
              <div className="text-sm font-semibold text-[var(--text)]">{m.ad}</div>
              <div className="text-xs text-[var(--muted)]">
                {bytes(m.boyut)} · {new Date(m.olusturulma).toLocaleString("tr-TR")}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void copyUrl(m.url)}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                >
                  URL kopyala
                </button>
                {props.onPickUrl ? (
                  <button
                    type="button"
                    onClick={() => props.onPickUrl?.(m.url)}
                    className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--on-brand)]"
                  >
                    Seç
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void del(m.id)}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[var(--muted)]">Henüz görsel yok.</p>
      ) : null}
    </div>
  );
}

