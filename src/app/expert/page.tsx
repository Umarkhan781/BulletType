"use client";

import { TypingTest } from "@/components/typing/TypingTest";

export default function ExpertPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Expert Mode
        </h1>
        <p className="mt-2 text-zinc-500">
          Timed tests with full statistics. Timer starts on first keypress.
        </p>
      </div>
      <TypingTest mode="expert" initialTimer={60} wordCount={80} />
    </div>
  );
}
