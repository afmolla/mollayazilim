import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeBootstrapInlineScript } from "@/lib/theme-constants";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

/**
 * Kök metadata tamamen statik: generateMetadata + headers()/async zinciri
 * Vercel üretiminde `/` için RSC 500 tetikleyebiliyordu.
 * Vitrin sayfaları kendi segment metadata ile birleştirir.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://mollayazilim.com"),
  title: {
    default: "Molla Yazılım | Özel Yazılım & Admin Panelleri",
    template: "%s | Molla Yazılım",
  },
  description:
    "İşletmeniz için özel yazılım çözümleri, admin panelleri ve sektöre özel hazır sistemler. Kuaför, restoran ve emlak demolarını inceleyin.",
  keywords: ["özel yazılım", "admin panel", "yönetim paneli", "SaaS", "Next.js", "İstanbul"],
  authors: [{ name: "Molla Yazılım" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://mollayazilim.com",
    siteName: "Molla Yazılım",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://mollayazilim.com" },
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
        <ThemeProvider>
          <div className="flex min-h-full flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
