"use client";

import { CartProvider } from "@/components/ambalaj/CartProvider";
import type { ReactNode } from "react";

export function AmbalajStoreShell({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
