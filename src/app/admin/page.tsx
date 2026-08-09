"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { daysAgoISO, monthsAgoISO } from "@/lib/visits";
import {
  Activity,
  CalendarDays,
  CalendarRange,
  Users,
  Target,
  Zap,
  TrendingUp,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

interface Result {
  id: number;
  wpm: number;
  accuracy: number;
  time_taken: number;
  mode: string;
  created_at: string;
  user_id: string | null;
}

interface AdminStats {
  totalTests: number;
  averageWpm: number;
  highestWpm: number;
  totalUsers: number;
  visitsLast30Days: number;
  visitsLast12Months: number;
  activeUsers: number;
}

async function countVisitsSince(sinceISO: string): Promise<{
  count: number;
  error?: string;
}> {
  const visits = await supabase
    .from("user_visits")
    .select("*", { count: "exact", head: true })
    .gte("visited_at", sinceISO);

  if (!visits.error) {
    return { count: visits.count || 0 };
  }

  // Fallback column name
  const alt = await supabase
    .from("user_visits")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sinceISO);

  if (!alt.error) {
    return { count: alt.count || 0 };
  }

  return {
    count: 0,
    error: visits.error.message || alt.error?.message || "user_visits unavailable",
  };
}

async function countActiveUsers(): Promise<number> {
  const since = daysAgoISO(7);

  const bySeen = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("last_seen_at", since);

  if (!bySeen.error && typeof bySeen.count === "number") {
    return bySeen.count;
  }

  const byVisits = await supabase
    .from("user_visits")
    .select("user_id, visitor_id")
    .gte("visited_at", since)
    .limit(5000);

  if (!byVisits.error && byVisits.data) {
    const keys = new Set<string>();
    for (const row of byVisits.data) {
      if (row.user_id) keys.add(`u:${row.user_id}`);
      else if (row.visitor_id) keys.add(`v:${row.visitor_id}`);
    }
    return keys.size;
  }

  const byResults = await supabase
    .from("results")
    .select("user_id")
    .gte("created_at", since);

  if (!byResults.error && byResults.data) {
    return new Set(byResults.data.map((r) => r.user_id).filter(Boolean)).size;
  }

  return 0;
}

export default function AdminPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalTests: 0,
    averageWpm: 0,
    highestWpm: 0,
    totalUsers: 0,
    visitsLast30Days: 0,
    visitsLast12Months: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setSetupWarning(null);

      const { data: resultsData } = await supabase
        .from("results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const [v30, v12, activeUsers] = await Promise.all([
        countVisitsSince(daysAgoISO(30)),
        countVisitsSince(monthsAgoISO(12)),
        countActiveUsers(),
      ]);

      if (v30.error || v12.error) {
        setSetupWarning(
          v30.error ||
            v12.error ||
            "Visit table missing. Run supabase/admin-analytics.sql in Supabase SQL Editor."
        );
      }

      const rows = resultsData || [];
      setResults(rows);

      const totalTests = rows.length;
      const highestWpm = Math.max(...rows.map((r) => r.wpm), 0);
      const averageWpm =
        totalTests > 0
          ? Math.round(rows.reduce((sum, r) => sum + r.wpm, 0) / totalTests)
          : 0;

      setStats({
        totalTests,
        averageWpm,
        highestWpm,
        totalUsers: userCount || 0,
        visitsLast30Days: v30.count,
        visitsLast12Months: v12.count,
        activeUsers,
      });

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400">Loading admin data...</p>
      </div>
    );
  }

  const overviewCards = [
    {
      label: "Total Tests",
      value: stats.totalTests,
      icon: Activity,
      color: "text-blue-400",
    },
    {
      label: "Average WPM",
      value: stats.averageWpm,
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "Highest WPM",
      value: stats.highestWpm,
      icon: Zap,
      color: "text-amber-400",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-400",
    },
  ];

  const trafficCards = [
    {
      label: "Visits (Last 30 Days)",
      value: stats.visitsLast30Days,
      icon: CalendarDays,
      color: "text-cyan-400",
      hint: "Site visits in the past 30 days (guest + logged-in)",
    },
    {
      label: "Visits (Last 12 Months)",
      value: stats.visitsLast12Months,
      icon: CalendarRange,
      color: "text-sky-400",
      hint: "Site visits in the past 12 months",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-emerald-400",
      hint: "Users active in the last 7 days",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-zinc-500 mb-8 text-sm">
        Overview of tests, users, and traffic
      </p>

      {setupWarning && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-100/90">
            <p className="font-medium text-amber-300 mb-1">
              Visit tracking is not set up in Supabase
            </p>
            <p className="text-amber-200/80">
              {setupWarning}
            </p>
            <p className="mt-2 text-amber-200/70">
              Open Supabase → SQL Editor → run{" "}
              <code className="text-amber-100">supabase/admin-analytics.sql</code>
              , then visit the site again (phone or PC) and refresh this page.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-white/5 border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">{card.label}</span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-blue-400" />
        User visits & activity
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {trafficCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-white/5 border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">{card.label}</span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className={`text-3xl font-bold font-mono ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-zinc-500 mt-2">{card.hint}</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Tests</h2>

      {results.length === 0 ? (
        <p className="text-zinc-500">No tests recorded yet.</p>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="text-left px-4 py-3">WPM</th>
                <th className="text-left px-4 py-3">Accuracy</th>
                <th className="text-left px-4 py-3">Mode</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-mono text-blue-400">{r.wpm}</td>
                  <td className="px-4 py-3">{r.accuracy}%</td>
                  <td className="px-4 py-3 capitalize">{r.mode}</td>
                  <td className="px-4 py-3">{r.time_taken}s</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
