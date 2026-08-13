export type Theme =
  | "dark"
  | "light"
  | "ocean"
  | "forest"
  | "sunset"
  | "lavender"
  | "midnight"
  | "rose"
  | "emerald"
  | "mono"
  | "system";

export type Difficulty = "beginner" | "intermediate" | "expert";

export type TimerOption = 15 | 30 | 60 | 120 | "custom";

export interface TypingStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  mistakes: number;
  charactersTyped: number;
  backspaces: number;
  consistency: number;
  bestSpeed: number;
  averageSpeed: number;
  timeElapsed: number;
  remainingTime: number;
}

export interface TestResult extends TypingStats {
  id: string;
  mode: Difficulty;
  duration: number;
  text: string;
  timestamp: number;
  language?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  country?: string;
  xp: number;
  level: number;
  totalTests: number;
  practiceTime: number; // minutes
  averageWpm: number;
  highestWpm: number;
  accuracy: number;
  dailyStreak: number;
  badges: string[];
  achievements: string[];
  createdAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  country: string;
  wpm: number;
  accuracy: number;
  xp: number;
  avatar?: string;
}

export interface Settings {
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  cursorStyle: "block" | "underline" | "line";
  keyboardSounds: boolean;
  errorSounds: boolean;
  volume: number;
  defaultTimer: TimerOption;
  wordDifficulty: Difficulty;
  language: string;
  punctuation: boolean;
  numbers: boolean;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  smoothCaret: boolean;
  blindMode: boolean;
}

export interface WordSet {
  id: string;
  name: string;
  category: string;
  words: string[];
  difficulty: Difficulty;
}