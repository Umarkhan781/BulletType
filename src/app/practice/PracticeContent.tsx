"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Settings } from "lucide-react";
import { TypingTest } from "@/components/typing/TypingTest";
import {
  LiquidHoverGroup,
  LiquidHoverItem,
} from "@/components/ui/liquid-hover";
import { cn } from "@/lib/utils";
import {
  COOKIE_CONSENT_EVENT,
  DEFAULT_PRACTICE_PREFS,
  saveTypingPrefs,
  type ExpertDifficultyPref,
  type PracticeMode,
  type PracticeTypingPrefs,
  type WordsDifficultyPref,
} from "@/lib/cookies";
import { isLessonId } from "@/lib/lessons";
import { useLessonProgressStore } from "@/store/useLessonProgressStore";

const WORD_PRESETS = [15, 25, 30, 40] as const;
const TIME_PRESETS = [15, 30, 60, 120] as const;
const RESET_TOAST_MS = 1800;
const TIP_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const RESET_TOOLTIP =
  "Reset typing settings to default: Words, Regular, 30 words, Punctuation OFF, Numbers OFF, Expert OFF, and reset other typing options. Theme, profile, lesson progress, and cookie consent will not be changed.";

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
  if (WORD_PRESETS.includes(value as (typeof WORD_PRESETS)[number])) return value;
  if (value <= 15) return 15;
  if (value <= 25) return 25;
  if (value <= 30) return 30;
  return 40;
}

function placeResetTip(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  const maxWidth = Math.min(288, window.innerWidth - 24);
  const half = maxWidth / 2;
  const centerX = box.left + box.width / 2;
  return {
    x: Math.min(
      window.innerWidth - 12 - half,
      Math.max(12 + half, centerX)
    ),
    y: box.bottom + 8,
  };
}

function ResetSettingsControl({ onReset }: { onReset: () => void }) {
  const tipId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [canHover, setCanHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipX, setTipX] = useState(0);
  const [tipY, setTipY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const showTip = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const next = placeResetTip(el);
    setTipX(next.x);
    setTipY(next.y);
    setTipOpen(true);
  }, []);

  const hideTip = useCallback(() => setTipOpen(false), []);

  useEffect(() => {
    if (!tipOpen) return;
    const update = () => {
      const el = btnRef.current;
      if (!el) return;
      const next = placeResetTip(el);
      setTipX(next.x);
      setTipY(next.y);
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [tipOpen]);

  return (
    <LiquidHoverItem id="reset-settings">
      <button
        ref={btnRef}
        type="button"
        aria-label="Reset typing settings"
        aria-describedby={tipOpen ? tipId : undefined}
        onClick={(e) => {
          onReset();
          hideTip();
          e.currentTarget.blur();
        }}
        onPointerEnter={(event) => {
          if (!canHover || event.pointerType === "touch") return;
          showTip();
        }}
        onPointerLeave={hideTip}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) showTip();
        }}
        onBlur={hideTip}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Reset
      </button>
      {mounted &&
        createPortal(
          <motion.div
            id={tipId}
            role="tooltip"
            aria-hidden={!tipOpen}
            className="pointer-events-none fixed z-[90] w-[min(18rem,calc(100vw-24px))]"
            initial={false}
            animate={{
              opacity: tipOpen ? 1 : 0,
              scale: tipOpen ? 1 : 0.97,
              left: tipX,
              top: tipY,
              y: tipOpen ? 0 : 4,
            }}
            transition={{ duration: 0.16, ease: TIP_EASE }}
            style={{ x: "-50%" }}
          >
            <div className="relative rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-left text-[11px] leading-snug font-medium text-[var(--card-foreground)] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.55)]">
              {RESET_TOOLTIP}
              <span
                className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border-l border-t border-[var(--border)] bg-[var(--card)]"
                aria-hidden="true"
              />
            </div>
          </motion.div>,
          document.body
        )}
    </LiquidHoverItem>
  );
}

function OptionControl({
  id,
  active,
  onClick,
  children,
  ariaPressed,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  ariaPressed?: boolean;
}) {
  return (
    <LiquidHoverItem id={id}>
      <button
        type="button"
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
    </LiquidHoverItem>
  );
}

