import type { Metadata } from "next";
import { CartPageClient } from "@/components/ambalaj/CartPageClient";

export const metadata: Metadata = {
  title: "Sepet",
  description: "Alışveriş sepetiniz",
};

export default function SepetPage() {
  return <CartPageClient />;
}
