"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { recordSiteVisit } from "@/lib/visits";
import type { UserProfile, TestResult } from "@/types";

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  recentTests: TestResult[];
  setUser: (user: UserProfile | null) => void;
  addTestResult: (result: TestResult) => void;
  updateStats: (stats: Partial<UserProfile>) => void;
  updateProfile: (data: {
    name: string;
    username: string;
  }) => Promise<{ error: string | null }>;
  updateAvatar: (file: File) => Promise<{ error: string | null }>;
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

      updateProfile: async ({ name, username }) => {
        const current = get().user;
        if (!current) return { error: "Not logged in." };

        const cleanName = name.trim();
        const cleanUsername = username.trim().replace(/^@/, "");

        if (!cleanName || !cleanUsername) {
          return { error: "Full name and username are required." };
        }
        if (cleanUsername.length < 3) {
          return { error: "Username must be at least 3 characters." };
        }

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: current.id,
          full_name: cleanName,
          username: cleanUsername,
        });

        if (profileError) {
          return { error: profileError.message };
        }

        // Keep auth metadata in sync (used as fallback on login)
        await supabase.auth.updateUser({
          data: {
            full_name: cleanName,
            username: cleanUsername,
          },
        });

        set({
          user: {
            ...current,
            name: cleanName,
            username: cleanUsername,
          },
        });

        return { error: null };
      },

      updateAvatar: async (file) => {
        const current = get().user;
        if (!current) return { error: "Not logged in." };

        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(file.type)) {
          return { error: "Use a JPG, PNG, WebP, or GIF image." };
        }
        if (file.size > 2 * 1024 * 1024) {
          return { error: "Image must be under 2MB." };
        }

        const ext =
          file.type === "image/png"
            ? "png"
            : file.type === "image/webp"
              ? "webp"
              : file.type === "image/gif"
                ? "gif"
                : "jpg";
        const path = `${current.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: "3600",
          });

        if (uploadError) {
          return { error: uploadError.message };
        }

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        // Bust browser cache after re-upload
        const avatarUrl = `${publicData.publicUrl}?t=${Date.now()}`;

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: current.id,
          avatar_url: avatarUrl,
          username: current.username,
          full_name: current.name,
        });

        if (profileError) {
          return { error: profileError.message };
        }

        await supabase.auth.updateUser({
          data: { avatar_url: avatarUrl },
        });

        set({
          user: {
            ...current,
            avatar: avatarUrl,
          },
        });

        return { error: null };
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, recentTests: [] });
      },

      initializeAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const metaUsername =
              (typeof meta.username === "string" && meta.username.trim()) ||
              session.user.email?.split("@")[0] ||
              "user";
            const metaFullName =
              (typeof meta.full_name === "string" && meta.full_name.trim()) ||
              metaUsername ||
              "User";

            // maybeSingle avoids throwing when no profile row exists yet
            let { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();

            // Create / backfill profile from signup metadata if missing
            if (!profile) {
              await supabase.from("profiles").upsert({
                id: session.user.id,
                username: metaUsername,
                full_name: metaFullName,
              });
              const refreshed = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .maybeSingle();
              profile = refreshed.data;
            } else if (
              (!profile.username || !profile.full_name) &&
              (meta.username || meta.full_name)
            ) {
              await supabase
                .from("profiles")
                .update({
                  username: profile.username || metaUsername,
                  full_name: profile.full_name || metaFullName,
                })
                .eq("id", session.user.id);
              profile = {
                ...profile,
                username: profile.username || metaUsername,
                full_name: profile.full_name || metaFullName,
              };
            }

            const userProfile: UserProfile = {
              id: session.user.id,
              username: profile?.username || metaUsername,
              name: profile?.full_name || metaFullName,
              email: session.user.email || "",
              avatar:
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
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
              createdAt: profile?.created_at
                ? new Date(profile.created_at).getTime()
                : Date.now(),
            };

            set({ user: userProfile, isAuthenticated: true });

            // Track visit / last seen for admin analytics (non-blocking)
            void recordSiteVisit(session.user.id);
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          // Keep any existing local user if network/profile fetch fails mid-session
          const existing = get().user;
          if (!existing) {
            set({ user: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: "typing-master-user",
    }
  )
);