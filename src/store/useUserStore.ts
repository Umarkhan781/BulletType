"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { UserProfile, TestResult } from "@/types";

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  recentTests: TestResult[];
  setUser: (user: UserProfile | null) => void;
  addTestResult: (result: TestResult) => void;
  updateStats: (stats: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
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
            (state.user.averageWpm * state.user.totalTests + result.wpm) / totalTests
          );
          const accuracy =
            Math.round(
              ((state.user.accuracy * state.user.totalTests + result.accuracy) / totalTests) * 10
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

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, recentTests: [] });
      },

      initializeAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Try to load profile from database
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const userProfile: UserProfile = {
            id: session.user.id,
            username: profile?.username || session.user.email?.split("@")[0] || "user",
            name: profile?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
            bio: profile?.bio || "",
            country: profile?.country || "",
            
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            totalTests: profile?.total_tests || 0,
            practiceTime: profile?.practice_time || 0,
            averageWpm: profile?.average_wpm || 0,
            highestWpm: profile?.highest_wpm || 0,
            accuracy: profile?.accuracy || 0,
            dailyStreak: profile?.daily_streak || 0,
            badges: profile?.badges || [],
            achievements: profile?.achievements || [],
            createdAt: profile?.created_at ? new Date(profile.created_at).getTime() : Date.now(),
          };

          set({ user: userProfile, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "typing-master-user",
    }
  )
);