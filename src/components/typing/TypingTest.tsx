"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, Share2, Save, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, calculateWPM, calculateCPM, calculateAccuracy, formatTime } from "@/lib/utils";
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
  const [typedHistory, setTypedHistory] = useState<string[]>([]); // per word
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [timeLeft, setTimeLeft] = useState(
    typeof initialTimer === "number" ? initialTimer : 60
  );
  const [timerOption, setTimerOption] = useState<TimerOption>(initialTimer);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateWords = useCallback(() => {
    if (customText) {
      setWords(customText.split(" "));
    } else {
      setWords(
        getRandomWords(
          wordCount,
          mode === "beginner" ? "beginner" : mode === "intermediate" ? "intermediate" : "expert",
          punctuation,
          numbers
        )
      );
    }
  }, [customText, wordCount, mode, punctuation, numbers]);

  useEffect(() => {
    generateWords();
  }, [generateWords]);

  // Timer
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
  }, [status, timeLeft]);

  // Live WPM sampling
  useEffect(() => {
    if (status !== "running" || !startTime) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const currentWpm = calculateWPM(correctChars, elapsed);
      setWpmHistory((h) => [...h, currentWpm]);
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startTime, correctChars]);

  const finishTest = useCallback(() => {
    setStatus("finished");
    const elapsed =
      startTime ? (Date.now() - startTime) / 1000 : typeof timerOption === "number" ? timerOption : 60;

    const stats: TypingStats = {
      wpm: calculateWPM(correctChars, elapsed),
      cpm: calculateCPM(correctChars, elapsed),
      accuracy: calculateAccuracy(correctChars, totalChars || 1),
      correctWords: typedHistory.filter((t, i) => t === words[i]).length,
      wrongWords: typedHistory.filter((t, i) => t !== words[i] && t.length > 0).length,
      mistakes,
      charactersTyped: totalChars,
      backspaces,
      consistency: wpmHistory.length > 1
        ? Math.round(
            100 -
              (Math.max(...wpmHistory) - Math.min(...wpmHistory)) /
                (Math.max(...wpmHistory) || 1) *
                100
          )
        : 100,
      bestSpeed: wpmHistory.length ? Math.max(...wpmHistory) : 0,
      averageSpeed: wpmHistory.length
        ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
        : 0,
      timeElapsed: elapsed,
      remainingTime: timeLeft,
    };

    const result: TestResult = {
      ...stats,
      id: crypto.randomUUID(),
      mode,
      duration: typeof timerOption === "number" ? timerOption : elapsed,
      text: words.join(" "),
      timestamp: Date.now(),
    };

    addTestResult(result);
    onComplete?.(result);
  }, [
    startTime,
    timerOption,
    correctChars,
    totalChars,
    typedHistory,
    words,
    mistakes,
    backspaces,
    wpmHistory,
    timeLeft,
    mode,
    addTestResult,
    onComplete,
  ]);

  const resetTest = () => {
    setStatus("idle");
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setTypedHistory([]);
    setInput("");
    setStartTime(null);
    setMistakes(0);
    setBackspaces(0);
    setCorrectChars(0);
    setTotalChars(0);
    setWpmHistory([]);
    setTimeLeft(typeof timerOption === "number" ? timerOption : 60);
    generateWords();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status === "finished") return;

    if (e.key === "Backspace") {
      setBackspaces((b) => b + 1);
    }

    if (status === "idle" && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setStatus("running");
      setStartTime(Date.now());
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "finished") return;
    const value = e.target.value;
    const currentWord = words[currentWordIndex] || "";

    // Space → next word
    if (value.endsWith(" ")) {
      const typedWord = value.trim();
      const isCorrect = typedWord === currentWord;

      setTypedHistory((h) => [...h, typedWord]);
      setTotalChars((c) => c + typedWord.length + 1);
      if (isCorrect) {
        setCorrectChars((c) => c + currentWord.length + 1);
      } else {
        setMistakes((m) => m + 1);
        // still count correct characters
        let correctInWord = 0;
        for (let i = 0; i < Math.min(typedWord.length, currentWord.length); i++) {
          if (typedWord[i] === currentWord[i]) correctInWord++;
        }
        setCorrectChars((c) => c + correctInWord);
      }

      setCurrentWordIndex((i) => i + 1);
      setCurrentCharIndex(0);
      setInput("");

      // Finished all words early
      if (currentWordIndex + 1 >= words.length) {
        finishTest();
      }
      return;
    }

    // Character level
    setInput(value);
    setCurrentCharIndex(value.length);

    // Count live mistakes for current word
    let newMistakes = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentWord[i]) newMistakes++;
    }
  };

  // Focus management
  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const currentWpm =
    status === "running" && startTime
      ? calculateWPM(correctChars, (Date.now() - startTime) / 1000)
      : 0;

  const currentAccuracy = calculateAccuracy(correctChars, totalChars || 1);

  // Render words with highlighting
  const renderWords = () => {
    return words.map((word, wIdx) => {
      const isCurrent = wIdx === currentWordIndex;
      const isPast = wIdx < currentWordIndex;
      const typed = isPast ? typedHistory[wIdx] : isCurrent ? input : "";

      return (
        <span
          key={wIdx}
          className={cn(
            "mr-2 inline-block",
            isPast && typed === word && "text-emerald-500",
            isPast && typed !== word && "text-red-500 underline decoration-red-500/50"
          )}
        >
          {word.split("").map((char, cIdx) => {
            let className = "text-zinc-500 dark:text-zinc-500";
            if (isPast) {
              className =
                typed?.[cIdx] === char
                  ? "text-emerald-500"
                  : "text-red-500";
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Timer & Mode selector */}
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

      {/* Live stats bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-sm font-mono">
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">WPM</span>
          <span className="text-2xl font-bold text-blue-500">{currentWpm}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">Accuracy</span>
          <span className="text-2xl font-bold text-emerald-500">{currentAccuracy}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">Time</span>
          <span className="text-2xl font-bold text-amber-500">
            {status === "finished" ? "0:00" : formatTime(timeLeft)}
          </span>
        </div>
        {status === "running" && (
          <div className="flex flex-col items-center">
            <span className="text-zinc-500 text-xs uppercase tracking-wider">Mistakes</span>
            <span className="text-2xl font-bold text-red-500">{mistakes}</span>
          </div>
        )}
      </div>

      {/* Typing area */}
      <div
        ref={containerRef}
        onClick={() => inputRef.current?.focus()}
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
          className="absolute opacity-0 pointer-events-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={status === "finished"}
        />

        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-zinc-500 text-sm bg-zinc-900/80 px-4 py-2 rounded-full backdrop-blur">
              Click here or start typing to begin
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mt-6">
        <Button variant="outline" size="sm" onClick={resetTest}>
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
      </div>

      {/* Results screen */}
      {status === "finished" && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 dark:bg-zinc-900/60 backdrop-blur-xl p-8">
            <div className="text-center mb-8">
              <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Test Complete!</h2>
              <p className="text-zinc-500 mt-1">Great job. Here are your stats.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { label: "WPM", value: calculateWPM(correctChars, startTime ? (Date.now() - startTime) / 1000 : 60), color: "text-blue-400" },
                { label: "CPM", value: calculateCPM(correctChars, startTime ? (Date.now() - startTime) / 1000 : 60), color: "text-cyan-400" },
                { label: "Accuracy", value: `${calculateAccuracy(correctChars, totalChars || 1)}%`, color: "text-emerald-400" },
                { label: "Correct Words", value: typedHistory.filter((t, i) => t === words[i]).length, color: "text-green-400" },
                { label: "Wrong Words", value: typedHistory.filter((t, i) => t !== words[i] && t).length, color: "text-red-400" },
                { label: "Mistakes", value: mistakes, color: "text-orange-400" },
                { label: "Characters", value: totalChars, color: "text-violet-400" },
                { label: "Backspaces", value: backspaces, color: "text-pink-400" },
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

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Button onClick={resetTest}>
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
              <Button variant="secondary" onClick={resetTest}>
                <ArrowRight className="h-4 w-4" />
                Next Test
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4" />
                Save Result
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
      )}
    </div>
  );
}