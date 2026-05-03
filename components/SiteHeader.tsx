import Link from "next/link";
import { ayarlarGetir } from "@/lib/settings-store";
import { menuGetir } from "@/lib/menu-store";
import { MobileNav } from "@/components/MobileNav";
import { SiteNavLinks } from "@/components/SiteNavLinks";

export async function SiteHeader() {
  const ayar = await ayarlarGetir();
  const menu = await menuGetir();
  const links = menu.header.filter((n) => n.label && n.href);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 md:flex-row md:items-center md:gap-3 md:px-6 lg:gap-5">
        <div className="flex w-full min-w-0 shrink-0 items-center gap-2 md:w-auto md:max-w-[min(100%,220px)] lg:max-w-[260px]">
          <div className="flex min-w-0 items-center gap-3">
            <MobileNav brand={ayar.salonAd} items={menu.header} />
            <Link href="/" className="truncate text-lg font-bold tracking-tight text-[var(--text)]">
              {ayar.salonAd}
            </Link>
          </div>
        </div>

        <nav
          className="site-header-nav flex min-w-0 flex-1 items-center justify-center md:justify-center"
          aria-label="Ana menü"
        >
          <SiteNavLinks links={links} />
        </nav>
      </div>
    </header>
  );
}
