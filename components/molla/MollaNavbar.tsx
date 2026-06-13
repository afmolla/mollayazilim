"use client";

import Link from "next/link";
import type { MollaLanding } from "@/lib/molla-landing-store";

function waMeLink(phone: string, text: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "#";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

type Props = {
  navbar: MollaLanding["navbar"];
  whatsapp: string;
};

export function MollaNavbar({ navbar: n, whatsapp }: Props) {
  const waHref = waMeLink(whatsapp, n.whatsappMesaj);
  return (
    <header
      data-fixed-header
      className="fixed left-0 right-0 top-0 z-[100] h-16 border-b border-white/10 bg-[#070616]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-sm font-black text-black">
            {n.markaHarf || "M"}
          </span>
          <span className="min-w-0 truncate whitespace-nowrap text-sm font-semibold tracking-tight text-white sm:max-w-none">
            {n.markaAd}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex" aria-label="Ana menü">
          {n.navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 md:inline-flex"
          >
            {n.whatsappLabel}
          </a>
          <a
            href={n.crmDemoHref}
            className="hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 md:inline-flex"
          >
            {n.crmDemoLabel}
          </a>
          <a
            href={n.ctaHref}
            className="inline-flex rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
          >
            {n.ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
