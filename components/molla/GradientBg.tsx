"use client";

import { type ReactNode } from "react";

/**
 * GERİ DÖN — önceki (daha “hafif”) ayar — bu snapshot’a dönmek için class’ları buna çevir:
 * - base: `bg-[linear-gradient(155deg,#0a071c_0%,#100818_42%,#071a1f_100%)]`
 * - wash: `from-indigo-600/[0.11] via-fuchsia-600/[0.08] to-cyan-500/[0.1]`
 * - üst blob: `from-indigo-600/45 via-fuchsia-500/35 to-cyan-400/28`
 * - alt blob: `from-sky-500/30 via-violet-500/28 to-indigo-600/30`
 * - radial RGBA’lar: 0.18 / 0.12 / 0.1
 */

export function GradientBg({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[linear-gradient(155deg,#0c0826_0%,#120a1e_42%,#081c26_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.17] via-fuchsia-600/[0.13] to-cyan-500/[0.16]" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600/52 via-fuchsia-500/42 to-cyan-400/34 blur-3xl" />
        <div className="absolute -bottom-32 right-[-10%] h-[460px] w-[620px] rounded-full bg-gradient-to-r from-sky-500/38 via-violet-500/34 to-indigo-600/38 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(99,102,241,0.24),transparent),radial-gradient(900px_500px_at_20%_20%,rgba(168,85,247,0.17),transparent),radial-gradient(700px_450px_at_80%_30%,rgba(34,211,238,0.14),transparent)]" />
      </div>

      {children}
    </div>
  );
}

