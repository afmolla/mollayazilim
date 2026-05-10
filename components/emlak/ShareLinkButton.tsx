"use client";

import { useState } from "react";

export function ShareLinkButton(props: { url: string; label?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(props.url);
      setState("ok");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("err");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/40"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 13a5 5 0 0 1 7 0l1 1a5 5 0 0 1-7 7l-1-1M14 11a5 5 0 0 0-7 0l-1 1a5 5 0 0 0 7 7l1-1"
        />
      </svg>
      {state === "ok"
        ? "Link kopyalandı"
        : state === "err"
          ? "Kopyalanamadı"
          : (props.label ?? "İlan linkini kopyala")}
    </button>
  );
}
