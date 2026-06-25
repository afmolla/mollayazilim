"use client";

import Link from "next/link";
import { useWithBase } from "@/components/SitePrefixProvider";
import { useCartOptional } from "@/components/ambalaj/CartProvider";

export function CartButton() {
  const wb = useWithBase();
  const cart = useCartOptional();
  if (!cart) return null;

  return (
    <Link
      href={wb("/sepet")}
      className="relative inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
      aria-label={`Sepet (${cart.count} ürün)`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.5" fill="currentColor" />
        <circle cx="18" cy="20" r="1.5" fill="currentColor" />
      </svg>
      <span className="hidden sm:inline">Sepet</span>
      {cart.count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-emerald-950">
          {cart.count}
        </span>
      ) : null}
    </Link>
  );
}
