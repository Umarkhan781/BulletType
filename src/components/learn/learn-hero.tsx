"use client";

import { BookOpen } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { OverallRing, ProgressMeter } from "@/components/learn/progress-meter";

export function LearnHero({
  percent,
  completed,
  total,
}: {
  percent: number;
  completed: number;
  total: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
      <motion.div
        className="max-w-xl"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Learn
        </p>
        <h1 className="text-balance text-[clamp(1.85rem,1.3rem+2vw,2.65rem)] font-semibold leading-[1.12] tracking-tight text-[var(--foreground)]">
          Learn Touch Typing
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          Build accuracy, muscle memory, and speed through structured lessons.
        </p>
      </motion.div>

      <motion.aside
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: reduceMotion ? 0 : 0.04, ease: "easeOut" }}
        className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_88%,transparent)] px-4 py-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_8%,transparent)] sm:max-w-md lg:w-[27rem]"
      >
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[var(--primary)]/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4">
          <OverallRing value={percent} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight">Overall Progress</p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {completed} of {total} lessons completed
            </p>
            <div className="mt-3">
              <ProgressMeter
                value={percent}
                toneClass="bg-[var(--primary)]"
                label="Overall lesson progress"
              />
            </div>
          </div>
        </div>
      </motion.aside>
    </section>
  );
}
