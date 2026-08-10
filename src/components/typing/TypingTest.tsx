"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, Share2, Save, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  cn,
  calculateWPM,
  calculateCPM,
  calculateAccuracy,
  formatTime,
} from "@/lib/utils";
import { getRandomWords } from "@/lib/words";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUserStore } from "@/store/useUserStore";
import type { Difficulty, TimerOption, TypingStats, TestResult } from "@/types";

interface TypingTestProps {
  mode?: Difficulty;
  initialTimer?: TimerOption;
  wordCount?: number;
  customText?: string;
  onComplete?: (result: TestResult) => void;
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

function buildStats(
  counters: LiveCounters,
  words: string[],
  timeLeft: number,
  timerOption: TimerOption
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
  onComplete,
}: TypingTestProps) {
  const { fontSize, fontFamily, punctuation, numbers, cursorStyle } =
    useSettingsStore();
  const { addTestResult } = useUserStore();

  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "finished">(
    "idle"
  );
  const [timeLeft, setTimeLeft] = useState<number>(
    typeof initialTimer === "number" ? initialTimer : 60
  );
  const [timerOption, setTimerOption] = useState<TimerOption>(initialTimer);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [missKeys, setMissKeys] = useState(0);
  const [wrongWords, setWrongWords] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
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
  }, [status]);

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
    } else {
      setWords(
        getRandomWords(
          wordCount,
          mode === "beginner"
            ? "beginner"
            : mode === "intermediate"
              ? "intermediate"
              : "expert",
          punctuation,
          numbers
        )
      );
    }
  }, [customText, wordCount, mode, punctuation, numbers]);

  useEffect(() => {
    generateWords();
  }, [generateWords]);

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
    setMissKeys(stats.mistakes);
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

    addTestResult(result);
    onComplete?.(result);

    // Admin Recent Actions history (guest or registered)
    void import("@/lib/activity").then(({ logUserAction }) =>
      logUserAction({
        actionType: "test_complete",
        details: `${result.wpm} WPM · ${result.accuracy}% · ${mode}`,
        path:
          typeof window !== "undefined" ? window.location.pathname : "/practice",
      })
    );
  }, [mode, addTestResult, onComplete]);

  // Timer countdown
  useEffect(() => {
    if (status !== "running" || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finishTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, timeLeft, finishTest]);

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
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startTime, syncCounters]);

  const resetTest = () => {
    finishedRef.current = false;
    setStatus("idle");
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setTypedHistory([]);
    setInput("");
    setStartTime(null);
    setMissKeys(0);
    setWrongWords(0);
    setBackspaces(0);
    setCorrectChars(0);
    setTotalChars(0);
    setWpmHistory([]);
    setFinalStats(null);
    setTimeLeft(typeof timerOption === "number" ? timerOption : 60);
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
    // Focus after restart (also covered by status effect; call immediately too)
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  };

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

  const focusInput = useCallback((opts?: { preventScroll?: boolean }) => {
    const el = inputRef.current;
    if (!el || el.disabled) return;
    try {
      el.focus({ preventScroll: opts?.preventScroll ?? true });
    } catch {
      el.focus();
    }
  }, []);

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
            setMissKeys(nextMiss);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  // Keep caret in the hidden input after mount, status change, restart, word count change
  useEffect(() => {
    if (status === "finished") return;
    focusInput();
    const t0 = window.setTimeout(() => focusInput(), 0);
    const t1 = window.setTimeout(() => focusInput(), 50);
    const t2 = window.setTimeout(() => focusInput(), 120);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
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
      return false;
    };

    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (finishedRef.current || statusRef.current === "finished") return;
      if (isOtherEditable(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;
      if (
        key === "Tab" ||
        key === "Escape" ||
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
    return () => window.removeEventListener("keydown", onWindowKeyDown, true);
  }, [focusInput, syncCounters]);

  // When the test ends, scroll results into view
  useEffect(() => {
    if (status !== "finished" || !finalStats) return;

    const scrollToResults = () => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    // Wait a frame so the results panel is mounted
    const id = window.requestAnimationFrame(() => {
      scrollToResults();
      // Extra pass for mobile layout settling
      window.setTimeout(scrollToResults, 80);
    });

    return () => window.cancelAnimationFrame(id);
  }, [status, finalStats]);

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
          className={cn(
            "mr-2 inline-block",
            isPast && typed === word && "text-emerald-500",
            isPast &&
              typed !== word &&
              "text-red-500 underline decoration-red-500/50"
          )}
        >
          {word.split("").map((char, cIdx) => {
            let className = "text-zinc-500 dark:text-zinc-500";
            if (isPast) {
              className =
                typed?.[cIdx] === char ? "text-emerald-500" : "text-red-500";
            } else if (isCurrent) {
              if (cIdx < currentCharIndex) {
                className =
                  input[cIdx] === char
                    ? "text-emerald-400"
                    : "text-red-400 bg-red-500/20";
              } else if (cIdx === currentCharIndex) {
                className = cn(
                  "text-zinc-900 dark:text-zinc-100",
                  cursorStyle === "block" && "bg-blue-500/80 text-white",
                  cursorStyle === "underline" && "border-b-2 border-blue-500",
                  cursorStyle === "line" && "border-l-2 border-blue-500"
                );
              }
            }
            return (
              <span key={cIdx} className={className}>
                {char}
              </span>
            );
          })}
          {isCurrent && currentCharIndex >= word.length && (
            <span
              className={cn(
                "inline-block w-0.5 h-[1.1em] bg-blue-500 ml-0.5 animate-pulse",
                cursorStyle === "block" && "w-2 bg-blue-500/80"
              )}
            />
          )}
        </span>
      );
    });
  };

  const displayStats = finalStats;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {mode === "expert" && status !== "finished" && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {([15, 30, 60, 120] as const).map((t) => (
            <Button
              key={t}
              variant={timerOption === t ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setTimerOption(t);
                setTimeLeft(t);
                if (status === "idle") resetTest();
              }}
              disabled={status === "running"}
            >
              {t}s
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-sm font-mono">
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">
            WPM
          </span>
          <span className="text-2xl font-bold text-blue-500">{currentWpm}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">
            Accuracy
          </span>
          <span className="text-2xl font-bold text-emerald-500">
            {currentAccuracy}%
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">
            Time
          </span>
          <span className="text-2xl font-bold text-amber-500">
            {status === "finished" ? "0:00" : formatTime(timeLeft)}
          </span>
        </div>
        {(status === "running" || status === "finished") && (
          <>
            <div className="flex flex-col items-center">
              <span className="text-zinc-500 text-xs uppercase tracking-wider">
                Wrong Words
              </span>
              <span className="text-2xl font-bold text-red-500">
                {status === "finished" && displayStats
                  ? displayStats.wrongWords
                  : wrongWords}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-zinc-500 text-xs uppercase tracking-wider">
                Miss Keys
              </span>
              <span className="text-2xl font-bold text-orange-500">
                {status === "finished" && displayStats
                  ? displayStats.mistakes
                  : missKeys}
              </span>
            </div>
          </>
        )}
      </div>

      <div
        ref={containerRef}
        onClick={() => focusInput({ preventScroll: false })}
        onMouseDown={(e) => {
          // Keep focus on the typing input even when clicking labels around it
          if (e.target !== inputRef.current) {
            e.preventDefault();
            focusInput({ preventScroll: true });
          }
        }}
        className={cn(
          "relative rounded-2xl border border-white/10 bg-white/5 dark:bg-zinc-900/50 backdrop-blur-xl p-8 min-h-[180px] cursor-text transition-all",
          status === "idle" && "hover:border-blue-500/30"
        )}
      >
        <div
          className="leading-relaxed tracking-wide select-none"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: `"${fontFamily}", ui-monospace, monospace`,
          }}
        >
          {renderWords()}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full caret-transparent"
          style={{ opacity: 0 }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
          disabled={status === "finished"}
          inputMode="text"
          enterKeyHint="done"
          aria-label="Typing test input"
        />

        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-zinc-500 text-sm bg-zinc-900/80 px-4 py-2 rounded-full backdrop-blur">
              Start typing to begin
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <Button variant="outline" size="sm" onClick={resetTest}>
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
      </div>

      {status === "finished" && displayStats && (
        <div
          ref={resultsRef}
          id="typing-test-results"
          className="mt-10 scroll-mt-24 rounded-2xl border border-white/10 bg-white/5 dark:bg-zinc-900/60 backdrop-blur-xl p-8"
        >
          <div className="text-center mb-8">
            <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold">Test Complete!</h2>
            <p className="text-zinc-500 mt-1">
              Great job. Here are your stats.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              {
                label: "WPM",
                value: displayStats.wpm,
                color: "text-blue-400",
              },
              {
                label: "CPM",
                value: displayStats.cpm,
                color: "text-cyan-400",
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
                label: "Miss Keys",
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
                <div
                  className={cn("text-2xl font-bold font-mono", stat.color)}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button onClick={resetTest}>
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
            <Button variant="secondary" onClick={resetTest}>
              <ArrowRight className="h-4 w-4" />
              Next Test
            </Button>
            <Button variant="outline" type="button" disabled title="Coming soon">
              <Save className="h-4 w-4" />
              Save Result
            </Button>
            <Button
              variant="outline"
              type="button"
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
      )}
    </div>
  );
}
