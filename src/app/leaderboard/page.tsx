"use client";

import { useState } from "react";
// motion optional
import { Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockLeaderboard = [
  { rank: 1, username: "nitro_typer", country: "JP", wpm: 168, accuracy: 99.2, xp: 12400 },
  { rank: 2, username: "keystroke_god", country: "KR", wpm: 155, accuracy: 98.7, xp: 11200 },
  { rank: 3, username: "speeddemon", country: "US", wpm: 142, accuracy: 97.1, xp: 9800 },
  { rank: 4, username: "typingfox", country: "DE", wpm: 131, accuracy: 98.4, xp: 8700 },
  { rank: 5, username: "flashfingers", country: "IN", wpm: 128, accuracy: 96.8, xp: 8100 },
  { rank: 6, username: "qwertyqueen", country: "CA", wpm: 124, accuracy: 99.0, xp: 7600 },
  { rank: 7, username: "codeblazer", country: "BR", wpm: 119, accuracy: 97.5, xp: 7200 },
  { rank: 8, username: "rapidfire", country: "UK", wpm: 115, accuracy: 98.1, xp: 6900 },
  { rank: 9, username: "pixelpusher", country: "AU", wpm: 112, accuracy: 96.3, xp: 6500 },
  { rank: 10, username: "speedtyper", country: "US", wpm: 112, accuracy: 96.4, xp: 2450 },
];

const filters = ["Daily", "Weekly", "Monthly", "All-Time"] as const;

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All-Time");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-amber-400" />
          Leaderboard
        </h1>
        <p className="mt-2 text-zinc-500">Top typists from around the world</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {filters.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-6 py-3 text-xs uppercase tracking-wider text-zinc-500 border-b border-white/5">
          <div className="col-span-1">#</div>
          <div className="col-span-4">User</div>
          <div className="col-span-2 text-right">WPM</div>
          <div className="col-span-2 text-right">Acc</div>
          <div className="col-span-3 text-right">XP</div>
        </div>

        {mockLeaderboard.map((entry, i) => (
          <div
            key={entry.username}
           
           
           
            className={cn(
              "grid grid-cols-12 gap-2 px-6 py-4 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors",
              entry.username === "speedtyper" && "bg-blue-500/10"
            )}
          >
            <div className="col-span-1 font-mono font-bold">
              {entry.rank <= 3 ? (
                <Medal
                  className={cn(
                    "h-5 w-5",
                    entry.rank === 1 && "text-amber-400",
                    entry.rank === 2 && "text-zinc-300",
                    entry.rank === 3 && "text-amber-700"
                  )}
                />
              ) : (
                entry.rank
              )}
            </div>
            <div className="col-span-4 flex items-center gap-2">
              <span className="font-medium">{entry.username}</span>
              <span className="text-xs text-zinc-500">{entry.country}</span>
            </div>
            <div className="col-span-2 text-right font-mono font-bold text-blue-400">
              {entry.wpm}
            </div>
            <div className="col-span-2 text-right font-mono text-emerald-400">
              {entry.accuracy}%
            </div>
            <div className="col-span-3 text-right font-mono text-zinc-400">
              {entry.xp.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
