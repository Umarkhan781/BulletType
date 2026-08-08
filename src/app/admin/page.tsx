"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Result {
  id: number;
  wpm: number;
  accuracy: number;
  time_taken: number;
  mode: string;
  created_at: string;
  user_id: string | null;
}

export default function AdminPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageWpm: 0,
    highestWpm: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Get all results
      const { data: resultsData } = await supabase
        .from("results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      // Get total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (resultsData) {
        setResults(resultsData);

        const totalTests = resultsData.length;
        const highestWpm = Math.max(...resultsData.map((r) => r.wpm), 0);
        const averageWpm =
          totalTests > 0
            ? Math.round(
                resultsData.reduce((sum, r) => sum + r.wpm, 0) / totalTests
              )
            : 0;

        setStats({
          totalTests,
          averageWpm,
          highestWpm,
          totalUsers: userCount || 0,
        });
      }

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
          <div className="text-3xl font-bold text-blue-400">{stats.totalTests}</div>
          <div className="text-sm text-zinc-400 mt-1">Total Tests</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
          <div className="text-3xl font-bold text-green-400">{stats.averageWpm}</div>
          <div className="text-sm text-zinc-400 mt-1">Average WPM</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
          <div className="text-3xl font-bold text-amber-400">{stats.highestWpm}</div>
          <div className="text-sm text-zinc-400 mt-1">Highest WPM</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
          <div className="text-3xl font-bold text-purple-400">{stats.totalUsers}</div>
          <div className="text-sm text-zinc-400 mt-1">Total Users</div>
        </div>
      </div>

      {/* Recent Results */}
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
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
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