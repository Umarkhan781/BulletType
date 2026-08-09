import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expert Typing Test — Timed WPM Challenge",
  description:
    "Take a timed expert typing test with full stats: WPM, accuracy, consistency, and more. Challenge yourself online for free.",
  alternates: { canonical: "/expert" },
  openGraph: {
    title: "Expert Typing Test — Timed WPM Challenge | BulletType",
    description:
      "Timed expert typing test with advanced WPM and accuracy statistics.",
    url: "/expert",
  },
};

export default function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
