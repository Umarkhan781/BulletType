import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Typing Test & WPM Practice Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "typing test",
    "free typing test",
    "wpm test",
    "typing practice",
    "touch typing",
    "learn typing",
    "typing speed test",
    "online typing test",
    "keyboard practice",
    "BulletType",
  ],
  authors: [{ name: "UMAR TECH" }],
  creator: "UMAR TECH",
  publisher: "UMAR TECH",
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Typing Test & WPM Practice Online`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Free Typing Test & WPM Practice Online`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    // ?v=bt3 busts cache of the previous blue BT mark
    icon: [
      { url: "/favicon.svg?v=bt3", type: "image/svg+xml" },
      { url: "/favicon-32.png?v=bt3", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png?v=bt3", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=bt3", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico?v=bt3", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png?v=bt3", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.svg?v=bt3",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#173024" },
    { media: "(prefers-color-scheme: dark)", color: "#173024" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "UMAR TECH",
    },
  };

  // Inline boot script: Forest is the product default
  const themeBoot = `(function(){var d=document.documentElement;var valid={dark:1,light:1,ocean:1,forest:1,sunset:1,lavender:1,midnight:1,rose:1,emerald:1,mono:1};var t="forest";try{var allow=/(?:^|; )bt-cookie-consent=allow(?:;|$)/.test(document.cookie);if(allow){var c=document.cookie.match(/(?:^|; )bt-theme=([^;]*)/);if(c){t=decodeURIComponent(c[1]);}else{var raw=localStorage.getItem("typing-master-settings");if(raw){var p=JSON.parse(raw);var s=(p&&p.state&&p.state.theme)||"forest";t=s==="system"?"forest":s==="midnight-blue"?"midnight":s;}}}}catch(e){t="forest";}if(!valid[t])t="forest";d.setAttribute("data-theme",t);if(t==="light")d.classList.remove("dark");else d.classList.add("dark");})();`;

  return (
    <html lang="en" className="dark" data-theme="forest" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} min-h-screen flex flex-col overflow-x-hidden antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex min-h-0 flex-1 flex-col bg-[var(--background)]">
          {children}
        </main>
        <CookieConsent />
        <SiteFooter />
      </body>
    </html>
  );
}
