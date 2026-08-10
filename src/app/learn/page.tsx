"use client";

import Link from "next/link";
import {
  Keyboard,
  Hash,
  Type,
  Braces,
  AlignLeft,
  Code2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Level = "Beginner" | "Intermediate" | "All" | "Advanced";

const lessons: {
  id: string;
  title: string;
  desc: string;
  icon: typeof Keyboard;
  level: Level;
}[] = [
  {
    id: "home-row",
    title: "Home Row",
    desc: "Master the foundation keys: asdf jkl;",
    icon: Keyboard,
    level: "Beginner",
  },
  {
    id: "top-row",
    title: "Top Row",
    desc: "Build speed on qwerty uiop",
    icon: Keyboard,
    level: "Beginner",
  },
  {
    id: "bottom-row",
    title: "Bottom Row",
    desc: "Complete the layout with zxcv bnm",
    icon: Keyboard,
    level: "Beginner",
  },
  {
    id: "capitals",
    title: "Capital Letters",
    desc: "Shift key control and accuracy",
    icon: Type,
    level: "Intermediate",
  },
  {
    id: "numbers",
    title: "Numbers",
    desc: "Type 1234567890 with confidence",
    icon: Hash,
    level: "Intermediate",
  },
  {
    id: "symbols",
    title: "Symbols",
    desc: "Punctuation and special characters",
    icon: Braces,
    level: "Intermediate",
  },
  {
    id: "words",
    title: "Common Words",
    desc: "High-frequency vocabulary practice",
    icon: AlignLeft,
    level: "All",
  },
  {
    id: "sentences",
    title: "Sentences",
    desc: "Full sentences with natural flow",
    icon: AlignLeft,
    level: "All",
  },
  {
    id: "paragraphs",
    title: "Paragraphs",
    desc: "Long-form typing endurance",
    icon: AlignLeft,
    level: "Advanced",
  },
  {
    id: "code",
    title: "Programming Code",
    desc: "JS, Python, HTML, CSS, and SQL",
    icon: Code2,
    level: "Advanced",
  },
];

const levelStyles: Record<
  Level,
  { badge: string; iconWrap: string; accent: string }
> = {
  Beginner: {
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
    iconWrap:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/15",
    accent: "group-hover:border-emerald-500/30 group-hover:shadow-emerald-500/5",
  },
  Intermediate: {
    badge:
      "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-inset ring-sky-500/20",
    iconWrap:
      "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-inset ring-sky-500/15",
    accent: "group-hover:border-sky-500/30 group-hover:shadow-sky-500/5",
  },
  All: {
    badge:
      "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 ring-1 ring-inset ring-zinc-500/20",
    iconWrap:
      "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 ring-1 ring-inset ring-zinc-500/15",
    accent: "group-hover:border-zinc-400/30 group-hover:shadow-zinc-500/5",
  },
  Advanced: {
    badge:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-inset ring-violet-500/20",
    iconWrap:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-inset ring-violet-500/15",
    accent: "group-hover:border-violet-500/30 group-hover:shadow-violet-500/5",
  },
};

const levelOrder: Level[] = ["Beginner", "Intermediate", "All", "Advanced"];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Level legend */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {levelOrder.map((level) => (
          <span
            key={level}
            className={cn(
              "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
              levelStyles[level].badge
            )}
          >
            {level}
          </span>
        ))}
      </div>

      {/* Lesson grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {lessons.map((lesson) => {
          const Icon = lesson.icon;
          const styles = levelStyles[lesson.level];

          return (
            <Link
              key={lesson.id}
              href={`/practice?lesson=${lesson.id}`}
              className={cn(
                "group relative flex h-full flex-col rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-200",
                "dark:border-white/[0.08] dark:bg-zinc-900/60 dark:shadow-none",
                "hover:-translate-y-0.5 hover:shadow-md dark:hover:bg-zinc-900/90",
                styles.accent
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-lg",
                    styles.iconWrap
                  )}
                >
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={1.75} />
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide",
                    styles.badge
                  )}
                >
                  {lesson.level}
                </span>
              </div>

              <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {lesson.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {lesson.desc}
              </p>

              <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Start lesson
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
