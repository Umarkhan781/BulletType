"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { LESSONS } from "@/lib/lessons";
import { lessonPercent, useLessonProgressStore } from "@/store/useLessonProgressStore";
import { LearnHero } from "@/components/learn/learn-hero";
import { LessonCard } from "@/components/learn/lesson-card";
import { LessonFilters, type LessonFilter } from "@/components/learn/lesson-filters";

export default function LearnPage() {
  const [filter, setFilter] = useState<LessonFilter>("All");
  const byId = useLessonProgressStore((s) => s.byId);

  const overall = useMemo(() => {
    const percents = LESSONS.map((lesson) => lessonPercent(byId[lesson.id]));
    const completed = percents.filter((value) => value >= 100).length;
    const percent =
      percents.length === 0
        ? 0
        : Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length);
    return { percent, completed, total: LESSONS.length };
  }, [byId]);

  const visible = useMemo(
    () =>
      filter === "All"
        ? LESSONS
        : LESSONS.filter((lesson) => lesson.level === filter),
    [filter]
  );

  return (
    <div className="learn-shell relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-11">
        <LearnHero
          percent={overall.percent}
          completed={overall.completed}
          total={overall.total}
        />

        <div className="mt-8 mb-6">
          <LessonFilters value={filter} onChange={setFilter} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
          <AnimatePresence mode="popLayout">
            {visible.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                percent={lessonPercent(byId[lesson.id])}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
