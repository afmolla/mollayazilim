"use client";

import { type ReactNode } from "react";

export function GradientBg({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
      >
        <div className="absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600/35 via-fuchsia-500/25 to-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-32 right-[-10%] h-[460px] w-[620px] rounded-full bg-gradient-to-r from-sky-500/20 via-violet-500/25 to-indigo-600/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(99,102,241,0.22),transparent),radial-gradient(900px_500px_at_20%_20%,rgba(168,85,247,0.16),transparent),radial-gradient(700px_450px_at_80%_30%,rgba(34,211,238,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55),rgba(0,0,0,0.8))]" />
      </div>

      {children}
    </div>
  );
}

