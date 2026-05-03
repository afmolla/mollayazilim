import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeBootstrapInlineScript } from "@/lib/theme-constants";
import { JsonLdLocalBusiness } from "@/components/JsonLd";
import { siteUrl, salonAd } from "@/lib/site";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const base = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: `${salonAd()} | Kuaför & Berber — İstanbul`,
    template: `%s | ${salonAd()}`,
  },
  description:
    "Modern kuaför ve berber hizmetleri: kesim, sakal, boya ve bakım. Online randevu, SEO uyumlu vitrin.",
  keywords: [
    "kuaför",
    "berber",
    "randevu",
    "İstanbul",
    "saç kesimi",
    "sakal",
  ],
  authors: [{ name: salonAd() }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: base,
    siteName: salonAd(),
  },
  robots: { index: true, follow: true },
  alternates: { canonical: base },
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
    <html lang="tr" className={`${outfit.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapInlineScript() }} />
      </head>
      <body
        className="min-h-full bg-[var(--surface)] font-sans text-[var(--text)] antialiased"
        suppressHydrationWarning
      >
        <JsonLdLocalBusiness />
        <ThemeProvider>
          <div className="flex min-h-full flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
