"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { daysAgoISO, monthsAgoISO } from "@/lib/visits";
import {
  countRealtimeActiveUsers,
  ONLINE_WINDOW_MS,
} from "@/lib/presence";
import {
  fetchRecentActions,
  formatActionLabel,
  type UserActionRow,
} from "@/lib/activity";
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
  UserRound,
  History,
  MapPin,
  Mail,
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
  uniqueVisitorsLast30Days: number;
  uniqueVisitorsLast12Months: number;
  activeUsers: number;
}

type VisitRow = {
  user_id?: string | null;
  visitor_id?: string | null;
};

/** One key per person: prefer logged-in user_id, else browser visitor_id */
function personKey(row: VisitRow): string | null {
  if (row.user_id) return `u:${row.user_id}`;
  if (row.visitor_id) return `v:${row.visitor_id}`;
  return null;
}

function countUniquePersons(rows: VisitRow[]): number {
  const keys = new Set<string>();
  for (const row of rows) {
    const key = personKey(row);
    if (key) keys.add(key);
  }
  return keys.size;
}

async function fetchVisitRowsSince(sinceISO: string): Promise<{
  rows: VisitRow[];
  totalCount: number;
  error?: string;
}> {
  // Prefer visited_at; fall back to created_at if needed
  let query = await supabase
    .from("user_visits")
    .select("user_id, visitor_id")
    .gte("visited_at", sinceISO)
    .limit(10000);

  if (query.error) {
    query = await supabase
      .from("user_visits")
      .select("user_id, visitor_id")
      .gte("created_at", sinceISO)
      .limit(10000);
  }

  if (query.error) {
    return {
      rows: [],
      totalCount: 0,
      error: query.error.message || "user_visits unavailable",
    };
  }

  const rows = (query.data || []) as VisitRow[];

  // Exact total row count (may be higher than limit used for unique set)
  let totalCount = rows.length;
  const head = await supabase
    .from("user_visits")
    .select("*", { count: "exact", head: true })
    .gte("visited_at", sinceISO);

  if (!head.error && typeof head.count === "number") {
    totalCount = head.count;
  } else {
    const altHead = await supabase
      .from("user_visits")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sinceISO);
    if (!altHead.error && typeof altHead.count === "number") {
      totalCount = altHead.count;
    }
  }

  return { rows, totalCount };
}

