"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Settings } from "lucide-react";
import { TypingTest } from "@/components/typing/TypingTest";
import { cn } from "@/lib/utils";
import {
  COOKIE_CONSENT_EVENT,
  saveTypingPrefs,
  type ExpertDifficultyPref,
  type PracticeMode,
  type PracticeTypingPrefs,
  type WordsDifficultyPref,
} from "@/lib/cookies";

const WORD_PRESETS = [10, 15, 20, 30] as const;
const TIME_PRESETS = [15, 30, 60, 120] as const;

function clampInt(raw: string, min: number, max: number, fallback: number) {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function presetTime(value: number) {
  return TIME_PRESETS.includes(value as (typeof TIME_PRESETS)[number])
    ? value
    : 15;
}

function presetWords(value: number) {
  return WORD_PRESETS.includes(value as (typeof WORD_PRESETS)[number])
    ? value
    : 15;
}

function OptionControl({
  active,
  onClick,
  children,
  title,
  ariaPressed,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
  ariaPressed?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={ariaPressed ?? active}
      onClick={(e) => {
        onClick();
        e.currentTarget.blur();
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        active
          ? "text-[var(--primary)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      )}
    >
      {children}
    </button>
  );
}

export function PracticeContent({
  initialPrefs,
}: {
  initialPrefs: PracticeTypingPrefs | null;
}) {
  const searchParams = useSearchParams();
  const lesson = searchParams.get("lesson") || "words";

  const lessonDifficulty =
    lesson === "home-row" || lesson === "top-row" || lesson === "bottom-row"
      ? "beginner"
      : lesson === "code" || lesson === "paragraphs"
        ? "expert"
        : "intermediate";

  const [limitMode, setLimitMode] = useState<PracticeMode>(
    initialPrefs?.mode ?? "words"
  );
  const [wordsDifficulty, setWordsDifficulty] = useState<WordsDifficultyPref>(
    initialPrefs?.wordsDifficulty ?? "regular"
  );
  const [wordPreset, setWordPreset] = useState(
    presetWords(initialPrefs?.wordCount ?? 15)
  );
  const [customWordsApplied, setCustomWordsApplied] = useState(
    Math.min(300, Math.max(1, initialPrefs?.customWords ?? 25))
  );
  const [customWordsDraft, setCustomWordsDraft] = useState(
    String(Math.min(300, Math.max(1, initialPrefs?.customWords ?? 25)))
  );
  const [timePreset, setTimePreset] = useState(
    presetTime(initialPrefs?.timeValue ?? 15)
  );
  const [customSecondsApplied, setCustomSecondsApplied] = useState(
    Math.min(600, Math.max(5, initialPrefs?.customSeconds ?? 45))
  );
  const [customSecondsDraft, setCustomSecondsDraft] = useState(
    String(Math.min(600, Math.max(5, initialPrefs?.customSeconds ?? 45)))
  );
  const [customKind, setCustomKind] = useState<"time" | "words">(
    initialPrefs?.customKind ?? "time"
  );
  const [expert, setExpert] = useState(initialPrefs?.expert ?? false);
  const [punctuation, setPunctuation] = useState(
    initialPrefs?.expert ? true : (initialPrefs?.punctuation ?? false)
  );
  const [numbers, setNumbers] = useState(
    initialPrefs?.expert ? true : (initialPrefs?.numbers ?? false)
  );
  const [expertDifficulty, setExpertDifficulty] =
    useState<ExpertDifficultyPref>(initialPrefs?.expertDifficulty ?? "normal");
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "finished">(
    "idle"
  );
  const showOptions = testStatus !== "finished";

  const currentPrefs = (): PracticeTypingPrefs => ({
    mode: limitMode,
    timeValue: timePreset,
    wordCount: wordPreset,
    wordsDifficulty,
    punctuation,
    numbers,
    expert,
    expertDifficulty,
    customSeconds: customSecondsApplied,
    customWords: customWordsApplied,
    customKind,
  });

  useEffect(() => {
    saveTypingPrefs(currentPrefs());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    limitMode,
    timePreset,
    wordPreset,
    wordsDifficulty,
    punctuation,
    numbers,
    expert,
    expertDifficulty,
    customSecondsApplied,
    customWordsApplied,
    customKind,
  ]);

  useEffect(() => {
    const onConsent = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (value === "allow") {
        saveTypingPrefs(currentPrefs());
      }
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    limitMode,
    timePreset,
    wordPreset,
    wordsDifficulty,
    punctuation,
    numbers,
    expert,
    expertDifficulty,
    customSecondsApplied,
    customWordsApplied,
    customKind,
  ]);

  const wordCount = useMemo(() => {
    if (limitMode === "custom" && customKind === "words") {
      return Math.min(300, Math.max(1, customWordsApplied));
    }
    return wordPreset;
  }, [limitMode, customKind, customWordsApplied, wordPreset]);

  const timerSeconds = useMemo(() => {
    if (limitMode === "custom" && customKind === "time") {
      return Math.min(600, Math.max(5, customSecondsApplied));
    }
    return timePreset;
  }, [limitMode, customKind, customSecondsApplied, timePreset]);

  const testMode: "words" | "time" =
    limitMode === "words" ||
    limitMode === "quote" ||
    (limitMode === "custom" && customKind === "words")
      ? "words"
      : "time";

  const difficulty = expert ? "expert" : lessonDifficulty;

  const testKey = [
    lesson,
    limitMode,
    testMode,
    difficulty,
    testMode === "words" ? `w${wordCount}` : `t${timerSeconds}`,
    punctuation ? "p" : "",
    numbers ? "n" : "",
    expert ? "x" : "",
    expert ? expertDifficulty : "",
    limitMode === "words" ? wordsDifficulty : "",
    limitMode === "quote" ? "quote" : "",
  ].join("-");

  const applyCustomWords = () => {
    const next = clampInt(customWordsDraft, 1, 300, customWordsApplied);
    setCustomWordsApplied(next);
    setCustomWordsDraft(String(next));
  };

  const applyCustomSeconds = () => {
    const next = clampInt(customSecondsDraft, 5, 600, customSecondsApplied);
    setCustomSecondsApplied(next);
    setCustomSecondsDraft(String(next));
  };

  return (
    <div className="mx-auto flex w-[92%] max-w-[110rem] flex-1 flex-col px-3 pt-6 pb-0 sm:px-4 sm:pt-8">
      {showOptions && (
        <div
          className="mb-6 flex flex-col items-center gap-2"
          data-typing-options=""
        >
          <div className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1 font-mono">
            <OptionControl
              active={punctuation}
              ariaPressed={punctuation}
              title="Include punctuation"
              onClick={() => {
                if (expert) return;
                setPunctuation((v) => !v);
              }}
            >
              Punctuation
            </OptionControl>
            <OptionControl
              active={numbers}
              ariaPressed={numbers}
              title="Include numbers"
              onClick={() => {
                if (expert) return;
                setNumbers((v) => !v);
              }}
            >
              Numbers
            </OptionControl>
            <OptionControl
              active={expert}
              ariaPressed={expert}
              title="Expert word set"
              onClick={() => {
                setExpert((on) => {
                  const next = !on;
                  setPunctuation(next);
                  setNumbers(next);
                  if (next && limitMode === "quote") setLimitMode("words");
                  return next;
                });
              }}
            >
              Expert
            </OptionControl>

            <span
              className="mx-1 hidden h-3.5 w-px bg-[var(--border)] sm:block"
              aria-hidden="true"
            />

            <OptionControl
              active={limitMode === "time"}
              onClick={() => setLimitMode("time")}
            >
              Time
            </OptionControl>
            <OptionControl
              active={limitMode === "words"}
              onClick={() => setLimitMode("words")}
            >
              Words
            </OptionControl>
            <OptionControl
              active={limitMode === "quote"}
              title="Publication-style paragraph"
              onClick={() => {
                if (expert) {
                  setExpert(false);
                  setPunctuation(false);
                  setNumbers(false);
                }
                setLimitMode("quote");
              }}
            >
              Quote
            </OptionControl>
            <OptionControl
              active={limitMode === "custom"}
              title="Custom test settings"
              onClick={() => setLimitMode("custom")}
            >
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
              Custom
            </OptionControl>

            {limitMode === "time" && (
              <>
                <span
                  className="mx-1 hidden h-3.5 w-px bg-[var(--border)] sm:block"
                  aria-hidden="true"
                />
                {TIME_PRESETS.map((sec) => (
                  <OptionControl
                    key={sec}
                    active={timePreset === sec}
                    onClick={() => setTimePreset(sec)}
                  >
                    {sec}
                  </OptionControl>
                ))}
              </>
            )}

            {limitMode === "words" && (
              <>
                <span
                  className="mx-1 hidden h-3.5 w-px bg-[var(--border)] sm:block"
                  aria-hidden="true"
                />
                {(["small", "regular", "thick"] as const).map((level) => (
                  <OptionControl
                    key={level}
                    active={wordsDifficulty === level}
                    onClick={() => setWordsDifficulty(level)}
                    title={`${level[0]!.toUpperCase()}${level.slice(1)} word set`}
                  >
                    {level[0]!.toUpperCase() + level.slice(1)}
                  </OptionControl>
                ))}
              </>
            )}
          </div>

          {expert && (
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 font-mono text-[13px]">
              {(["normal", "hard", "extreme"] as const).map((level, index) => (
                <span key={level} className="inline-flex items-center gap-1">
                  {index > 0 && (
                    <span
                      className="px-0.5 text-[var(--muted-foreground)]/50"
                      aria-hidden="true"
                    >
                      •
                    </span>
                  )}
                  <OptionControl
                    active={expertDifficulty === level}
                    onClick={() => setExpertDifficulty(level)}
                    title={`${level[0]!.toUpperCase()}${level.slice(1)} expert text`}
                  >
                    {level[0]!.toUpperCase() + level.slice(1)}
                  </OptionControl>
                </span>
              ))}
            </div>
          )}

          {limitMode === "custom" && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[13px]">
              <OptionControl
                active={customKind === "time"}
                onClick={() => setCustomKind("time")}
              >
                Time
              </OptionControl>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customSecondsDraft}
                disabled={customKind !== "time"}
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
                onBlur={applyCustomSeconds}
                onClick={(e) => e.stopPropagation()}
                placeholder="sec"
                title="Type seconds, then press Enter"
                aria-label="Custom time in seconds"
                className="h-7 w-14 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-center text-xs tabular-nums text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-40"
              />
              <span className="text-[11px] text-zinc-500">sec</span>

              <span
                className="hidden h-3.5 w-px bg-[var(--border)] sm:block"
                aria-hidden="true"
              />

              <OptionControl
                active={customKind === "words"}
                onClick={() => setCustomKind("words")}
              >
                Words
              </OptionControl>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customWordsDraft}
                disabled={customKind !== "words"}
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
                onBlur={applyCustomWords}
                onClick={(e) => e.stopPropagation()}
                placeholder="words"
                title="Type a number, then press Enter"
                aria-label="Custom word count"
                className="h-7 w-14 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-center text-xs tabular-nums text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-40"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <TypingTest
          key={testKey}
          mode={difficulty}
          testMode={testMode}
          wordCount={wordCount}
          initialTimer={timerSeconds}
          punctuation={punctuation}
          numbers={numbers}
          expertLevel={expert ? expertDifficulty : undefined}
          wordsDifficulty={wordsDifficulty}
          contentKind={limitMode === "quote" && !expert ? "quote" : "words"}
          lockCommittedWords={expert}
          showTimerControls={false}
          onStatusChange={setTestStatus}
        />
      </div>
    </div>
  );
}
