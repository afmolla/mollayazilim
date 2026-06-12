import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { SitePrefixProvider } from "@/components/SitePrefixProvider";
import { getRequestSite } from "@/lib/site-request";

/** Doluysa PHP/static vitrin köküne gider; boşsa Next vitrin köküne. */
const siteHomeUrl = process.env.NEXT_PUBLIC_SITE_HOME_URL?.trim() ?? "";

function vitrinPublicHomeHref(prefix: string): string {
  const p = prefix.replace(/\/+$/, "");
  return p || "/";
}

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { prefix, subdir } = await getRequestSite();
  /** Kök panel (`/panel`) → ana vitrin `/`. Portföy (`/kuafor/panel`) → `/kuafor`. */
  const siteBackHref = siteHomeUrl || (prefix ? vitrinPublicHomeHref(prefix) : "/");
  const siteHomeClass =
    "text-sm font-medium text-[var(--muted)] hover:text-[var(--brand)]";
  const panelSiteLabel =
    subdir === "molla" ? "mollayazilim.com (kurumsal)" : `${prefix || subdir} vitrini`;

  return (
    <SitePrefixProvider prefix={prefix}>
      <div data-panel-vitrin={subdir} className="flex min-h-screen flex-col bg-[var(--surface-2)]">
        <header className="panel-top-bar shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-col gap-0.5">
              {siteHomeUrl ? (
                <a href={siteHomeUrl} className={siteHomeClass}>
                  ← Siteye dön
                </a>
              ) : (
                <Link href={siteBackHref} className={siteHomeClass}>
                  ← Siteye dön
                </Link>
              )}
              <span className="truncate text-[11px] font-medium text-[var(--muted)]">
                Panel: {panelSiteLabel}
              </span>
            </div>
            <ThemeSwitcher compact />
          </div>
        </header>
        <div className="flex w-full min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </SitePrefixProvider>
  );
}
