import type { Metadata } from "next";
import { CheckoutClient } from "@/components/ambalaj/CheckoutClient";

export const metadata: Metadata = {
  title: "Ödeme",
  description: "Sipariş ve teslimat bilgileri",
};

export default function OdemePage() {
  return <CheckoutClient />;
}
