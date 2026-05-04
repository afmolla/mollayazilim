import { Suspense } from "react";
import { SiteEditModeHost } from "@/components/SiteEditModeHost";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SitePrefixProvider } from "@/components/SitePrefixProvider";
import { getRequestSite } from "@/lib/site-request";
import { VfAnalyticsTracker } from "@/components/VfAnalyticsTracker";

function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <VfAnalyticsTracker />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { prefix } = await getRequestSite();
  return (
    <SitePrefixProvider prefix={prefix}>
      <Suspense fallback={<MarketingShell>{children}</MarketingShell>}>
        <SiteEditModeHost>
          <MarketingShell>{children}</MarketingShell>
        </SiteEditModeHost>
      </Suspense>
    </SitePrefixProvider>
  );
}
