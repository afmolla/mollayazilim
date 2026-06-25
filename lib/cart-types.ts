export type CartItem = {
  urunId: string;
  varyantId: string;
  slug: string;
  baslik: string;
  varyantEtiket: string;
  birimFiyat: number;
  miktar: number;
  birim: "adet" | "kg";
  imageSrc?: string;
};

export type CartState = {
  items: CartItem[];
};

export function cartStorageKey(sitePrefix: string): string {
  const p = sitePrefix.replace(/\/+$/, "") || "root";
  return `molla-cart:${p}`;
}

export function cartItemKey(urunId: string, varyantId: string): string {
  return `${urunId}:${varyantId}`;
}

export function cartLineTotal(item: CartItem): number {
  return item.birimFiyat * item.miktar;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, x) => sum + cartLineTotal(x), 0);
}

export function cartKdv(subtotal: number, rate = 0.2): number {
  return Math.round(subtotal * rate * 100) / 100;
}

export function cartTotal(subtotal: number, kdvRate = 0.2): number {
  return Math.round((subtotal + cartKdv(subtotal, kdvRate)) * 100) / 100;
}

export function readCartFromStorage(key: string): CartState {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as Partial<CartState>;
    const items = Array.isArray(parsed.items) ? parsed.items.filter(cartItemValid) : [];
    return { items };
  } catch {
    return { items: [] };
  }
}

export function writeCartToStorage(key: string, state: CartState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

function cartItemValid(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.urunId === "string" &&
    typeof o.varyantId === "string" &&
    typeof o.baslik === "string" &&
    typeof o.birimFiyat === "number" &&
    typeof o.miktar === "number" &&
    o.miktar > 0
  );
}
