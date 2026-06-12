"use client";

import { Suspense, type ReactNode } from "react";
import { SiteEditModeHost } from "@/components/SiteEditModeHost";
import { SitePrefixProvider } from "@/components/SitePrefixProvider";

/** Kurumsal anasayfa (`/`) — görsel düzenleme çubuğu ve panel oturumu. */
export function MollaPageShell({ children }: { children: ReactNode }) {
  return (
    <SitePrefixProvider prefix="">
      <Suspense fallback={null}>
        <SiteEditModeHost>{children}</SiteEditModeHost>
      </Suspense>
    </SitePrefixProvider>
  );
}
