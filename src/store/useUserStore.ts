import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, TestResult } from "@/types";

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  recentTests: TestResult[];
  setUser: (user: UserProfile | null) => void;
  addTestResult: (result: TestResult) => void;
  updateStats: (stats: Partial<UserProfile>) => void;
  logout: () => void;
}

const mockUser: UserProfile = {
  id: "user-1",
  username: "speedtyper",
  name: "Alex Chen",
  email: "alex@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  bio: "Chasing 150 WPM 🚀",
  country: "US",
  xp: 2450,
  level: 12,
  totalTests: 87,
  practiceTime: 340,
  averageWpm: 78,
  highestWpm: 112,
  accuracy: 96.4,
  dailyStreak: 5,
  badges: ["first-test", "50-wpm", "75-wpm", "7-day-streak"],
  achievements: ["First Test", "50 WPM", "75 WPM", "7-Day Streak"],
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: mockUser,
      isAuthenticated: true,
      recentTests: [],
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),
      addTestResult: (result) =>
        set((state) => {
          const newTests = [result, ...state.recentTests].slice(0, 20);
          if (!state.user) return { recentTests: newTests };

          const totalTests = state.user.totalTests + 1;
          const highestWpm = Math.max(state.user.highestWpm, result.wpm);
          const averageWpm = Math.round(
            (state.user.averageWpm * state.user.totalTests + result.wpm) /
              totalTests
          );
          const accuracy = Math.round(
            ((state.user.accuracy * state.user.totalTests + result.accuracy) /
              totalTests) *
              10
          ) / 10;

          return {
            recentTests: newTests,
            user: {
              ...state.user,
              totalTests,
              highestWpm,
              averageWpm,
              accuracy,
              xp: state.user.xp + Math.round(result.wpm * (result.accuracy / 100)),
            },
          };
        }),
      updateStats: (stats) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...stats } : null,
        })),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "typing-master-user",
    }
  )
);