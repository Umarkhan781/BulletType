"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Lesson, LessonLevel } from "@/lib/lessons";
import { ProgressMeter } from "@/components/learn/progress-meter";

const TONE: Record<
  LessonLevel,
  { badge: string; icon: string; bar: string; glow: string }
> = {
  Beginner: {
    badge:
      "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
    icon: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    bar: "bg-emerald-500",
    glow: "group-hover:shadow-[0_18px_40px_-28px_rgba(16,185,129,0.55)]",
  },
  Intermediate: {
    badge:
      "bg-sky-500/12 text-sky-600 dark:text-sky-400 ring-1 ring-inset ring-sky-500/20",
    icon: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
    bar: "bg-sky-500",
    glow: "group-hover:shadow-[0_18px_40px_-28px_rgba(14,165,233,0.5)]",
  },
  Advanced: {
    badge:
      "bg-violet-500/12 text-violet-600 dark:text-violet-400 ring-1 ring-inset ring-violet-500/20",
    icon: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    bar: "bg-violet-500",
    glow: "group-hover:shadow-[0_18px_40px_-28px_rgba(139,92,246,0.5)]",
  },
  All: {
    badge:
      "bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-inset ring-[var(--border)]",
    icon: "bg-[var(--muted)] text-[var(--foreground)]",
    bar: "bg-[var(--primary)]",
    glow: "group-hover:shadow-[0_18px_40px_-28px_color-mix(in_srgb,var(--primary)_55%,transparent)]",
  },
};

export function LessonCard({
  lesson,
  percent,
  index,
}: {
  lesson: Lesson;
  percent: number;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const Icon = lesson.icon;
  const tone = TONE[lesson.level];
  const complete = percent >= 100;

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{
        duration: 0.18,
        delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.18),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <Link
        href={`/practice?lesson=${lesson.id}`}
        className={cn(
          "group relative flex h-full min-h-[13.75rem] flex-col overflow-hidden rounded-[1.25rem] border border-[var(--border)]",
          "bg-[color-mix(in_srgb,var(--card)_92%,transparent)]",
          "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_8%,transparent)]",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--foreground)_18%,var(--border))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          tone.glow
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--foreground)_18%,transparent),transparent)]"
          aria-hidden="true"
        />

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  tone.icon
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.85} aria-hidden="true" />
              </div>
              <h2 className="truncate text-[1.02rem] font-semibold tracking-tight text-[var(--foreground)]">
                {lesson.title}
              </h2>
            </div>
            <span
              className={cn(
                "mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                tone.badge
              )}
            >
              {lesson.level}
            </span>
          </div>

          <p className="mt-3 min-h-[2.75rem] text-sm leading-relaxed text-[var(--muted-foreground)]">
            {lesson.desc}
          </p>

          <div className="mt-5">
            <ProgressMeter
              value={percent}
              toneClass={tone.bar}
              label={`${lesson.title} completion`}
              showCaption
            />
          </div>

          <div className="mt-auto flex items-center justify-between pt-5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)]">
              {complete ? "Practice again" : "Start lesson"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            {complete && (
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
                aria-label="Lesson completed"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
