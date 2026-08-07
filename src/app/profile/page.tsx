"use client";

import { useUserStore } from "@/store/useUserStore";
import { Award, MapPin, Calendar, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, recentTests } = useUserStore();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-zinc-500 mb-4">You are not logged in.</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="glass rounded-3xl p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user.avatar}
            alt={user.username}
            className="h-24 w-24 rounded-full border-4 border-blue-500/30"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-zinc-500">@{user.username}</p>
            {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-zinc-500">
              {user.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {user.country}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" /> Level {user.level}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Tests", value: user.totalTests },
            { label: "Avg WPM", value: user.averageWpm },
            { label: "Best WPM", value: user.highestWpm },
            { label: "Accuracy", value: `${user.accuracy}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xl font-bold font-mono text-blue-400">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" /> Achievements
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.achievements.map((a) => (
              <span
                key={a}
                className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm text-amber-400"
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Recent Tests</h2>
          {recentTests.length === 0 ? (
            <p className="text-sm text-zinc-500">No recent tests.</p>
          ) : (
            <div className="space-y-2">
              {recentTests.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between rounded-xl bg-white/5 px-4 py-3 text-sm"
                >
                  <span className="capitalize">{t.mode}</span>
                  <span className="font-mono text-blue-400">{t.wpm} WPM · {t.accuracy}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
