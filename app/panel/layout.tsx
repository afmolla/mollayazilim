import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { withBase } from "@/lib/base-path";

/** Doluysa PHP/static vitrin köküne gider; boşsa Next vitrin (`withBase("/anasayfa")`). */
const siteHomeUrl = process.env.NEXT_PUBLIC_SITE_HOME_URL?.trim() ?? "";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteHomeClass =
    "text-sm font-medium text-[var(--muted)] hover:text-[var(--brand)]";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-2)]">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {siteHomeUrl ? (
            <a href={siteHomeUrl} className={siteHomeClass}>
              ← Siteye dön
            </a>
          ) : (
            <Link href={withBase("/anasayfa")} className={siteHomeClass}>
              ← Siteye dön
            </Link>
          )}
          <ThemeSwitcher compact />
        </div>
      </header>
      <div className="flex w-full min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
