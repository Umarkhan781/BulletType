import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BulletType — Modern Typing Practice & Learning",
  description:
    "Master touch typing with structured lessons, advanced analytics, multiplayer races, and beautiful glassmorphism UI.",
  keywords: ["typing", "typing test", "learn typing", "wpm", "monkeytype"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-8 text-center text-sm text-zinc-500">
          <p>
            Developed by UMAR TECH ·{" "}
            <span className="text-zinc-400">B 2026</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
