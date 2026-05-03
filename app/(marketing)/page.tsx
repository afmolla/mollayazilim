import { redirect } from "next/navigation";

/**
 * Uygulama `basePath` ile `/kuafor` altında.
 * Yerelde kök `/` yapımı için `npm run dev` → `scripts/dev-gateway.mjs` (3000→3001).
 * `/kuafor` → buradan `/anasayfa` yönlendirmesi.
 */
export default function MarketingRootRedirect() {
  redirect("/anasayfa");
}
