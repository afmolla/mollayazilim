"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Hizmetler", href: "#hizmetler" },
  { label: "Demolar", href: "#demolar" },
  { label: "Yorumlar", href: "#yorumlar" },
  { label: "İletişim", href: "#iletisim" },
];

export function MollaNavbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50",
        scrolled
          ? "border-b border-white/10 bg-black/30 backdrop-blur-md supports-[backdrop-filter]:bg-black/20"
          : "border-b-0 bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 text-sm font-black text-black">
            M
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            Molla Yazılım
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex" aria-label="Ana menü">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#demolar"
            className="hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 md:inline-flex"
          >
            Demo gör
          </a>
          <a
            href="#iletisim"
            className="inline-flex rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
          >
            İletişime geç
          </a>
        </div>
      </div>
    </header>
  );
}

