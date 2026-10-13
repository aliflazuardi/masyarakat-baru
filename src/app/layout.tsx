import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// Self-hosted variable fonts via next/font: preloaded, with a size-adjusted fallback
// so the swap does not shift layout (CLS). Latin subset covers Bahasa Indonesia.
const sans = localFont({
  src: "../../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
});

const mono = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
  // Only used for numbers; don't compete with the main font for early bandwidth.
  preload: false,
});

// Absolute base for OG/canonical URLs. Override with SITE_URL when the site moves (BUILD_PLAN.md §17).
const siteUrl = process.env.SITE_URL ?? "https://aliflazuardi.github.io";
// Include the sub-path (GitHub Pages) so generated OG image URLs resolve.
const basePath = process.env.BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}${basePath}/`),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#16191d",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:text-bg"
        >
          Lewati ke konten
        </a>
        <SiteHeader />
        <main id="konten" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
