"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { setUser } = useUserStore();
  const router = useRouter();

  const handleDemoLogin = () => {
    // Already has mock user in store; just ensure authenticated
    setUser({
      id: "user-1",
      username: "speedtyper",
      name: "Alex Chen",
      email: "alex@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      bio: "Chasing 150 WPM 🚀",
      country: "US",
      xp: 2450,
      level: 12,
      totalTests: 87,
      practiceTime: 340,
      averageWpm: 78,
      highestWpm: 112,
      accuracy: 96.4,
      dailyStreak: 5,
      badges: ["first-test", "50-wpm", "75-wpm", "7-day-streak"],
      achievements: ["First Test", "50 WPM", "75 WPM", "7-Day Streak"],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    });
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="glass rounded-3xl p-8 sm:p-10 text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-zinc-500 mb-8">Sign in to track your progress</p>

        <div className="space-y-3">
          <Button className="w-full" variant="outline" onClick={handleDemoLogin}>
            Continue with Google
          </Button>
          <Button className="w-full" variant="outline" onClick={handleDemoLogin}>
            Continue with GitHub
          </Button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-950 px-2 text-zinc-500">or</span>
            </div>
          </div>
          <Button className="w-full" onClick={handleDemoLogin}>
            Demo Login (Guest)
          </Button>
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
