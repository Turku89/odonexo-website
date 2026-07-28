import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { CartProvider } from "@/lib/cart-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { SiteSettingsProvider } from "@/lib/site-settings-context";
import { getSiteSettings } from "@/lib/site-settings";
import { toPublicSiteSettings } from "@/lib/types/site-settings";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: {
    default: "odonexo.com | Diş Laboratuvar Malzemeleri",
    template: "%s | odonexo.com",
  },
  description:
    "Diş laboratuvarları için kaliteli malzeme tedarikçisi. Seramik, alçı, akrilik, freze ve laboratuvar ekipmanları. Quality Solutions For Stress-Free Dentistry.",
  keywords: [
    "diş laboratuvar malzemeleri",
    "dental lab supplies",
    "seramik",
    "freze",
    "alçı",
    "akrilik",
    "odonexo",
  ],
  icons: {
    icon: "/logo-header.jpg",
    apple: "/logo-header.jpg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = toPublicSiteSettings(await getSiteSettings());

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans`}>
        <LanguageProvider>
          <SiteSettingsProvider settings={siteSettings}>
            <CartProvider>
              <SiteChrome>{children}</SiteChrome>
            </CartProvider>
          </SiteSettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
