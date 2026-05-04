import { redirect } from "next/navigation";
import { withBase } from "@/lib/base-path";

/**
 * İç route `/` (middleware `/kuafor` ve `/kuafor/` isteklerini buraya rewrite eder).
 * Tarayıcıda vitrin kökü → `/anasayfa`.
 */
export default function MarketingRootRedirect() {
  redirect(withBase("/anasayfa"));
}
