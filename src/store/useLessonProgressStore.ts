import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { hasCookieConsent } from "@/lib/cookies";
import { LESSONS, isLessonId, type LessonId } from "@/lib/lessons";

export type LessonProgressEntry = {
  completions: number;
  bestAccuracy: number;
};

type LessonProgressState = {
  byId: Partial<Record<LessonId, LessonProgressEntry>>;
  recordCompletion: (lessonId: string, accuracy: number) => void;
  percentFor: (lessonId: string) => number;
  overall: () => { percent: number; completed: number; total: number };
};

const RUNS_FOR_COMPLETE = 3;

export function lessonPercent(entry?: LessonProgressEntry): number {
  if (!entry || entry.completions <= 0) return 0;
  return Math.min(100, Math.round((entry.completions / RUNS_FOR_COMPLETE) * 100));
}

const consentStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    try {
      if (hasCookieConsent()) return localStorage.getItem(name);
      return sessionStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      if (hasCookieConsent()) localStorage.setItem(name, value);
      else sessionStorage.setItem(name, value);
    } catch {
      // ignore private-mode failures
    }
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export const useLessonProgressStore = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      byId: {},
      recordCompletion: (lessonId, accuracy) => {
        if (!isLessonId(lessonId)) return;
        const safeAccuracy = Math.max(0, Math.min(100, Math.round(accuracy)));
        set((state) => {
          const prev = state.byId[lessonId];
          return {
            byId: {
              ...state.byId,
              [lessonId]: {
                completions: (prev?.completions ?? 0) + 1,
                bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, safeAccuracy),
              },
            },
          };
        });
      },
      percentFor: (lessonId) => {
        if (!isLessonId(lessonId)) return 0;
        return lessonPercent(get().byId[lessonId]);
      },
      overall: () => {
        const percents = LESSONS.map((lesson) =>
          lessonPercent(get().byId[lesson.id])
        );
        const completed = percents.filter((value) => value >= 100).length;
        const percent =
          percents.length === 0
            ? 0
            : Math.round(
                percents.reduce((sum, value) => sum + value, 0) / percents.length
              );
        return { percent, completed, total: LESSONS.length };
      },
    }),
    {
      name: "bt-lesson-progress",
      storage: createJSONStorage(() => consentStorage),
    }
  )
);
