import { headers } from "next/headers";
import { runWithSiteContext } from "@/lib/site-context";
import { dataSubdirForPrefix } from "@/lib/site-config";

type Props = { children: React.ReactNode };

/**
 * Middleware’in `x-site-prefix` / `x-data-subdir` başlıklarıyla istek başına veri kökünü bağlar.
 */
export async function SiteLayoutWrapper({ children }: Props) {
  const h = await headers();
  const prefix = h.get("x-site-prefix")?.trim() || "";
  const subdir = h.get("x-data-subdir")?.trim() || "kuafor";

  if (!prefix) {
    return <>{children}</>;
  }

  return runWithSiteContext({ prefix, subdir }, () => <>{children}</>);
}
