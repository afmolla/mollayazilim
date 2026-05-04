import { redirect } from "next/navigation";
import { getRequestSite } from "@/lib/site-request";
import { withBaseFromPrefix } from "@/lib/base-path";
import { MarketingPageMarker } from "./MarketingPageMarker";

/**
 * İç route `/` (proxy `/kuafor` ve `/kuafor/` isteklerini buraya rewrite eder).
 * Tarayıcıda vitrin kökü → `/anasayfa`.
 */
export default async function MarketingRootRedirect() {
  const { prefix } = await getRequestSite();
  const target = withBaseFromPrefix(prefix, "/anasayfa");
  return (
    <>
      <MarketingPageMarker />
      {redirect(target)}
    </>
  );
}
