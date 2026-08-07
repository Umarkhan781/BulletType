"use client";

import Link from "next/link";
// motion optional
import {
  Keyboard,
  BookOpen,
  Zap,
  Trophy,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  Target,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";

const features = [
  {
    icon: BookOpen,
    title: "Structured Learning",
    description: "Home row → Top row → Full keyboard with guided lessons and finger placement.",
  },
  {
    icon: Zap,
    title: "Expert Mode",
    description: "Timed tests with advanced metrics: WPM, CPM, consistency, backspaces & more.",
  },
  {
    icon: Users,
    title: "Multiplayer Races",
    description: "Create or join rooms, race friends in real-time with live rankings.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Dashboard with charts, heatmaps, streaks, XP, badges and certificates.",
  },
  {
    icon: Target,
    title: "Code Typing",
    description: "Practice HTML, CSS, JS, Python, SQL and more with real syntax.",
  },
  {
    icon: Trophy,
    title: "Leaderboards & Achievements",
    description: "Compete globally and unlock badges from 50 WPM to Code Master.",
  },
];

export default function HomePage() {
  const { user } = useUserStore();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-[300px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:pt-32">
        <div
         
         
         
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
            <Sparkles className="h-4 w-4" />
            Master touch typing the modern way
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Type faster.{" "}
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Learn smarter.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Structured lessons, advanced analytics, multiplayer races and a
            beautiful glass UI — everything you need to reach 100+ WPM.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/expert">
              <Button size="lg" className="gap-2 text-base">
                <Keyboard className="h-5 w-5" />
                Start Typing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/learn">
              <Button size="lg" variant="outline" className="gap-2 text-base">
                <BookOpen className="h-5 w-5" />
                Learn from Scratch
              </Button>
            </Link>
          </div>
        </div>

        <div
         
         
         
          className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="glass rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {user?.averageWpm ?? 0}
            </div>
            <div className="mt-1 text-sm text-zinc-500">Avg WPM</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {user?.highestWpm ?? 0}
            </div>
            <div className="mt-1 text-sm text-zinc-500">Best WPM</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-1 text-3xl font-bold text-amber-400">
              <Flame className="h-7 w-7" />
              {user?.dailyStreak ?? 0}
            </div>
            <div className="mt-1 text-sm text-zinc-500">Day Streak</div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need</h2>
          <p className="mt-3 text-zinc-500">
            From absolute beginner to competitive typer
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
               
               
               
               
                className="glass group rounded-2xl p-6 transition-all hover:border-blue-500/30 hover:bg-white/10"
              >
                <div className="mb-4 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400 group-hover:bg-blue-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 text-center">
        <div className="glass rounded-3xl p-10 sm:p-14">
          <h2 className="text-3xl font-bold">Ready to improve?</h2>
          <p className="mt-3 text-zinc-500">
            Take a 60-second test and see where you stand.
          </p>
          <Link href="/expert" className="mt-8 inline-block">
            <Button size="lg" className="gap-2">
              Take a Test Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
