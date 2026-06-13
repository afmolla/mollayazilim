/** @deprecated landing.json sssBolum.sorular kullanın — geriye dönük uyumluluk */
export type { MollaFaqItem } from "@/lib/molla-landing-store";
export { varsayilanMollaLanding } from "@/lib/molla-landing-store";

import { varsayilanMollaLanding } from "@/lib/molla-landing-store";

/** Statik varsayılan SSS — JsonLd async landing kullanır */
export const MOLLA_LANDING_FAQ = varsayilanMollaLanding().sssBolum.sorular;
