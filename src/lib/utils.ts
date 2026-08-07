import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function calculateWPM(
  correctChars: number,
  timeInSeconds: number
): number {
  if (timeInSeconds === 0) return 0;
  return Math.round((correctChars / 5) / (timeInSeconds / 60));
}

export function calculateCPM(
  correctChars: number,
  timeInSeconds: number
): number {
  if (timeInSeconds === 0) return 0;
  return Math.round(correctChars / (timeInSeconds / 60));
}

export function calculateAccuracy(
  correct: number,
  total: number
): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}