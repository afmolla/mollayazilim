import { RandevuForm } from "@/components/RandevuForm";
import type { Metadata } from "next";
import { icerikGetir } from "@/lib/content-store";
import { defaultRandevuOptionsForSubdir } from "@/lib/randevu-form-defaults";
import { getRequestSite } from "@/lib/site-request";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const c = await icerikGetir();
  const { subdir } = await getRequestSite();
  const rf = c.randevuForm;
  const title =
    rf?.pageTitle ??
    (subdir === "restaurant"
      ? "Masa ayırt"
      : subdir === "avukat"
        ? "Ön görüşme talebi"
        : "Online randevu");
  const description =
    rf?.pageDescription ??
    (subdir === "restaurant"
      ? "Rezervasyon talebiniz panele düşer; onay sonrası rezervasyon listenizde görünür."
      : "Talebiniz panele düşer; onay sonrası müşteri listenizde görünür.");
  return {
    title,
    description,
  };
}

export default async function RandevuPage() {
  const c = await icerikGetir();
  const { subdir } = await getRequestSite();
  const rf = c.randevuForm;
  const cfg = {
    selectLabel:
      rf?.selectLabel ??
      (subdir === "restaurant" ? "Misafir / masa" : subdir === "avukat" ? "Konu" : "Hizmet"),
    options: rf?.options?.length ? rf.options : defaultRandevuOptionsForSubdir(subdir),
    submitButtonLabel: rf?.submitButtonLabel,
    successMessage: rf?.successMessage,
  };

  const defaultIntro =
    subdir === "restaurant"
      ? "Rezervasyon talebi gönderildiğinde kayıt beklemede kalır; panelden onayladığınızda onaylı rezervasyon listesinde yayınlanabilir."
      : "Form gönderildiğinde talep beklemede olarak kaydedilir; panelden onayladığınızda randevu listesinde görünebilir.";

  const heading =
    rf?.pageTitle ??
    (subdir === "restaurant" ? "Masa ayırt" : subdir === "avukat" ? "Ön görüşme talebi" : "Randevu al");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="text-3xl font-bold text-[var(--text)]">{heading}</h1>
      <p className="mt-2 text-[var(--muted)]">{rf?.intro ?? defaultIntro}</p>
      <div className="mt-10">
        <RandevuForm config={cfg} />
      </div>
    </div>
  );
}