export function PracticeContent({
  initialPrefs,
}: {
  initialPrefs: PracticeTypingPrefs | null;
}) {
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get("lesson");
  const lesson = lessonParam || "words";
  const recordCompletion = useLessonProgressStore((s) => s.recordCompletion);

  const lessonDifficulty =
    lesson === "home-row" || lesson === "top-row" || lesson === "bottom-row"
      ? "beginner"
      : lesson === "code" || lesson === "paragraphs"
        ? "expert"
        : "intermediate";

  const [limitMode, setLimitMode] = useState<PracticeMode>(
    initialPrefs?.mode ?? DEFAULT_PRACTICE_PREFS.mode
  );
  const [wordsDifficulty, setWordsDifficulty] = useState<WordsDifficultyPref>(
    initialPrefs?.wordsDifficulty ?? DEFAULT_PRACTICE_PREFS.wordsDifficulty
  );
  const [wordPreset, setWordPreset] = useState(
    presetWords(initialPrefs?.wordCount ?? DEFAULT_PRACTICE_PREFS.wordCount)
  );
  const [customWordsApplied, setCustomWordsApplied] = useState(
    Math.min(300, Math.max(1, initialPrefs?.customWords ?? DEFAULT_PRACTICE_PREFS.customWords))
  );
  const [customWordsDraft, setCustomWordsDraft] = useState(
    String(
      Math.min(
        300,
        Math.max(1, initialPrefs?.customWords ?? DEFAULT_PRACTICE_PREFS.customWords)
      )
    )
  );
  const [timePreset, setTimePreset] = useState(
    presetTime(initialPrefs?.timeValue ?? DEFAULT_PRACTICE_PREFS.timeValue)
  );
  const [customSecondsApplied, setCustomSecondsApplied] = useState(
    Math.min(
      600,
      Math.max(5, initialPrefs?.customSeconds ?? DEFAULT_PRACTICE_PREFS.customSeconds)
    )
  );
  const [customSecondsDraft, setCustomSecondsDraft] = useState(
    String(
      Math.min(
        600,
        Math.max(5, initialPrefs?.customSeconds ?? DEFAULT_PRACTICE_PREFS.customSeconds)
      )
    )
  );
  const [customKind, setCustomKind] = useState<"time" | "words">(
    initialPrefs?.customKind ?? DEFAULT_PRACTICE_PREFS.customKind
  );
  const [expert, setExpert] = useState(
    initialPrefs?.expert ?? DEFAULT_PRACTICE_PREFS.expert
  );
  const [punctuation, setPunctuation] = useState(
    initialPrefs?.expert
      ? true
      : (initialPrefs?.punctuation ?? DEFAULT_PRACTICE_PREFS.punctuation)
  );
  const [numbers, setNumbers] = useState(
    initialPrefs?.expert
      ? true
      : (initialPrefs?.numbers ?? DEFAULT_PRACTICE_PREFS.numbers)
  );
  const [expertDifficulty, setExpertDifficulty] =
    useState<ExpertDifficultyPref>(
      initialPrefs?.expertDifficulty ?? DEFAULT_PRACTICE_PREFS.expertDifficulty
    );
  const [testEpoch, setTestEpoch] = useState(0);
  const [resetNotice, setResetNotice] = useState(false);
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
    `r${testEpoch}`,
  ].join("-");

  useEffect(() => {
    if (testEpoch === 0) return;
    setResetNotice(true);
    const timer = window.setTimeout(() => setResetNotice(false), RESET_TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [testEpoch]);

  const resetTypingSettings = () => {
    const next = DEFAULT_PRACTICE_PREFS;
    setLimitMode(next.mode);
    setWordsDifficulty(next.wordsDifficulty);
    setWordPreset(presetWords(next.wordCount));
    setCustomWordsApplied(next.customWords);
    setCustomWordsDraft(String(next.customWords));
    setTimePreset(presetTime(next.timeValue));
    setCustomSecondsApplied(next.customSeconds);
    setCustomSecondsDraft(String(next.customSeconds));
    setCustomKind(next.customKind);
    setExpert(next.expert);
    setPunctuation(next.punctuation);
    setNumbers(next.numbers);
    setExpertDifficulty(next.expertDifficulty);
    setTestStatus("idle");
    setTestEpoch((epoch) => epoch + 1);
  };

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
          className="relative mb-6 flex flex-col items-center gap-2"
          data-typing-options=""
        >
          <LiquidHoverGroup className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1 font-mono">
            <OptionControl
              id="punctuation"
              active={punctuation}
              ariaPressed={punctuation}
              onClick={() => {
                if (expert) return;
                setPunctuation((v) => !v);
              }}
            >
              Punctuation
            </OptionControl>
            <OptionControl
              id="numbers"
              active={numbers}
              ariaPressed={numbers}
              onClick={() => {
                if (expert) return;
                setNumbers((v) => !v);
              }}
            >
              Numbers
            </OptionControl>
            <OptionControl
              id="expert"
              active={expert}
              ariaPressed={expert}
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
              id="mode-time"
              active={limitMode === "time"}
              onClick={() => setLimitMode("time")}
            >
              Time
            </OptionControl>
            <OptionControl
              id="mode-words"
              active={limitMode === "words"}
              onClick={() => setLimitMode("words")}
            >
              Words
            </OptionControl>
            <OptionControl
              id="mode-quote"
              active={limitMode === "quote"}
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
              id="mode-custom"
              active={limitMode === "custom"}
              onClick={() => setLimitMode("custom")}
            >
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
              Custom
            </OptionControl>

            <span
              className="mx-1 hidden h-3.5 w-px bg-[var(--border)] sm:block"
              aria-hidden="true"
            />

            <ResetSettingsControl onReset={resetTypingSettings} />

            {limitMode === "time" && (
              <>
                <span
                  className="mx-1 hidden h-3.5 w-px bg-[var(--border)] sm:block"
                  aria-hidden="true"
                />
                {TIME_PRESETS.map((sec) => (
                  <OptionControl
                    key={sec}
                    id={`time-${sec}`}
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
                    id={`words-${level}`}
                    active={wordsDifficulty === level}
                    onClick={() => setWordsDifficulty(level)}
                  >
                    {level[0]!.toUpperCase() + level.slice(1)}
                  </OptionControl>
                ))}
                <span
                  className="mx-1 hidden h-3.5 w-px bg-[var(--border)] sm:block"
                  aria-hidden="true"
                />
                {WORD_PRESETS.map((count) => (
                  <OptionControl
                    key={count}
                    id={`count-${count}`}
                    active={wordPreset === count}
                    onClick={() => setWordPreset(count)}
                  >
                    {count}
                  </OptionControl>
                ))}
              </>
            )}
          </LiquidHoverGroup>

          {expert && (
            <LiquidHoverGroup className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 font-mono text-[13px]">
              {(["normal", "hard", "extreme"] as const).map((level, index) => (
                <span key={level} className="contents">
                  {index > 0 && (
                    <span
                      className="px-0.5 text-[var(--muted-foreground)]/50"
                      aria-hidden="true"
                    >
                      •
                    </span>
                  )}
                  <OptionControl
                    id={`expert-${level}`}
                    active={expertDifficulty === level}
                    onClick={() => setExpertDifficulty(level)}
                  >
                    {level[0]!.toUpperCase() + level.slice(1)}
                  </OptionControl>
                </span>
              ))}
            </LiquidHoverGroup>
          )}

          {limitMode === "custom" && (
            <LiquidHoverGroup className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[13px]">
              <OptionControl
                id="custom-time"
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
                id="custom-words"
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
            </LiquidHoverGroup>
          )}

          <AnimatePresence>
            {resetNotice && (
              <motion.div
                key={testEpoch}
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 2, scale: 0.98 }}
                transition={{ duration: 0.16, ease: TIP_EASE }}
                className="pointer-events-none absolute left-1/2 top-full z-20 -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-medium text-[var(--primary)] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.45)]"
              >
                Settings reset
              </motion.div>
            )}
          </AnimatePresence>
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
          onComplete={(result) => {
            if (lessonParam && isLessonId(lessonParam)) {
              recordCompletion(lessonParam, result.accuracy);
            }
          }}
        />
      </div>
    </div>
  );
}
