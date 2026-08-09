import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login or Sign Up",
  description: "Log in or create a free BulletType account to save progress and stats.",
  alternates: { canonical: "/login" },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
