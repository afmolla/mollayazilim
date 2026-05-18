import { Suspense } from "react";
import type { Metadata } from "next";
import { JsonLdLocalBusiness } from "@/components/JsonLd";
import { SiteEditModeHost } from "@/components/SiteEditModeHost";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SitePrefixProvider } from "@/components/SitePrefixProvider";
import { getRequestSite } from "@/lib/site-request";
import { VitrinDemoRibbon } from "@/components/vitrin/VitrinDemoRibbon";
import { ayarlarGetir } from "@/lib/settings-store";
import { siteUrl } from "@/lib/site";

function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1" style={{ paddingTop: "calc(var(--header-h, 64px) + 16px)" }}>
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4 py-14 text-center text-sm text-[var(--muted)]">Yükleniyor…</div>
          }
        >
          {children}
        </Suspense>
      </main>
      <SiteFooter />
      <VitrinDemoRibbon />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const ayar = await ayarlarGetir();
  const base = await siteUrl();
  const title = ayar.seoTitle?.trim() || ayar.salonAd?.trim() || "Site";
  const description =
    ayar.seoDescription?.trim() ||
    `${ayar.salonAd || "İşletme"} — online randevu, hizmetler ve iletişim bilgileri.`;
  const keywords = ayar.seoKeywords?.trim();
  const ogImage = ayar.seoOgImage?.trim();
  const index = ayar.seoIndex ?? true;

  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    keywords: keywords ? keywords.split(",").map((x) => x.trim()).filter(Boolean) : undefined,
    alternates: { canonical: base },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: base,
      siteName: title,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { prefix, subdir } = await getRequestSite();
  return (
    <SitePrefixProvider prefix={prefix}>
      <JsonLdLocalBusiness />
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-sm text-[var(--muted)]">
            Yükleniyor…
          </div>
        }
      >
        <SiteEditModeHost>
          <div
            data-vitrin={subdir}
            className="flex min-h-[100dvh] w-full flex-1 flex-col bg-[var(--surface)] text-[var(--text)]"
          >
            <MarketingShell>{children}</MarketingShell>
          </div>
        </SiteEditModeHost>
      </Suspense>
    </SitePrefixProvider>
  );
}