export default function AdminPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [actions, setActions] = useState<UserActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [presenceWarning, setPresenceWarning] = useState<string | null>(null);
  const [actionsWarning, setActionsWarning] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalTests: 0,
    averageWpm: 0,
    highestWpm: 0,
    totalUsers: 0,
    visitsLast30Days: 0,
    visitsLast12Months: 0,
    uniqueVisitorsLast30Days: 0,
    uniqueVisitorsLast12Months: 0,
    activeUsers: 0,
  });

  // Load dashboard once; poll realtime active users separately
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setSetupWarning(null);
      setActionsWarning(null);

      const { data: resultsData } = await supabase
        .from("results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const [v30, v12, online, recentActions] = await Promise.all([
        fetchVisitRowsSince(daysAgoISO(30)),
        fetchVisitRowsSince(monthsAgoISO(12)),
        countRealtimeActiveUsers(),
        fetchRecentActions(100),
      ]);

      if (v30.error || v12.error) {
        setSetupWarning(
          v30.error ||
            v12.error ||
            "Visit table missing. Run supabase/admin-analytics.sql in Supabase SQL Editor."
        );
      }

      if (online.source !== "site_presence" && online.error) {
        setPresenceWarning(
          "Realtime presence table missing or limited. Run supabase/fix-site-presence.sql for accurate live Active Users (admin page does not count itself)."
        );
      } else {
        setPresenceWarning(null);
      }

      if (recentActions.error) {
        setActionsWarning(
          `${recentActions.error} — Run supabase/fix-user-actions.sql in Supabase SQL Editor.`
        );
      } else {
        setActionsWarning(null);
      }

      setActions(recentActions.rows);

      const rows = resultsData || [];
      setResults(rows);

      // Prefer real results table; fall back to test_complete actions for WPM cards
      const testActions = recentActions.rows.filter(
        (a) => a.action_type === "test_complete"
      );
      let totalTests = rows.length;
      let highestWpm = Math.max(...rows.map((r) => r.wpm), 0);
      let averageWpm =
        totalTests > 0
          ? Math.round(rows.reduce((sum, r) => sum + r.wpm, 0) / totalTests)
          : 0;

      if (totalTests === 0 && testActions.length > 0) {
        const wpms = testActions
          .map((a) => {
            const m = a.details?.match(/(\d+)\s*WPM/i);
            return m ? Number(m[1]) : 0;
          })
          .filter((n) => n > 0);
        totalTests = testActions.length;
        highestWpm = Math.max(...wpms, 0);
        averageWpm =
          wpms.length > 0
            ? Math.round(wpms.reduce((s, n) => s + n, 0) / wpms.length)
            : 0;
      }

      setStats({
        totalTests,
        averageWpm,
        highestWpm,
        totalUsers: userCount || 0,
        visitsLast30Days: v30.totalCount,
        visitsLast12Months: v12.totalCount,
        uniqueVisitorsLast30Days: countUniquePersons(v30.rows),
        uniqueVisitorsLast12Months: countUniquePersons(v12.rows),
        activeUsers: online.count,
      });

      setLoading(false);
    }

    loadData();
  }, []);

  // Refresh live Active Users + Recent Actions every 15s
  useEffect(() => {
    let cancelled = false;

    const refreshLive = async () => {
      const [online, recentActions] = await Promise.all([
        countRealtimeActiveUsers(),
        fetchRecentActions(100),
      ]);
      if (cancelled) return;
      setStats((s) => ({ ...s, activeUsers: online.count }));
      if (!recentActions.error) {
        setActions(recentActions.rows);
        setActionsWarning(null);
      }
      if (online.source !== "site_presence" && online.error) {
        setPresenceWarning(
          "Realtime presence table missing or limited. Run supabase/fix-site-presence.sql for accurate live Active Users (admin page does not count itself)."
        );
      } else {
        setPresenceWarning(null);
      }
    };

    const id = window.setInterval(refreshLive, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
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
      label: "Registered Users",
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
      hint: "Total visit records (same person can appear more than once)",
    },
    {
      label: "Unique Visitors (30 Days)",
      value: stats.uniqueVisitorsLast30Days,
      icon: UserRound,
      color: "text-teal-400",
      hint: "Different people only — same person counted once",
    },
    {
      label: "Visits (Last 12 Months)",
      value: stats.visitsLast12Months,
      icon: CalendarRange,
      color: "text-sky-400",
      hint: "Total visit records in the past 12 months",
    },
    {
      label: "Unique Visitors (12 Months)",
      value: stats.uniqueVisitorsLast12Months,
      icon: Users,
      color: "text-indigo-400",
      hint: "Different people only — same person counted once",
    },
    {
      label: "Active Users (Live)",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-emerald-400",
      hint: `People on the site right now (last ${Math.round(
        ONLINE_WINDOW_MS / 1000
      )}s). Admin page does not count. Not unique visits.`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
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

      {presenceWarning && (
        <div className="mb-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-sm text-sky-100/90">
            <p className="font-medium text-sky-300 mb-1">
              Live Active Users needs a small setup
            </p>
            <p className="text-sky-200/80">{presenceWarning}</p>
            <p className="mt-2 text-sky-200/70">
              Supabase → SQL Editor → run{" "}
              <code className="text-sky-100">supabase/fix-site-presence.sql</code>
            </p>
          </div>
        </div>
      )}

      {actionsWarning && (
        <div className="mb-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
          <div className="text-sm text-violet-100/90">
            <p className="font-medium text-violet-300 mb-1">
              Recent Actions needs setup
            </p>
            <p className="text-violet-200/80">{actionsWarning}</p>
            <p className="mt-2 text-violet-200/70">
              Supabase → SQL Editor → run{" "}
              <code className="text-violet-100">supabase/fix-user-actions.sql</code>
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
        Traffic
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
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
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-violet-400" />
        Recent Actions
      </h2>

      {actions.length === 0 ? (
        <p className="text-zinc-500">No actions yet.</p>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Details</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Date & time</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => {
                const isGuest = !a.user_id;
                const name =
                  a.display_name ||
                  a.username ||
                  (isGuest ? "Guest" : "User");
                const avatar =
                  a.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    a.user_id || a.visitor_id || String(a.id)
                  )}`;
                const when = new Date(a.occurred_at);
                return (
                  <tr
                    key={a.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatar}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover bg-white/10 shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-100 truncate">
                            {name}
                            {a.username ? (
                              <span className="text-zinc-500 font-normal">
                                {" "}
                                @{a.username}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                            {a.email ? (
                              <>
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{a.email}</span>
                              </>
                            ) : (
                              <span className="text-zinc-600">
                                {isGuest ? "Guest · no email" : "No email"}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] uppercase tracking-wide text-zinc-600 mt-0.5">
                            {isGuest ? "Guest" : "Registered"}
                            {a.path ? ` · ${a.path}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-xs text-violet-300">
                        {formatActionLabel(a.action_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-[200px]">
                      <span className="line-clamp-2">{a.details || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-[180px]">
                      {a.location_label ? (
                        <span className="inline-flex items-start gap-1 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            {a.location_label}
                            {a.latitude != null && a.longitude != null ? (
                              <span className="block text-[10px] text-zinc-600 font-mono">
                                {a.latitude.toFixed(3)}, {a.longitude.toFixed(3)}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-600">
                          Not shared
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                      <div>{when.toLocaleDateString()}</div>
                      <div className="text-xs font-mono text-zinc-600">
                        {when.toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Keep raw test rows available under the fold if results table has data */}
      {results.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-3 text-zinc-400">
            Recent test scores (raw)
          </h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden opacity-90">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-zinc-500">
                <tr>
                  <th className="text-left px-4 py-2">WPM</th>
                  <th className="text-left px-4 py-2">Accuracy</th>
                  <th className="text-left px-4 py-2">Mode</th>
                  <th className="text-left px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 15).map((r) => (
                  <tr key={r.id} className="border-t border-white/5">
                    <td className="px-4 py-2 font-mono text-blue-400">{r.wpm}</td>
                    <td className="px-4 py-2">{r.accuracy}%</td>
                    <td className="px-4 py-2 capitalize">{r.mode}</td>
                    <td className="px-4 py-2 text-zinc-500">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
