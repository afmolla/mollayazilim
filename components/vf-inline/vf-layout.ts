import type { VfHiza } from "@/lib/vf-hiza";

export type { VfHiza } from "@/lib/vf-hiza";

/** Shrinks the item in a grid cell (legacy); prefer `vfHizaFlexClass` for full-width cards. */
export function vfHizaGridClass(h?: VfHiza): string {
  const v = h ?? "orta";
  if (v === "sol") return "justify-self-start";
  if (v === "sag") return "justify-self-end";
  return "justify-self-center";
}

/** Full-width column: stretch children, align text (cards stay same width/height as grid cell) */
export function vfHizaFlexClass(h?: VfHiza): string {
  const v = h ?? "orta";
  if (v === "sol") return "items-stretch text-left";
  if (v === "sag") return "items-stretch text-right";
  return "items-stretch text-center";
}

/** Izgara sütun genişliği (varsayılan: md:grid-cols-3 ile uyumlu) */
export function vfKolonClass(k?: 1 | 2 | 3, grid: "md3" | "sm2" = "md3"): string {
  if (grid === "sm2") {
    if (k === 2) return "sm:col-span-2";
    return "";
  }
  if (k === 2) return "md:col-span-2";
  if (k === 3) return "md:col-span-3";
  return "";
}

export function vfHizaMaxWidth(h?: VfHiza): string {
  const v = h ?? "orta";
  if (v === "orta") return "max-w-xl";
  return "max-w-lg";
}
