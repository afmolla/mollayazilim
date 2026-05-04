import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeBootstrapInlineScript } from "@/lib/theme-constants";
import { JsonLdLocalBusiness } from "@/components/JsonLd";
import { siteUrl } from "@/lib/site";
import { runWithSiteContext } from "@/lib/site-context";
import { ayarlarGetir } from "@/lib/settings-store";
import { siteFromRequestHeaders } from "@/lib/site-request";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { prefix, subdir } = await siteFromRequestHeaders();
  return runWithSiteContext({ prefix, subdir }, async () => {
    const ayar = await ayarlarGetir();
    const base = await siteUrl();
    const isRestaurant = subdir === "restaurant";
    const defaultTitle = isRestaurant
      ? `${ayar.salonAd} | Restoran`
      : `${ayar.salonAd} | Kuaför & Berber — İstanbul`;
    const desc = isRestaurant
      ? "QR menü, rezervasyon ve iletişim — restoran vitrin demosu."
      : "Modern kuaför ve berber hizmetleri: kesim, sakal, boya ve bakım. Online randevu, SEO uyumlu vitrin.";
    const kw = isRestaurant
      ? ["restoran", "QR menü", "rezervasyon", "İstanbul", "yemek"]
      : ["kuaför", "berber", "randevu", "İstanbul", "saç kesimi", "sakal"];

    return {
      metadataBase: new URL(base),
      title: {
        default: defaultTitle,
        template: `%s | ${ayar.salonAd}`,
      },
      description: desc,
      keywords: kw,
      authors: [{ name: ayar.salonAd }],
      openGraph: {
        type: "website",
        locale: "tr_TR",
        url: base,
        siteName: ayar.salonAd,
      },
      robots: { index: true, follow: true },
      alternates: { canonical: base },
    };
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { prefix, subdir } = await siteFromRequestHeaders();

  return runWithSiteContext({ prefix, subdir }, () => (
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
  ));
}
