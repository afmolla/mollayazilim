import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cormorant_Garamond, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeBootstrapInlineScript } from "@/lib/theme-constants";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { VfAnalyticsTracker } from "@/components/VfAnalyticsTracker";
import { normalizePublicSiteUrl } from "@/lib/site";

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

const SITE_URL = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) || "https://mollayazilim.com";
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
    default: "Molla Yazılım | Özel Yazılım & Admin Panelleri",
    template: "%s | Molla Yazılım",
  },
  description:
    "Web sitesi, admin panel ve sektörel hazır sistemler (kuaför, restoran, emlak). Hızlı demo, modern tasarım ve ölçülebilir dönüşüm odaklı kurulum.",
  keywords: [
    "web sitesi",
    "kurumsal web sitesi",
    "özel yazılım",
    "yazılım ajansı",
    "admin panel",
    "yönetim paneli",
    "randevu sistemi",
    "qr menü",
    "İstanbul web tasarım",
    "web sitesi yaptırma",
    "kuaför randevu sistemi",
    "restoran web sitesi",
    "emlak ilan sitesi",
  ],
  authors: [{ name: "Molla Yazılım" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "Molla Yazılım",
    title: "Molla Yazılım | Web Sitesi & Admin Panel",
    description:
      "Web sitesi, admin panel ve sektörel hazır sistemler. Hızlı demo ve net teslim planı ile yayına çıkın.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  twitter: {
    card: "summary_large_image",
    title: "Molla Yazılım | Web Sitesi & Admin Panel",
    description:
      "Web sitesi, admin panel ve sektörel hazır sistemler. Hızlı demo ve net teslim planı ile yayına çıkın.",
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
        <GoogleAnalytics />
        <VfAnalyticsTracker />
        <ThemeProvider>
          <div className="flex min-h-full flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
