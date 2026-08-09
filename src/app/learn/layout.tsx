import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Touch Typing — Free Lessons",
  description:
    "Learn touch typing step by step: home row, top row, numbers, symbols, sentences, and code. Free guided typing lessons.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Learn Touch Typing — Free Lessons | BulletType",
    description:
      "Step-by-step touch typing lessons from beginner home row to advanced code typing.",
    url: "/learn",
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
