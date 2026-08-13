import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Braces,
  CaseUpper,
  Code2,
  Hash,
  Keyboard,
  Pilcrow,
  Text,
} from "lucide-react";

export type LessonLevel = "Beginner" | "Intermediate" | "Advanced" | "All";

export type LessonId =
  | "home-row"
  | "top-row"
  | "bottom-row"
  | "capitals"
  | "numbers"
  | "symbols"
  | "words"
  | "sentences"
  | "paragraphs"
  | "code";

export interface Lesson {
  id: LessonId;
  title: string;
  desc: string;
  icon: LucideIcon;
  level: LessonLevel;
}

export const LESSONS: Lesson[] = [
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
    icon: ArrowUpFromLine,
    level: "Beginner",
  },
  {
    id: "bottom-row",
    title: "Bottom Row",
    desc: "Complete the layout with zxcv bnm",
    icon: ArrowDownToLine,
    level: "Beginner",
  },
  {
    id: "capitals",
    title: "Capital Letters",
    desc: "Shift key control and accuracy",
    icon: CaseUpper,
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
    icon: Text,
    level: "All",
  },
  {
    id: "paragraphs",
    title: "Paragraphs",
    desc: "Long-form typing endurance",
    icon: Pilcrow,
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

export const LESSON_IDS = new Set(LESSONS.map((lesson) => lesson.id));

export function isLessonId(value: string): value is LessonId {
  return LESSON_IDS.has(value as LessonId);
}
