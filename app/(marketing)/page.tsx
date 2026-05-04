import { redirect } from "next/navigation";
import { getRequestSite } from "@/lib/site-request";
import { withBaseFromPrefix } from "@/lib/base-path";

/**
 * İç route `/` (middleware `/kuafor` ve `/kuafor/` isteklerini buraya rewrite eder).
 * Tarayıcıda vitrin kökü → `/anasayfa`.
 */
export default async function MarketingRootRedirect() {
  const { prefix } = await getRequestSite();
  redirect(withBaseFromPrefix(prefix, "/anasayfa"));
}
