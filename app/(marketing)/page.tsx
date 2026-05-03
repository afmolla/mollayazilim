import { redirect } from "next/navigation";

/** `.../kuafor` → `.../kuafor/anasayfa` */
export default function MarketingRootRedirect() {
  redirect("/anasayfa");
}
