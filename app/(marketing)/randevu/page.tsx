import { RandevuForm } from "@/components/RandevuForm";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Online randevu",
  description:
    "Hızlı randevu talebi — panel onayından sonra müşteriye WhatsApp ile bilgi gönderilebilir.",
};

export default function RandevuPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="text-3xl font-bold text-[var(--text)]">Randevu al</h1>
      <p className="mt-2 text-[var(--muted)]">
        Form gönderildiğinde talep <strong>beklemede</strong> olarak kaydedilir; panelden
        onayladığınızda <strong>Genel randevu listesi</strong> sayfasında görünebilir.
      </p>
      <div className="mt-10">
        <RandevuForm />
      </div>
    </div>
  );
}
