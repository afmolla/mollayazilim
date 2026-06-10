import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cormorant_Garamond, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeBootstrapInlineScript } from "@/lib/theme-constants";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { VfAnalyticsTracker } from "@/components/VfAnalyticsTracker";
import { CookieConsentProvider } from "@/components/CookieConsent";
import { normalizePublicSiteUrl, isUsablePublicHost } from "@/lib/site";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

/** Restoran vitrin başlıkları — fine dining serif */
const restaurantDisplay = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-restaurant",
  display: "swap",
});

/** Emlak vitrin başlıkları — okunaklı sans */
const emlakDisplay = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-emlak-display",
  display: "swap",
});

function metadataSiteUrl(): string {
  const raw = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (raw) {
    try {
      if (isUsablePublicHost(new URL(raw).host)) return raw;
    } catch {
      /* ignore */
    }
  }
  return "https://mollayazilim.com";
}

const SITE_URL = metadataSiteUrl();
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const YANDEX_VERIFICATION = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION?.trim();

/**
 * Kök metadata tamamen statik: generateMetadata + headers()/async zinciri
 * Vercel üretiminde `/` için RSC 500 tetikleyebiliyordu.
 * Vitrin sayfaları kendi segment metadata ile birleştirir.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(GOOGLE_VERIFICATION || YANDEX_VERIFICATION
    ? {
        verification: {
          ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
          ...(YANDEX_VERIFICATION ? { yandex: YANDEX_VERIFICATION } : {}),
        },
      }
    : {}),
  title: {
    default: "Molla CRM | Tekirdağ Kapaklı Müşteri Takip & Satış Yönetimi",
    template: "%s | Molla Yazılım",
  },
  description:
    "Tekirdağ ve Kapaklı için Türkçe CRM programı: müşteri takibi, satış pipeline, teklif yönetimi. Ücretsiz demo — kurumsal web sitesi ve admin panel.",
  keywords: [
    "CRM programı",
    "müşteri takip programı",
    "satış takip yazılımı",
    "müşteri ilişkileri yönetimi",
    "CRM yazılımı",
    "KOBİ CRM",
    "Tekirdağ CRM",
    "Kapaklı yazılım",
    "Çerkezköy CRM",
    "teklif takip programı",
    "pipeline yönetimi",
    "web sitesi Tekirdağ",
    "kurumsal web sitesi",
    "admin panel",
  ],
  authors: [{ name: "Molla Yazılım" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "Molla Yazılım",
    title: "Molla CRM | Tekirdağ Kapaklı Müşteri Takip Yazılımı",
    description:
      "Türkçe CRM programı: müşteri takibi, satış pipeline, teklif yönetimi. Tekirdağ Kapaklı KOBİ'ler için — ücretsiz demo.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  twitter: {
    card: "summary_large_image",
    title: "Molla CRM | Tekirdağ Kapaklı Müşteri Takip Yazılımı",
    description:
      "Türkçe CRM programı: müşteri takibi, satış pipeline, teklif yönetimi. Tekirdağ Kapaklı KOBİ'ler için — ücretsiz demo.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${outfit.variable} ${restaurantDisplay.variable} ${emlakDisplay.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapInlineScript() }} />
      </head>
      <body
        className="min-h-full bg-[var(--surface)] font-sans text-[var(--text)] antialiased"
        suppressHydrationWarning
      >
        <CookieConsentProvider>
          <GoogleAnalytics />
          <VfAnalyticsTracker />
          <ThemeProvider>
            <div className="flex min-h-full flex-col">{children}</div>
          </ThemeProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
