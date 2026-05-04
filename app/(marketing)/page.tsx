import { redirect } from "next/navigation";

/**
 * Kök `/` → `/anasayfa`. `NEXT_PUBLIC_BASE_PATH` doluysa tarayıcıda `/kuafor` vb. altında
 * açılır (`withBase` linkler); yerelde `npm run dev` gateway öneki Next’ten ayırır.
 */
export default function MarketingRootRedirect() {
  redirect("/anasayfa");
}
