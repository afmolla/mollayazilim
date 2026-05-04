import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { SitePrefixProvider } from "@/components/SitePrefixProvider";
import { getRequestSite } from "@/lib/site-request";
import { withBaseFromPrefix } from "@/lib/base-path";

/** Doluysa PHP/static vitrin köküne gider; boşsa Next vitrin köküne. */
const siteHomeUrl = process.env.NEXT_PUBLIC_SITE_HOME_URL?.trim() ?? "";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { prefix } = await getRequestSite();
  const siteHomeClass =
    "text-sm font-medium text-[var(--muted)] hover:text-[var(--brand)]";

  return (
    <SitePrefixProvider prefix={prefix}>
      <div className="flex min-h-screen flex-col bg-[var(--surface-2)]">
        <header className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            {siteHomeUrl ? (
              <a href={siteHomeUrl} className={siteHomeClass}>
                ← Siteye dön
              </a>
            ) : (
              <Link href={withBaseFromPrefix(prefix, "/anasayfa")} className={siteHomeClass}>
                ← Siteye dön
              </Link>
            )}
            <ThemeSwitcher compact />
          </div>
        </header>
        <div className="flex w-full min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </SitePrefixProvider>
  );
}
