"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressMeter({
  value,
  toneClass,
  label,
  showCaption = false,
}: {
  value: number;
  toneClass: string;
  label: string;
  showCaption?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
          {clamped}%
          {showCaption && (
            <span className="ml-1.5 text-[12px] font-medium text-[var(--muted-foreground)]">
              completed
            </span>
          )}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <motion.div
          className={cn("h-full rounded-full", toneClass)}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </div>
    </div>
  );
}

export function OverallRing({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - clamped / 100);

  return (
    <div className="relative h-[76px] w-[76px] shrink-0">
      <svg viewBox="0 0 76 76" className="-rotate-90" aria-hidden="true">
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          stroke="color-mix(in srgb, var(--foreground) 10%, transparent)"
          strokeWidth="6"
        />
        <motion.circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }
          }
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}
