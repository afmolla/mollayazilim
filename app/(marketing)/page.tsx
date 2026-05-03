import { redirect } from "next/navigation";

/**
 * Uygulama `basePath` ile `/kuafor` altında. Kök `/` için `middleware.ts` “yapım aşamasında” HTML döner.
 * `/kuafor` → buradan `/anasayfa` yönlendirmesi.
 */
export default function MarketingRootRedirect() {
  redirect("/anasayfa");
}
