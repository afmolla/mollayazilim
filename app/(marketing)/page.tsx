import { redirect } from "next/navigation";

/**
 * Uygulama `basePath` ile `/kuafor` altında. Kök `/` → `proxy.ts` yapım HTML’i.
 * `/kuafor` → buradan `/anasayfa` yönlendirmesi.
 */
export default function MarketingRootRedirect() {
  redirect("/anasayfa");
}
