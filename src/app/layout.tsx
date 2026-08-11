import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    // ?v=bt2 busts browser cache of the old keyboard photo favicon
    icon: [
      { url: "/favicon.svg?v=bt2", type: "image/svg+xml" },
      { url: "/favicon-32.png?v=bt2", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png?v=bt2", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=bt2", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico?v=bt2", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png?v=bt2", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32.png?v=bt2",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
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

  // Inline boot script as string for beforeInteractive-free dark default
  const themeBoot = `(function(){try{var d=document.documentElement;d.classList.add("dark");var raw=localStorage.getItem("typing-master-settings");if(!raw)return;var p=JSON.parse(raw);var t=(p&&p.state&&p.state.theme)||"dark";if(t==="light")d.classList.remove("dark");else d.classList.add("dark");}catch(e){document.documentElement.classList.add("dark");}})();`;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="py-8 text-center text-sm text-zinc-500">
          <p>
            Developed by UMAR TECH ·{" "}
            <span className="text-zinc-400">B 2026</span>
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            Contact Us ·{" "}
            <a
              href="https://wa.me/923405026367"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-blue-400"
            >
              Whatsapp +923405026367
            </a>{" "}
            ·{" "}
            <a
              href="mailto:umar092939495@gmail.com"
              className="transition-colors hover:text-blue-400"
            >
              umar092939495@gmail.com
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
