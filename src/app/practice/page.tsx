"use client";

import { useSearchParams } from "next/navigation";
import { TypingTest } from "@/components/typing/TypingTest";
import { Suspense } from "react";

function PracticeContent() {
  const searchParams = useSearchParams();
  const lesson = searchParams.get("lesson") || "words";

  const mode =
    lesson === "home-row" || lesson === "top-row" || lesson === "bottom-row"
      ? "beginner"
      : lesson === "code" || lesson === "paragraphs"
      ? "expert"
      : "intermediate";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl capitalize">
          Practice — {lesson.replace("-", " ")}
        </h1>
        <p className="mt-2 text-zinc-500">
          Focused practice mode. No timer pressure unless you choose Expert.
        </p>
      </div>
      <TypingTest mode={mode} initialTimer={60} wordCount={40} />
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
