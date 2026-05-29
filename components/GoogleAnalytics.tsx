"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { COOKIE_CONSENT_EVENT, readStoredConsent, type CookieConsentChoice } from "@/lib/cookie-consent";
import { hasAnalyticsConsent } from "@/components/CookieConsent";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/** GA4 — yalnızca analitik çerez onayı + env varsa yüklenir. */
export function GoogleAnalytics() {
  const [consent, setConsent] = useState<CookieConsentChoice | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConsent(readStoredConsent());
    setMounted(true);
    const onUpdate = (e: Event) => {
      setConsent((e as CustomEvent<CookieConsentChoice>).detail ?? readStoredConsent());
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onUpdate);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onUpdate);
  }, []);

  if (!GA_ID || !mounted || !hasAnalyticsConsent(consent)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
