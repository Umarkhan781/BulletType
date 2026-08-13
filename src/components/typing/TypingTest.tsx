"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  RotateCcw,
  Share2,
  Save,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  cn,
  calculateWPM,
  calculateCPM,
  calculateAccuracy,
  formatTime,
} from "@/lib/utils";
import {
  getExpertChallengeWords,
  getQuoteWords,
  getStyledWords,
} from "@/lib/words";
import type { ExpertDifficulty, WordsDifficulty } from "@/lib/words";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUserStore } from "@/store/useUserStore";
import type { Difficulty, TimerOption, TypingStats, TestResult } from "@/types";

function isTabKey(e: { key: string; code?: string }) {
  return e.key === "Tab" || e.code === "Tab";
}

function focusRestartButton() {
  const button = document.getElementById(
    "typing-restart-button"
  ) as HTMLButtonElement | null;
  button?.focus({ preventScroll: true });
}

/** Mounted only on the result screen so Tab cannot escape to footer Contact. */
function ResultsTabLock() {
  useLayoutEffect(() => {
    document.body.dataset.typingResults = "true";
    const onTab = (e: KeyboardEvent) => {
      if (!isTabKey(e)) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest("[data-site-dialog]")
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      focusRestartButton();
    };
    window.addEventListener("keydown", onTab, true);
    document.addEventListener("keydown", onTab, true);
    focusRestartButton();
    const t0 = window.setTimeout(focusRestartButton, 0);
    const t1 = window.setTimeout(focusRestartButton, 80);
    return () => {
      delete document.body.dataset.typingResults;
      window.removeEventListener("keydown", onTab, true);
      document.removeEventListener("keydown", onTab, true);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, []);
  return null;
}

interface TypingTestProps {
  mode?: Difficulty;
  initialTimer?: TimerOption | number;
  wordCount?: number;
  customText?: string;
  /** words = finish when text done; time = countdown timer */
  testMode?: "words" | "time";
  /** Override settings store when provided */
  punctuation?: boolean;
  numbers?: boolean;
  /** Expert practice difficulty (Normal / Hard / Extreme) */
  expertLevel?: ExpertDifficulty;
  /** Words-mode vocabulary: Small / Regular / Thick */
  wordsDifficulty?: WordsDifficulty;
  /** Quote mode uses original publication-style paragraphs */
  contentKind?: "words" | "quote";
  /** Expert: space commits a word and Backspace cannot return to it */
  lockCommittedWords?: boolean;
  /** Show built-in 15/30/60/120 timer chips (expert page) */
  showTimerControls?: boolean;
  onComplete?: (result: TestResult) => void;
  /** Notify parent so it can hide option bars on results-only view */
  onStatusChange?: (status: "idle" | "running" | "finished") => void;
}

interface LiveCounters {
  correctChars: number;
  totalChars: number;
  /** Wrong keypresses (missed / incorrect keys) */
  missKeys: number;
  /** Fully submitted words that did not match */
  wrongWords: number;
  backspaces: number;
  typedHistory: string[];
  currentWordIndex: number;
  input: string;
  startTime: number | null;
  wpmHistory: number[];
}

function ResultPerformanceChart({
  samples,
  errors,
}: {
  samples: number[];
  errors: number[];
}) {
  const values = samples.filter(
    (sample) => Number.isFinite(sample) && sample >= 0
  );
  const chartValues =
    values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const chartErrors =
    errors.length > 1 ? errors : [errors[0] ?? 0, errors[0] ?? 0];
  const peakWpm = Math.max(...chartValues, 0);
  const averageWpm = Math.round(
    chartValues.reduce((total, value) => total + value, 0) / chartValues.length
  );
  const chartWidth = 640;
  const chartHeight = 220;
  const padding = { top: 18, right: 18, bottom: 30, left: 38 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const maxWpm = Math.max(peakWpm, 10);
  const points = chartValues.map((value, index) => {
    const x =
      padding.left +
      (index / Math.max(chartValues.length - 1, 1)) * innerWidth;
    const y = padding.top + innerHeight - (value / maxWpm) * innerHeight;
    return { x, y };
  });
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaPath = [
    `M ${points[0].x} ${padding.top + innerHeight}`,
    ...points.map(({ x, y }) => `L ${x} ${y}`),
    `L ${points[points.length - 1].x} ${padding.top + innerHeight}`,
    "Z",
  ].join(" ");
  const lastPoint = points[points.length - 1];
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const activePoint = hoveredPoint == null ? null : points[hoveredPoint];
  const activeWpm =
    hoveredPoint == null ? 0 : Math.round(chartValues[hoveredPoint]);
  const activeBurst =
    hoveredPoint == null
      ? 0
      : Math.round(
          Math.max(
            ...chartValues.slice(Math.max(0, hoveredPoint - 2), hoveredPoint + 1)
          )
        );
  const activeErrors = hoveredPoint == null ? 0 : chartErrors[hoveredPoint] ?? 0;

  return (
    <section className="h-full rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-white/[0.02] to-cyan-500/10 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-400">
            Performance
          </p>
          <h3 className="mt-1 text-lg font-semibold">Speed over time</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <TrendingUp className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          <span>{peakWpm} WPM peak</span>
          <span className="text-zinc-600">·</span>
          <span>{averageWpm} WPM average</span>
        </div>
      </div>

      <div className="relative mt-5 overflow-visible rounded-lg bg-zinc-950/30 p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-52 w-full"
          role="img"
          aria-label="Words per minute performance chart"
          preserveAspectRatio="none"
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const progress = Math.min(
              1,
              Math.max(0, (event.clientX - bounds.left) / bounds.width)
            );
            setHoveredPoint(Math.round(progress * (points.length - 1)));
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="wpm-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((position) => {
            const y = padding.top + innerHeight * position;
            return (
              <line
                key={position}
                x1={padding.left}
                x2={chartWidth - padding.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                className="text-white"
              />
            );
          })}
          <path d={areaPath} fill="url(#wpm-area)" />
          <polyline
            points={linePoints}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="5"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="3"
          />
          {activePoint && (
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="5"
              fill="#0f172a"
              stroke="#facc15"
              strokeWidth="3"
            />
          )}
          <text
            x={padding.left}
            y={chartHeight - 8}
            fill="#71717a"
            fontSize="12"
          >
            Start
          </text>
          <text
            x={chartWidth - padding.right}
            y={chartHeight - 8}
            fill="#71717a"
            fontSize="12"
            textAnchor="end"
          >
            Finish
          </text>
          <text x="0" y={padding.top + 5} fill="#71717a" fontSize="12">
            {maxWpm}
          </text>
          <text
            x="0"
            y={padding.top + innerHeight + 5}
            fill="#71717a"
            fontSize="12"
          >
            0
          </text>
        </svg>
        {activePoint && hoveredPoint != null && (
          <div
            className="pointer-events-none absolute z-10 w-32 -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-xs shadow-xl"
            style={{
              left: `${Math.min(85, Math.max(15, (activePoint.x / chartWidth) * 100))}%`,
              top: `${Math.min(75, Math.max(25, (activePoint.y / chartHeight) * 100))}%`,
            }}
          >
            <p className="text-zinc-400">{hoveredPoint + 1}s</p>
            <p className="mt-1 text-blue-300">WPM: {activeWpm}</p>
            <p className="text-amber-300">Burst: {activeBurst}</p>
            <p className="text-red-300">Errors: {activeErrors}</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Each point tracks your WPM as the test progresses.
      </p>
    </section>
  );
}

function buildStats(
  counters: LiveCounters,
  words: string[],
  timeLeft: number,
  timerOption: TimerOption | number
): TypingStats {
  const elapsed =
    counters.startTime != null
      ? Math.max((Date.now() - counters.startTime) / 1000, 0.1)
      : typeof timerOption === "number"
        ? timerOption
        : 60;

  // Include progress on the current (possibly incomplete) word
  let correctChars = counters.correctChars;
  let totalChars = counters.totalChars;
  const currentWord = words[counters.currentWordIndex] || "";
  const typed = counters.input;

  if (typed.length > 0 && counters.currentWordIndex < words.length) {
    totalChars += typed.length;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === currentWord[i]) correctChars++;
    }
  }

  const correctWords = counters.typedHistory.filter(
    (t, i) => t === words[i]
  ).length;
  const wrongWordsFromHistory = counters.typedHistory.filter(
    (t, i) => t !== words[i] && t.length > 0
  ).length;

  // If last word completed exactly via characters (no trailing space yet)
  const lastWordDone =
    counters.currentWordIndex === words.length - 1 &&
    typed === currentWord &&
    currentWord.length > 0;

  const wpm = calculateWPM(correctChars, elapsed);
  const history = counters.wpmHistory.length
    ? counters.wpmHistory
    : [wpm];

  return {
    wpm,
    cpm: calculateCPM(correctChars, elapsed),
    accuracy: calculateAccuracy(correctChars, totalChars || 1),
    correctWords: lastWordDone ? correctWords + 1 : correctWords,
    wrongWords: wrongWordsFromHistory,
    // `mistakes` field stores miss-key count for saved results compatibility
    mistakes: counters.missKeys,
    charactersTyped: totalChars,
    backspaces: counters.backspaces,
    consistency:
      history.length > 1
        ? Math.round(
            100 -
              ((Math.max(...history) - Math.min(...history)) /
                (Math.max(...history) || 1)) *
                100
          )
        : 100,
    bestSpeed: history.length ? Math.max(...history) : wpm,
    averageSpeed: history.length
      ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
      : wpm,
    timeElapsed: elapsed,
    remainingTime: timeLeft,
  };
}

export function TypingTest({
  mode = "expert",
  initialTimer = 60,
  wordCount = 50,
  customText,
  testMode = "time",
  punctuation: punctuationProp,
  numbers: numbersProp,
  expertLevel,
  wordsDifficulty = "regular",
  contentKind = "words",
  lockCommittedWords = false,
  showTimerControls,
  onComplete,
  onStatusChange,
}: TypingTestProps) {
  const {
    fontFamily,
    punctuation: storePunctuation,
    numbers: storeNumbers,
  } = useSettingsStore();
  const punctuation = punctuationProp ?? storePunctuation;
  const numbers = numbersProp ?? storeNumbers;
  const { addTestResult } = useUserStore();

  const durationSec =
    typeof initialTimer === "number" && initialTimer > 0 ? initialTimer : 60;
  const useTimer = testMode === "time";
  const showTimerBar =
    showTimerControls ?? (testMode === "time" && mode === "expert");

  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "finished">(
    "idle"
  );
  const [timeLeft, setTimeLeft] = useState<number>(durationSec);
  const [timerOption, setTimerOption] = useState<TimerOption | number>(
    typeof initialTimer === "number" ? initialTimer : 60
  );
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wrongWords, setWrongWords] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [errorHistory, setErrorHistory] = useState<number[]>([]);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsSurfaceRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const restartButtonRef = useRef<HTMLButtonElement>(null);
  const tabArmedRef = useRef(false);
  const tabArmedTimerRef = useRef<number | null>(null);
  const statusRef = useRef(status);
  const finishedRef = useRef(false);
  const wordsRef = useRef(words);
  const timeLeftRef = useRef(timeLeft);
  const timerOptionRef = useRef(timerOption);

  // Always-current counters (avoids stale state when finishing)
  const countersRef = useRef<LiveCounters>({
    correctChars: 0,
    totalChars: 0,
    missKeys: 0,
    wrongWords: 0,
    backspaces: 0,
    typedHistory: [],
    currentWordIndex: 0,
    input: "",
    startTime: null,
    wpmHistory: [],
  });

  useEffect(() => {
    statusRef.current = status;
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    timerOptionRef.current = timerOption;
  }, [timerOption]);

  const syncCounters = useCallback((patch: Partial<LiveCounters>) => {
    countersRef.current = { ...countersRef.current, ...patch };
  }, []);

  const generateWords = useCallback(() => {
    if (customText) {
      setWords(customText.split(" ").filter(Boolean));
      return;
    }
    if (contentKind === "quote") {
      setWords(getQuoteWords());
      return;
    }
    // Timed tests need a long word pool so text does not run out early
    const count =
      testMode === "time"
        ? Math.max(wordCount, Math.ceil(durationSec * 5), 80)
        : wordCount;
    if (mode === "expert" && expertLevel) {
      setWords(getExpertChallengeWords(count, expertLevel));
      return;
    }
    setWords(
      getStyledWords(count, wordsDifficulty, punctuation, numbers)
    );
  }, [
    customText,
    wordCount,
    mode,
    expertLevel,
    wordsDifficulty,
    contentKind,
    punctuation,
    numbers,
    testMode,
    durationSec,
  ]);

  useEffect(() => {
    generateWords();
  }, [generateWords]);

  // Sync duration when parent changes timer (practice options)
  useEffect(() => {
    if (!useTimer) return;
    setTimeLeft(durationSec);
    setTimerOption(durationSec);
  }, [durationSec, useTimer]);

  const finishTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const stats = buildStats(
      countersRef.current,
      wordsRef.current,
      timeLeftRef.current,
      timerOptionRef.current
    );

    setFinalStats(stats);
    setStatus("finished");
    setTotalChars(stats.charactersTyped);
    setWrongWords(stats.wrongWords);
    setCorrectChars(
      stats.charactersTyped > 0
        ? Math.round((stats.accuracy / 100) * stats.charactersTyped)
        : 0
    );

    const result: TestResult = {
      ...stats,
      id: crypto.randomUUID(),
      mode,
      duration:
        typeof timerOptionRef.current === "number"
          ? timerOptionRef.current
          : stats.timeElapsed,
      text: wordsRef.current.join(" "),
      timestamp: Date.now(),
    };

    // Defer store updates so we never update Navbar during TypingTest render/setState
    queueMicrotask(() => {
      addTestResult(result);
      onComplete?.(result);
      void import("@/lib/activity").then(({ logUserAction }) =>
        logUserAction({
          actionType: "test_complete",
          details: `${result.wpm} WPM · ${result.accuracy}% · ${mode}`,
          path:
            typeof window !== "undefined"
              ? window.location.pathname
              : "/practice",
        })
      );
    });
  }, [mode, addTestResult, onComplete]);

  // Timer countdown (time mode only) — never call finishTest inside setState
  useEffect(() => {
    if (!useTimer || status !== "running") return;
    if (timeLeft <= 0) {
      finishTest();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [useTimer, status, timeLeft, finishTest]);

  // Live WPM sampling
  useEffect(() => {
    if (status !== "running" || !startTime) return;
    const interval = setInterval(() => {
      const elapsed = Math.max((Date.now() - startTime) / 1000, 0.1);
      const currentWpm = calculateWPM(
        countersRef.current.correctChars,
        elapsed
      );
      setWpmHistory((h) => {
        const next = [...h, currentWpm];
        syncCounters({ wpmHistory: next });
        return next;
      });
      setErrorHistory((history) => [
        ...history,
        countersRef.current.wrongWords,
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startTime, syncCounters]);

  const ensureStarted = () => {
    if (statusRef.current === "idle") {
      const now = Date.now();
      setStatus("running");
      setStartTime(now);
      syncCounters({ startTime: now });
      statusRef.current = "running";
    }
  };

  const completeWord = (typedWord: string) => {
    const wordIndex = countersRef.current.currentWordIndex;
    const list = wordsRef.current;
    const currentWord = list[wordIndex] || "";
    const isCorrect = typedWord === currentWord;

    let addCorrect = 0;
    let nextWrongWords = countersRef.current.wrongWords;
    if (isCorrect) {
      addCorrect = currentWord.length + 1; // +1 space
    } else {
      for (let i = 0; i < Math.min(typedWord.length, currentWord.length); i++) {
        if (typedWord[i] === currentWord[i]) addCorrect++;
      }
      // Wrong word = submitted word does not match (not a key miss)
      nextWrongWords += 1;
      setWrongWords(nextWrongWords);
    }

    const nextHistory = [...countersRef.current.typedHistory, typedWord];
    const nextCorrect = countersRef.current.correctChars + addCorrect;
    const nextTotal =
      countersRef.current.totalChars + typedWord.length + 1;
    const nextIndex = wordIndex + 1;

    syncCounters({
      typedHistory: nextHistory,
      correctChars: nextCorrect,
      totalChars: nextTotal,
      currentWordIndex: nextIndex,
      wrongWords: nextWrongWords,
      input: "",
    });

    setTypedHistory(nextHistory);
    setCorrectChars(nextCorrect);
    setTotalChars(nextTotal);
    setCurrentWordIndex(nextIndex);
    setCurrentCharIndex(0);
    setInput("");

    if (nextIndex >= list.length) {
      finishTest();
    }
  };

  /** Focus typing input without moving the page scroll (critical for long text). */
  const focusInput = useCallback((_opts?: { preventScroll?: boolean }) => {
    const el = inputRef.current;
    if (!el || el.disabled) return;
    const sx = typeof window !== "undefined" ? window.scrollX : 0;
    const sy = typeof window !== "undefined" ? window.scrollY : 0;
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
    // Some browsers still scroll focused controls into view — restore immediately
    if (typeof window !== "undefined") {
      window.scrollTo(sx, sy);
      requestAnimationFrame(() => window.scrollTo(sx, sy));
    }
  }, []);

  const resetTest = useCallback(() => {
    finishedRef.current = false;
    tabArmedRef.current = false;
    setStatus("idle");
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setTypedHistory([]);
    setInput("");
    setStartTime(null);
    setWrongWords(0);
    setBackspaces(0);
    setCorrectChars(0);
    setTotalChars(0);
    setWpmHistory([]);
    setErrorHistory([]);
    setFinalStats(null);
    setTimeLeft(
      useTimer
        ? typeof timerOption === "number"
          ? timerOption
          : durationSec
        : durationSec
    );
    countersRef.current = {
      correctChars: 0,
      totalChars: 0,
      missKeys: 0,
      wrongWords: 0,
      backspaces: 0,
      typedHistory: [],
      currentWordIndex: 0,
      input: "",
      startTime: null,
      wpmHistory: [],
    };
    generateWords();
    requestAnimationFrame(() => {
      focusInput();
    });
  }, [useTimer, timerOption, durationSec, generateWords, focusInput]);

  const resetTestRef = useRef(resetTest);
  useEffect(() => {
    resetTestRef.current = resetTest;
  }, [resetTest]);

  const lockCommittedRef = useRef(lockCommittedWords);
  useEffect(() => {
    lockCommittedRef.current = lockCommittedWords;
  }, [lockCommittedWords]);

  const uncompleteWord = () => {
    if (lockCommittedRef.current) return false;
    const idx = countersRef.current.currentWordIndex;
    if (idx <= 0) return false;

    const list = wordsRef.current;
    const history = countersRef.current.typedHistory;
    const prevTyped = history[idx - 1] ?? "";
    const prevWord = list[idx - 1] ?? "";
    if (!prevTyped.length || prevTyped === prevWord) return false;

    const nextHistory = history.slice(0, -1);
    const nextIndex = idx - 1;

    let correct = 0;
    let total = 0;
    let wrong = 0;
    for (let i = 0; i < nextHistory.length; i++) {
      const typed = nextHistory[i] || "";
      const word = list[i] || "";
      total += typed.length + 1;
      if (typed === word) {
        correct += word.length + 1;
      } else {
        for (let c = 0; c < Math.min(typed.length, word.length); c++) {
          if (typed[c] === word[c]) correct += 1;
        }
        if (typed.length > 0) wrong += 1;
      }
    }
    total += prevTyped.length;
    for (let c = 0; c < Math.min(prevTyped.length, prevWord.length); c++) {
      if (prevTyped[c] === prevWord[c]) correct += 1;
    }

    syncCounters({
      typedHistory: nextHistory,
      currentWordIndex: nextIndex,
      input: prevTyped,
      correctChars: correct,
      totalChars: total,
      wrongWords: wrong,
    });
    setTypedHistory(nextHistory);
    setCurrentWordIndex(nextIndex);
    setInput(prevTyped);
    setCurrentCharIndex(prevTyped.length);
    setCorrectChars(correct);
    setTotalChars(total);
    setWrongWords(wrong);
    return true;
  };

  const uncompleteWordRef = useRef(uncompleteWord);
  useEffect(() => {
    uncompleteWordRef.current = uncompleteWord;
  }, [uncompleteWord]);

  /** Apply typed string (shared by input onChange and global first-key capture) */
  const applyTypedValue = useCallback(
    (value: string) => {
      if (statusRef.current === "finished" || finishedRef.current) return;

      const list = wordsRef.current;
      const wordIndex = countersRef.current.currentWordIndex;
      const currentWord = list[wordIndex] || "";

      ensureStarted();

      // Space → complete word
      if (value.endsWith(" ")) {
        completeWord(value.trimEnd());
        return;
      }

      // Miss key: user pressed a wrong key (new character that does not match)
      const prevInput = countersRef.current.input;
      if (value.length > prevInput.length) {
        const added = value.slice(prevInput.length);
        for (let i = 0; i < added.length; i++) {
          const pos = prevInput.length + i;
          const expected = currentWord[pos];
          if (expected === undefined || added[i] !== expected) {
            const nextMiss = countersRef.current.missKeys + 1;
            syncCounters({ missKeys: nextMiss });
          }
        }
      }

      setInput(value);
      setCurrentCharIndex(value.length);
      syncCounters({ input: value });

      // Auto-finish: last word typed completely
      if (
        wordIndex === list.length - 1 &&
        list.length > 0 &&
        value === currentWord &&
        currentWord.length > 0
      ) {
        const nextHistory = [...countersRef.current.typedHistory, value];
        const nextCorrect =
          countersRef.current.correctChars + currentWord.length;
        const nextTotal = countersRef.current.totalChars + currentWord.length;

        syncCounters({
          typedHistory: nextHistory,
          correctChars: nextCorrect,
          totalChars: nextTotal,
          currentWordIndex: list.length,
          input: "",
        });

        setTypedHistory(nextHistory);
        setCorrectChars(nextCorrect);
        setTotalChars(nextTotal);
        setCurrentWordIndex(list.length);
        setInput("");
        setCurrentCharIndex(0);
        finishTest();
      }
    },
    // completeWord is stable enough via refs; finishTest is memoized
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [finishTest, syncCounters]
  );

  const applyTypedValueRef = useRef(applyTypedValue);
  useEffect(() => {
    applyTypedValueRef.current = applyTypedValue;
  }, [applyTypedValue]);

  // Keep latest completeWord for global key handler (avoids stale closures)
  const completeWordRef = useRef(completeWord);
  completeWordRef.current = completeWord;

  const armRestartFromTab = () => {
    tabArmedRef.current = true;
    if (tabArmedTimerRef.current != null) {
      window.clearTimeout(tabArmedTimerRef.current);
    }
    tabArmedTimerRef.current = window.setTimeout(() => {
      tabArmedRef.current = false;
      tabArmedTimerRef.current = null;
    }, 1600);
    restartButtonRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      armRestartFromTab();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      tabArmedRef.current = false;
      inputRef.current?.blur();
      return;
    }

    if (e.key === "Enter" && tabArmedRef.current) {
      e.preventDefault();
      tabArmedRef.current = false;
      resetTest();
      return;
    }

    if (status === "finished" || finishedRef.current) {
      e.preventDefault();
      return;
    }

    if (e.key === "Backspace") {
      setBackspaces((b) => {
        const next = b + 1;
        syncCounters({ backspaces: next });
        return next;
      });
      if (
        !(countersRef.current.input || input) &&
        countersRef.current.currentWordIndex > 0
      ) {
        e.preventDefault();
        uncompleteWord();
        return;
      }
    }

    // Enter = treat as end of word / finish
    if (e.key === "Enter") {
      e.preventDefault();
      ensureStarted();
      const typedWord = (countersRef.current.input || input).trim();
      if (typedWord.length === 0 && countersRef.current.currentWordIndex === 0) {
        return;
      }
      completeWord(typedWord);
      return;
    }

    if (
      status === "idle" &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      ensureStarted();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyTypedValue(e.target.value);
  };

  // Focus once when options remount / idle — do NOT re-focus on every status tick
  // (re-focusing a tall input mid-test scrolls the page and interrupts typing)
  useEffect(() => {
    if (status === "finished") return;
    if (status === "running") return;
    focusInput();
    const t0 = window.setTimeout(() => focusInput(), 0);
    return () => window.clearTimeout(t0);
  }, [status, wordCount, mode, customText, focusInput]);

  // Any keyboard key starts / continues the test without clicking the text box
  // (e.g. after choosing 10/20 words the button keeps focus — we steal typing keys)
  useEffect(() => {
    const isOtherEditable = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target === inputRef.current) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      if (
        target.closest(
          "[data-cookie-consent], [data-theme-switcher], [data-typing-options], [data-site-dialog], [role='dialog'], [role='listbox'], [aria-modal='true'], header, footer, form"
        )
      ) {
        return true;
      }
      return false;
    };

    const isTypingInteraction = (target: EventTarget | null) => {
      if (target === inputRef.current) return true;
      if (target === restartButtonRef.current) return false;
      const active = document.activeElement;
      if (active === inputRef.current) return true;
      return false;
    };

    const onWindowKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const finished = finishedRef.current || statusRef.current === "finished";
      const inSiteDialog =
        e.target instanceof HTMLElement &&
        e.target.closest("[data-site-dialog]");

      if (isTabKey(e) && finished && !inSiteDialog) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        armRestartFromTab();
        focusRestartButton();
        return;
      }

      if (e.target === restartButtonRef.current) return;
      if (isOtherEditable(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (isTabKey(e)) {
        if (!isTypingInteraction(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        armRestartFromTab();
        return;
      }

      if (key === "Escape") {
        e.preventDefault();
        tabArmedRef.current = false;
        if (tabArmedTimerRef.current != null) {
          window.clearTimeout(tabArmedTimerRef.current);
          tabArmedTimerRef.current = null;
        }
        inputRef.current?.blur();
        return;
      }

      if (key === "Enter" && tabArmedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        tabArmedRef.current = false;
        if (tabArmedTimerRef.current != null) {
          window.clearTimeout(tabArmedTimerRef.current);
          tabArmedTimerRef.current = null;
        }
        resetTestRef.current();
        return;
      }

      if (finishedRef.current || statusRef.current === "finished") return;

      if (
        key === "Shift" ||
        key === "Control" ||
        key === "Alt" ||
        key === "Meta" ||
        key === "CapsLock" ||
        key === "ArrowLeft" ||
        key === "ArrowRight" ||
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "Home" ||
        key === "End" ||
        key === "PageUp" ||
        key === "PageDown"
      ) {
        return;
      }

      const inputEl = inputRef.current;
      if (!inputEl || inputEl.disabled) return;

      const alreadyFocused = document.activeElement === inputEl;

      // If focus is already on our input, let the native input handlers run
      if (alreadyFocused) return;

      // Redirect typing from buttons / page body into the test
      if (key === "Backspace") {
        e.preventDefault();
        e.stopPropagation();
        focusInput();
        setBackspaces((b) => {
          const next = b + 1;
          syncCounters({ backspaces: next });
          return next;
        });
        const prev = countersRef.current.input;
        if (prev.length > 0) {
          applyTypedValueRef.current(prev.slice(0, -1));
        } else {
          uncompleteWordRef.current();
        }
        return;
      }

      if (key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        focusInput();
        ensureStarted();
        const typedWord = countersRef.current.input.trim();
        if (
          typedWord.length === 0 &&
          countersRef.current.currentWordIndex === 0
        ) {
          return;
        }
        completeWordRef.current(typedWord);
        return;
      }

      if (key.length === 1) {
        e.preventDefault();
        e.stopPropagation();
        focusInput();
        applyTypedValueRef.current(countersRef.current.input + key);
      }
    };

    window.addEventListener("keydown", onWindowKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onWindowKeyDown, true);
      if (tabArmedTimerRef.current != null) {
        window.clearTimeout(tabArmedTimerRef.current);
      }
    };
  }, [focusInput, syncCounters]);

  useEffect(() => {
    if (status !== "finished") {
      delete document.body.dataset.typingResults;
    }
  }, [status]);

  // Do not auto-scroll on finish either if user is mid-page; optional soft nearest only
  useEffect(() => {
    if (status !== "finished" || !finalStats || !resultsRef.current) return;
    // Only scroll if results are completely below the viewport (not mid-typing jump)
    const el = resultsRef.current;
    const rect = el.getBoundingClientRect();
    const fullyBelow = rect.top > window.innerHeight - 40;
    if (!fullyBelow) return;
    const id = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
    return () => window.clearTimeout(id);
  }, [status, finalStats]);

  // Keep the active word visible and snap the overlay caret before paint
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const surface = wordsSurfaceRef.current;
    const caret = caretRef.current;
    if (!viewport || !surface) return;

    const currentWord = surface.querySelector(
      '[data-current="true"]'
    ) as HTMLElement | null;
    if (currentWord) {
      const viewportRect = viewport.getBoundingClientRect();
      const wordRect = currentWord.getBoundingClientRect();
      const offset =
        wordRect.top -
        viewportRect.top -
        viewportRect.height / 2 +
        wordRect.height / 2;
      if (Math.abs(offset) > 2) {
        viewport.scrollTop += offset;
      }
    }

    if (!caret || status === "finished") return;
    const target = surface.querySelector(
      "[data-caret-target='true']"
    ) as HTMLElement | null;
    if (!target) {
      caret.style.opacity = "0";
      return;
    }
    const vr = viewport.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const lineBox = currentWord?.getBoundingClientRect() ?? tr;
    const fontSize = parseFloat(getComputedStyle(viewport).fontSize) || 24;
    const caretHeight = fontSize * 1.05;
    const x = tr.left - vr.left + viewport.scrollLeft;
    const y =
      lineBox.top -
      vr.top +
      viewport.scrollTop +
      Math.max((lineBox.height - caretHeight) / 2, fontSize * 0.08);
    caret.style.opacity = "1";
    caret.style.height = `${caretHeight}px`;
    caret.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [currentWordIndex, currentCharIndex, words, input, status]);

  const liveElapsed =
    status === "running" && startTime
      ? Math.max((Date.now() - startTime) / 1000, 0.1)
      : 0;

  const currentWpm =
    status === "finished" && finalStats
      ? finalStats.wpm
      : status === "running" && startTime
        ? calculateWPM(correctChars, liveElapsed)
        : 0;

  const currentAccuracy =
    status === "finished" && finalStats
      ? finalStats.accuracy
      : calculateAccuracy(correctChars, totalChars || 1);

  const renderWords = () => {
    return words.map((word, wIdx) => {
      const isCurrent = wIdx === currentWordIndex;
      const isPast = wIdx < currentWordIndex;
      const typed = isPast
        ? typedHistory[wIdx]
        : isCurrent
          ? input
          : "";

      return (
        <span
          key={wIdx}
          data-current={isCurrent ? "true" : undefined}
          className={cn(
            "mr-[0.55em] mb-0 inline-block",
            isPast && typed === word && "text-[var(--typed-correct)]",
            isPast &&
              typed !== word &&
              "text-[var(--typed-incorrect)] underline decoration-[var(--typed-incorrect)]/50"
          )}
        >
          {word.split("").map((char, cIdx) => {
            let className = "text-[var(--typed-upcoming)]";
            const isCaretHere =
              isCurrent &&
              status !== "finished" &&
              cIdx === currentCharIndex;
            if (isPast) {
              className =
                typed?.[cIdx] === char
                  ? "text-[var(--typed-correct)]"
                  : "text-[var(--typed-incorrect)]";
            } else if (isCurrent) {
              if (cIdx < currentCharIndex) {
                className =
                  input[cIdx] === char
                    ? "text-[var(--typed-correct)]"
                    : "text-[var(--typed-incorrect)] bg-[color-mix(in_srgb,var(--typed-incorrect)_20%,transparent)]";
              } else if (cIdx === currentCharIndex) {
                className = "text-[var(--typed-upcoming)]";
              }
            }
            return (
              <span
                key={cIdx}
                data-caret-target={isCaretHere ? "true" : undefined}
                className={className}
              >
                {char}
              </span>
            );
          })}
          {isCurrent &&
            status !== "finished" &&
            currentCharIndex >= word.length && (
              <span
                data-caret-target="true"
                className="inline-block h-[1em] w-px align-baseline"
                aria-hidden="true"
              />
            )}
        </span>
      );
    });
  };

  const displayStats = finalStats;

  const timeLabel = useTimer ? "Time" : "Elapsed";
  const timeValue = useTimer
    ? formatTime(timeLeft)
    : formatTime(Math.floor(liveElapsed));

  // ── Results-only view (no paragraph, live stats, or mid-test chrome) ──
  if (status === "finished" && displayStats) {
    const resultWpmHistory = [...wpmHistory];
    if (resultWpmHistory[resultWpmHistory.length - 1] !== displayStats.wpm) {
      resultWpmHistory.push(displayStats.wpm);
    }
    const resultErrorHistory = [...errorHistory];
    while (resultErrorHistory.length < resultWpmHistory.length) {
      resultErrorHistory.push(displayStats.wrongWords);
    }

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col -mt-4 sm:-mt-6">
        <ResultsTabLock />
        <div
          ref={resultsRef}
          id="typing-test-results"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-stretch">
            <ResultPerformanceChart
              samples={resultWpmHistory}
              errors={resultErrorHistory}
            />

            <div className="grid grid-cols-2 gap-4 content-start">
              {[
                {
                  label: "WPM",
                  value: displayStats.wpm,
                  color: "text-blue-400",
                },
                {
                  label: "Accuracy",
                  value: `${displayStats.accuracy}%`,
                  color: "text-emerald-400",
                },
                {
                  label: "Correct Words",
                  value: displayStats.correctWords,
                  color: "text-green-400",
                },
                {
                  label: "Wrong Words",
                  value: displayStats.wrongWords,
                  color: "text-red-400",
                },
                {
                  label: "Missed Keys",
                  value: displayStats.mistakes,
                  color: "text-orange-400",
                },
                {
                  label: "Characters",
                  value: displayStats.charactersTyped,
                  color: "text-violet-400",
                },
                {
                  label: "Backspaces",
                  value: displayStats.backspaces,
                  color: "text-pink-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/5 border border-white/5 p-4 text-center"
                >
                  <div className={cn("text-2xl font-bold font-mono", stat.color)}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button
              id="typing-restart-button"
              ref={restartButtonRef}
              onClick={resetTest}
              autoFocus
              tabIndex={0}
              className="ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--background)]"
              onKeyDown={(e) => {
                if (isTabKey(e)) {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.focus();
                }
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
            <Button variant="secondary" onClick={resetTest} tabIndex={-1}>
              <ArrowRight className="h-4 w-4" />
              Next Test
            </Button>
            <Button variant="outline" type="button" disabled title="Coming soon" tabIndex={-1}>
              <Save className="h-4 w-4" />
              Save Result
            </Button>
            <Button
              variant="outline"
              type="button"
              tabIndex={-1}
              onClick={async () => {
                const text = `I scored ${displayStats.wpm} WPM with ${displayStats.accuracy}% accuracy on BulletType! 🔥 https://bullettype.online`;
                try {
                  if (navigator.share) {
                    await navigator.share({ text, title: "BulletType result" });
                  } else {
                    await navigator.clipboard.writeText(text);
                    alert("Result copied to clipboard!");
                  }
                } catch {
                  // user cancelled share
                }
              }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active typing UI ──
  return (
    <div className="mx-auto flex w-full max-w-none flex-1 flex-col">
      {showTimerBar && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-1 font-mono">
          {([15, 30, 60, 120] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTimerOption(t);
                setTimeLeft(t);
                if (status === "idle") resetTest();
              }}
              disabled={status === "running"}
              className={cn(
                "rounded-md px-2 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:opacity-50",
                timerOption === t
                  ? "text-blue-500"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-center gap-6 font-mono text-sm">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            WPM
          </span>
          <span className="text-2xl font-medium text-[var(--stat-wpm)]">{currentWpm}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Accuracy
          </span>
          <span className="text-2xl font-medium text-[var(--stat-accuracy)]">
            {currentAccuracy}%
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            {timeLabel}
          </span>
          <span className="text-2xl font-medium text-[var(--stat-time)]">{timeValue}</span>
        </div>
        {status === "running" && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              Wrong Words
            </span>
            <span className="text-2xl font-medium text-red-500">{wrongWords}</span>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        onClick={() => focusInput({ preventScroll: true })}
        onMouseDown={(e) => {
          if (e.target !== inputRef.current) {
            e.preventDefault();
            focusInput({ preventScroll: true });
          }
        }}
        className={cn(
          "relative mx-auto w-full cursor-text py-1 sm:py-2",
          status === "idle" && "opacity-95"
        )}
      >
        <div ref={viewportRef} className="typing-viewport">
          {status !== "finished" && (
            <span
              ref={caretRef}
              className={cn("typing-caret", status === "idle" && "is-idle")}
              aria-hidden="true"
            />
          )}
          <div
            ref={wordsSurfaceRef}
            className="typing-text relative w-full select-none"
            style={{
              fontFamily: `"${fontFamily}", var(--font-jetbrains-mono), "Roboto Mono", "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace`,
            }}
          >
            {renderWords()}

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className="absolute left-0 top-0 z-10 caret-transparent"
              style={{
                opacity: 0,
                width: 1,
                height: 1,
                padding: 0,
                margin: 0,
                border: 0,
                overflow: "hidden",
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="text"
              enterKeyHint="done"
              aria-label="Typing test input"
              tabIndex={0}
            />
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-2.5 pt-8 pb-2">
        <button
          ref={restartButtonRef}
          type="button"
          onClick={resetTest}
          aria-label="Restart typing test"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:text-[var(--primary)]"
        >
          <RotateCcw className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
        </button>
        <div className="flex flex-col items-center gap-1.5 font-mono text-[11px] text-[var(--muted-foreground)]">
          <p className="flex flex-wrap items-center justify-center gap-1">
            <kbd className="shortcut-key">tab</kbd>
            <span>+</span>
            <kbd className="shortcut-key">enter</kbd>
            <span className="ml-0.5">— restart test</span>
          </p>
          <p className="flex flex-wrap items-center justify-center gap-1">
            <kbd className="shortcut-key">esc</kbd>
            <span className="ml-0.5">— cancel / reset focus</span>
          </p>
        </div>
      </div>
    </div>
  );
}
