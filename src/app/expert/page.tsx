"use client";

import { useMemo, useState } from "react";
import { TypingTest } from "@/components/typing/TypingTest";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExpertDifficulty } from "@/lib/words";

const WORD_PRESETS = [25, 50, 75, 100] as const;
const TIME_PRESETS = [30, 60, 90, 120] as const;

type LimitMode = "words" | "time";

function clampInt(raw: string, min: number, max: number, fallback: number) {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export default function ExpertPage() {
  const [limitMode, setLimitMode] = useState<LimitMode>("time");

  const [wordPreset, setWordPreset] = useState<number | "custom">(50);
  const [customWordsApplied, setCustomWordsApplied] = useState(80);
  const [customWordsDraft, setCustomWordsDraft] = useState("80");

  const [timePreset, setTimePreset] = useState<number | "custom">(60);
  const [customSecondsApplied, setCustomSecondsApplied] = useState(90);
  const [customSecondsDraft, setCustomSecondsDraft] = useState("90");

  const [punctuation, setPunctuation] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [expertDifficulty, setExpertDifficulty] =
    useState<ExpertDifficulty>("normal");
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "finished">(
    "idle"
  );
  const showOptions = testStatus !== "finished";

  const wordCount = useMemo(() => {
    if (wordPreset === "custom") {
      return Math.min(400, Math.max(10, customWordsApplied));
    }
    return wordPreset;
  }, [wordPreset, customWordsApplied]);

  const timerSeconds = useMemo(() => {
    if (timePreset === "custom") {
      return Math.min(900, Math.max(10, customSecondsApplied));
    }
    return timePreset;
  }, [timePreset, customSecondsApplied]);

  const testKey = [
    "expert",
    limitMode,
    limitMode === "words" ? `w${wordCount}` : `t${timerSeconds}`,
    punctuation ? "p" : "",
    numbers ? "n" : "",
    expertDifficulty,
  ].join("-");

  const blur = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
  };

  const applyCustomWords = () => {
    const next = clampInt(customWordsDraft, 10, 400, customWordsApplied);
    setCustomWordsApplied(next);
    setCustomWordsDraft(String(next));
  };

  const applyCustomSeconds = () => {
    const next = clampInt(customSecondsDraft, 10, 900, customSecondsApplied);
    setCustomSecondsApplied(next);
    setCustomSecondsDraft(String(next));
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
      {showOptions && (
      <div className="mb-8 flex flex-col items-center gap-2" data-typing-options="">
      <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
        <button
          type="button"
          aria-pressed="true"
          title="Expert word set"
          className="rounded-md px-2 py-1 text-[13px] font-medium text-[var(--primary)]"
        >
          Expert
        </button>
        <span className="mx-1 hidden h-3.5 w-px bg-[var(--border)] sm:block" aria-hidden="true" />
        <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-white/10 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={(e) => {
              setLimitMode("words");
              blur(e);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              limitMode === "words"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            words
          </button>
          <button
            type="button"
            onClick={(e) => {
              setLimitMode("time");
              blur(e);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              limitMode === "time"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            time
          </button>
        </div>

        <span className="mx-1 hidden h-4 w-px bg-zinc-200 dark:bg-white/10 sm:block" />

        {limitMode === "words" ? (
          <>
            {WORD_PRESETS.map((count) => (
              <Button
                key={count}
                type="button"
                size="sm"
                variant={wordPreset === count ? "default" : "ghost"}
                onClick={(e) => {
                  setWordPreset(count);
                  blur(e);
                }}
                className="h-8 px-2.5 text-xs"
              >
                {count}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant={wordPreset === "custom" ? "default" : "ghost"}
              onClick={(e) => {
                setWordPreset("custom");
                setCustomWordsDraft(String(customWordsApplied));
                blur(e);
              }}
              className="h-8 px-2.5 text-xs"
            >
              custom
            </Button>
            {wordPreset === "custom" && (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customWordsDraft}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setCustomWordsDraft(v);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyCustomWords();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter"
                title="Type a number, then press Enter"
                aria-label="Custom word count (press Enter to apply)"
                className="h-8 w-16 rounded-md border border-zinc-200 bg-white px-2 text-center text-xs tabular-nums text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
              />
            )}
          </>
        ) : (
          <>
            {TIME_PRESETS.map((sec) => (
              <Button
                key={sec}
                type="button"
                size="sm"
                variant={timePreset === sec ? "default" : "ghost"}
                onClick={(e) => {
                  setTimePreset(sec);
                  blur(e);
                }}
                className="h-8 px-2.5 text-xs"
              >
                {sec}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant={timePreset === "custom" ? "default" : "ghost"}
              onClick={(e) => {
                setTimePreset("custom");
                setCustomSecondsDraft(String(customSecondsApplied));
                blur(e);
              }}
              className="h-8 px-2.5 text-xs"
            >
              custom
            </Button>
            {timePreset === "custom" && (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customSecondsDraft}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setCustomSecondsDraft(v);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyCustomSeconds();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter"
                title="Type seconds, then press Enter"
                aria-label="Custom seconds (press Enter to apply)"
                className="h-8 w-16 rounded-md border border-zinc-200 bg-white px-2 text-center text-xs tabular-nums text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
              />
            )}
            <span className="text-[11px] text-zinc-400">sec</span>
          </>
        )}

        <span className="mx-1 hidden h-4 w-px bg-zinc-200 dark:bg-white/10 sm:block" />

        <Button
          type="button"
          size="sm"
          variant={punctuation ? "default" : "ghost"}
          onClick={(e) => {
            setPunctuation((v) => !v);
            blur(e);
          }}
          className="h-8 px-2.5 text-xs"
          title="Punctuation & symbols (@ # $ % & * …)"
        >
          punctuation
        </Button>
        <Button
          type="button"
          size="sm"
          variant={numbers ? "default" : "ghost"}
          onClick={(e) => {
            setNumbers((v) => !v);
            blur(e);
          }}
          className="h-8 px-2.5 text-xs"
          title="Numbers & hex / IP-style tokens"
        >
          numbers
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 font-mono text-[13px]">
        {(["normal", "hard", "extreme"] as const).map((level, index) => (
          <span key={level} className="inline-flex items-center gap-1">
            {index > 0 && (
              <span className="px-0.5 text-[var(--muted-foreground)]/50" aria-hidden="true">
                •
              </span>
            )}
            <button
              type="button"
              aria-pressed={expertDifficulty === level}
              onClick={(e) => {
                setExpertDifficulty(level);
                blur(e);
              }}
              className={cn(
                "rounded-md px-2 py-1 text-[13px] font-medium",
                expertDifficulty === level
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {level[0]!.toUpperCase() + level.slice(1)}
            </button>
          </span>
        ))}
      </div>
      </div>
      )}

      <TypingTest
        key={testKey}
        mode="expert"
        testMode={limitMode}
        wordCount={wordCount}
        initialTimer={timerSeconds}
        punctuation={punctuation}
        numbers={numbers}
        expertLevel={expertDifficulty}
        showTimerControls={false}
        onStatusChange={setTestStatus}
      />
    </div>
  );
}
