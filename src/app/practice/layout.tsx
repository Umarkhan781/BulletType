import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Practice — Free WPM Training",
  description:
    "Practice typing online for free. Improve speed and accuracy with focused word drills, lessons, and no timer pressure.",
  alternates: { canonical: "/practice" },
  openGraph: {
    title: "Typing Practice — Free WPM Training | BulletType",
    description:
      "Practice typing online for free. Improve speed and accuracy with focused drills.",
    url: "/practice",
  },
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
