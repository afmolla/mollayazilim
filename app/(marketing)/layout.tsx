import { Suspense } from "react";
import { SiteEditModeHost } from "@/components/SiteEditModeHost";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<MarketingShell>{children}</MarketingShell>}>
      <SiteEditModeHost>
        <MarketingShell>{children}</MarketingShell>
      </SiteEditModeHost>
    </Suspense>
  );
}
