import { redirect } from "next/navigation";

/**
 * Site kökü (`/`) IIS üzerinde `index.php` ile “yapım aşamasında” vb. sunulur.
 * Next uygulaması yalnızca `basePath` (`/kuafor`) altında; burası vitrin kökünden anasayfaya gider.
 */
export default function MarketingRootRedirect() {
  redirect("/anasayfa");
}
