"use client";

import Link from "next/link";
// motion optional
import {
  Keyboard,
  Hash,
  Type,
  Braces,
  AlignLeft,
  Code2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const lessons = [
  { id: "home-row", title: "Home Row", desc: "asdf jkl;", icon: Keyboard, level: "Beginner", color: "from-emerald-500 to-teal-500" },
  { id: "top-row", title: "Top Row", desc: "qwerty uiop", icon: Keyboard, level: "Beginner", color: "from-blue-500 to-cyan-500" },
  { id: "bottom-row", title: "Bottom Row", desc: "zxcv bnm", icon: Keyboard, level: "Beginner", color: "from-violet-500 to-purple-500" },
  { id: "capitals", title: "Capital Letters", desc: "Shift key mastery", icon: Type, level: "Intermediate", color: "from-amber-500 to-orange-500" },
  { id: "numbers", title: "Numbers", desc: "1234567890", icon: Hash, level: "Intermediate", color: "from-pink-500 to-rose-500" },
  { id: "symbols", title: "Symbols", desc: "!@#$%^&*()", icon: Braces, level: "Intermediate", color: "from-indigo-500 to-blue-500" },
  { id: "words", title: "Common Words", desc: "High-frequency vocabulary", icon: AlignLeft, level: "All", color: "from-cyan-500 to-teal-500" },
  { id: "sentences", title: "Sentences", desc: "Full sentences & punctuation", icon: AlignLeft, level: "All", color: "from-green-500 to-emerald-500" },
  { id: "paragraphs", title: "Paragraphs", desc: "Long-form typing endurance", icon: AlignLeft, level: "Advanced", color: "from-red-500 to-orange-500" },
  { id: "code", title: "Programming Code", desc: "JS, Python, HTML, CSS, SQL", icon: Code2, level: "Advanced", color: "from-fuchsia-500 to-pink-500" },
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Learn Typing
        </h1>
        <p className="mt-2 text-zinc-500 max-w-xl mx-auto">
          Structured path from home row to full keyboard and programming languages.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, i) => {
          const Icon = lesson.icon;
          return (
            <div
              key={lesson.id}
             
             
             
            >
              <Link
                href={`/practice?lesson=${lesson.id}`}
                className="glass group flex flex-col rounded-2xl p-6 transition-all hover:border-blue-500/40 hover:bg-white/10 h-full"
              >
                <div className={`mb-4 inline-flex w-fit rounded-xl bg-gradient-to-br ${lesson.color} p-3 text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{lesson.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    {lesson.level}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500 flex-1">{lesson.desc}</p>
                <div className="mt-4 flex items-center text-sm text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start lesson <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
