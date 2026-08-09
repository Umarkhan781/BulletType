import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Leaderboard — Top WPM Scores",
  description:
    "See top typing speeds on BulletType. Compare WPM, accuracy, and climb the leaderboard.",
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    title: "Typing Leaderboard — Top WPM Scores | BulletType",
    description: "Compare typing speeds and accuracy on the BulletType leaderboard.",
    url: "/leaderboard",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
