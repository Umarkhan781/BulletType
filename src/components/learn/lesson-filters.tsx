"use client";

import { LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type LessonFilter = "All" | "Beginner" | "Intermediate" | "Advanced";

const FILTERS: LessonFilter[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const DOT: Record<Exclude<LessonFilter, "All">, string> = {
  Beginner: "bg-emerald-500",
  Intermediate: "bg-sky-500",
  Advanced: "bg-violet-500",
};

export function LessonFilters({
  value,
  onChange,
}: {
  value: LessonFilter;
  onChange: (next: LessonFilter) => void;
}) {
  return (
    <div
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_80%,transparent)] p-1"
      role="tablist"
      aria-label="Lesson difficulty"
    >
      {FILTERS.map((item) => {
        const active = value === item;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item)}
            className={cn(
              "relative isolate inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium",
              "text-[var(--muted-foreground)] transition-colors duration-200",
              "hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              active && "text-[var(--foreground)]"
            )}
          >
            {active && (
              <motion.span
                layoutId="learn-filter-pill"
                className="absolute inset-0 -z-10 rounded-full bg-[var(--muted)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_8%,transparent)]"
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.4 }}
              />
            )}
            {item === "All" ? (
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <span
                className={cn("h-1.5 w-1.5 rounded-full", DOT[item])}
                aria-hidden="true"
              />
            )}
            {item}
          </button>
        );
      })}
    </div>
  );
}
