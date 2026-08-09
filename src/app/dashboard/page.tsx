"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
// motion optional
import {
  Activity,
  Target,
  Clock,
  Flame,
  Award,
  TrendingUp,
  Zap,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, recentTests, logout } = useUserStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-zinc-500">Please log in to view your dashboard.</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Tests", value: user.totalTests, icon: Activity, color: "text-blue-400" },
    { label: "Practice Time", value: `${user.practiceTime}m`, icon: Clock, color: "text-cyan-400" },
    { label: "Avg WPM", value: user.averageWpm, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Highest WPM", value: user.highestWpm, icon: Zap, color: "text-amber-400" },
    { label: "Accuracy", value: `${user.accuracy}%`, icon: Target, color: "text-violet-400" },
    { label: "XP / Level", value: `${user.xp} / ${user.level}`, icon: Award, color: "text-pink-400" },
    { label: "Daily Streak", value: user.dailyStreak, icon: Flame, color: "text-orange-400" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-zinc-500">
            Welcome back, {user.name}
            {user.username ? (
              <span className="text-zinc-600"> (@{user.username})</span>
            ) : null}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2 self-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
             
             
             
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">{s.label}</span>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className={`mt-2 text-2xl font-bold font-mono ${s.color}`}>
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Tests</h2>
          {recentTests.length === 0 ? (
            <p className="text-sm text-zinc-500">No tests yet. Go type something!</p>
          ) : (
            <div className="space-y-3">
              {recentTests.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                >
                  <div>
                    <div className="font-medium capitalize">{t.mode}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(t.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-blue-400">{t.wpm} WPM</div>
                    <div className="text-xs text-zinc-500">{t.accuracy}% acc</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {user.achievements.length === 0 ? (
              <p className="text-sm text-zinc-500">Complete tests to unlock badges.</p>
            ) : (
              user.achievements.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm text-amber-400"
                >
                  <Award className="h-3.5 w-3.5" />
                  {a}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
