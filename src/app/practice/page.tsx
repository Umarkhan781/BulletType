"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TypingTest } from "@/components/typing/TypingTest";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESET_COUNTS = [10, 15, 20, 30] as const;

function PracticeContent() {
  const searchParams = useSearchParams();
  const lesson = searchParams.get("lesson") || "words";

  const mode =
    lesson === "home-row" || lesson === "top-row" || lesson === "bottom-row"
      ? "beginner"
      : lesson === "code" || lesson === "paragraphs"
        ? "expert"
        : "intermediate";

  const [selected, setSelected] = useState<number | "custom">(15);
  const [customCount, setCustomCount] = useState(25);

  const wordCount = useMemo(() => {
    if (selected === "custom") {
      const n = Math.floor(Number(customCount));
      if (!Number.isFinite(n)) return 15;
      return Math.min(200, Math.max(1, n));
    }
    return selected;
  }, [selected, customCount]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl capitalize">
          Practice — {lesson.replace("-", " ")}
        </h1>
        <p className="mt-2 text-zinc-500">
          Focused practice mode. Choose how many words to type.
        </p>
      </div>

      {/* Word count options */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-zinc-500">
          Word count
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PRESET_COUNTS.map((count) => (
            <Button
              key={count}
              type="button"
              size="sm"
              variant={selected === count ? "default" : "outline"}
              onClick={(e) => {
                setSelected(count);
                // Release focus so typing keys go to the test immediately
                e.currentTarget.blur();
              }}
              className={cn(selected === count && "shadow-md")}
            >
              {count} words
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={selected === "custom" ? "default" : "outline"}
            onClick={(e) => {
              setSelected("custom");
              // Keep focus only when opening custom field; typing test still
              // captures keys when custom input is not focused
              e.currentTarget.blur();
            }}
          >
            Custom
          </Button>
        </div>

        {selected === "custom" && (
          <div className="flex items-center gap-2 mt-1">
            <label htmlFor="custom-word-count" className="text-sm text-zinc-500">
              Words:
            </label>
            <input
              id="custom-word-count"
              type="number"
              min={1}
              max={200}
              value={customCount}
              onChange={(e) => setCustomCount(Number(e.target.value))}
              className="w-24 rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <span className="text-xs text-zinc-500">(1–200)</span>
          </div>
        )}

        <p className="text-xs text-zinc-500">
          Active: <span className="font-mono text-blue-400">{wordCount}</span>{" "}
          words — start typing anytime (no need to click the box)
        </p>
      </div>

      <TypingTest
        key={`${lesson}-${wordCount}`}
        mode={mode}
        initialTimer={60}
        wordCount={wordCount}
      />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
