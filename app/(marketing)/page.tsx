import { redirect } from "next/navigation";

/**
 * Alt dizin vitrinde (`NEXT_PUBLIC_BASE_PATH`) bu route vitrin köküdür → `/anasayfa`.
 * Kök deploy’da Next zaten `/` için bu sayfayı sunar.
 * Yerelde alt dizin + yapım kökü: `npm run dev` → `scripts/dev-gateway.mjs`.
 */
export default function MarketingRootRedirect() {
  redirect("/anasayfa");
}
