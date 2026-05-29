"use client";

import Link from "next/link";
import { CookieSettingsLink } from "@/components/CookieConsent";

/** Footer alt satır — çerez linkleri (tüm vitrinler) */
export function CookieFooterBar({ className = "" }: { className?: string }) {
  return (
    <p className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs ${className}`}>
      <Link href="/cerez-politikasi" className="underline hover:opacity-80">
        Çerez politikası
      </Link>
      <span aria-hidden className="opacity-40">
        ·
      </span>
      <CookieSettingsLink className="underline hover:opacity-80" />
    </p>
  );
}
