"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { UserProfile, TestResult } from "@/types";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function defaultAvatarUrl(userId: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userId)}`;
}

function isCustomAvatar(url?: string | null) {
  if (!url) return false;
  return !url.includes("api.dicebear.com");
}

function guessImageType(file: File): { mime: string; ext: string } | null {
  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  if (file.type && byMime[file.type]) {
    return { mime: file.type === "image/jpg" ? "image/jpeg" : file.type, ext: byMime[file.type] };
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return { mime: "image/png", ext: "png" };
  if (name.endsWith(".webp")) return { mime: "image/webp", ext: "webp" };
  if (name.endsWith(".gif")) return { mime: "image/gif", ext: "gif" };
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return { mime: "image/jpeg", ext: "jpg" };
  return null;
}

async function clearUserAvatarFiles(userId: string) {
  const { data: listed, error: listError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(userId, { limit: 100 });

  if (listError || !listed?.length) return;

  const paths = listed
    .filter((f) => f.name && !f.name.endsWith("/"))
    .map((f) => `${userId}/${f.name}`);

  if (paths.length) {
    await supabase.storage.from(AVATAR_BUCKET).remove(paths);
  }
}

function storageSetupHint(message: string) {
  if (
    /bucket not found|not found|row-level security|policy|unauthorized|permission|jwt/i.test(
      message
    )
  ) {
    return `${message} — Run supabase/fix-avatars-storage.sql in the Supabase SQL Editor, then try again.`;
  }
  return message;
}

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
  removeAvatar: () => Promise<{ error: string | null }>;
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

      addTestResult: (result) => {
        const currentUser = get().user;
        const recentTests = [result, ...get().recentTests].slice(0, 20);

        if (!currentUser) {
          set({ recentTests });
          return;
        }

        const totalTests = currentUser.totalTests + 1;
        const highestWpm = Math.max(currentUser.highestWpm, result.wpm);
        const averageWpm = Math.round(
          (currentUser.averageWpm * currentUser.totalTests + result.wpm) /
            totalTests
        );
        const accuracy =
          Math.round(
            ((currentUser.accuracy * currentUser.totalTests + result.accuracy) /
              totalTests) *
              10
          ) / 10;
        const practiceTime =
          currentUser.practiceTime + Math.max(1, Math.ceil(result.timeElapsed / 60));
        const xp =
          currentUser.xp + Math.round(result.wpm * (result.accuracy / 100));
        const updatedUser = {
          ...currentUser,
          totalTests,
          highestWpm,
          averageWpm,
          accuracy,
          practiceTime,
          xp,
        };

        // Keep the UI immediate, then persist the same progress for Dashboard
        // and Profile after a refresh or a later sign-in.
        set({ recentTests, user: updatedUser });

        void supabase
          .from("profiles")
          .update({
            total_tests: totalTests,
            highest_wpm: highestWpm,
            average_wpm: averageWpm,
            accuracy,
            practice_time: practiceTime,
            xp,
          })
          .eq("id", currentUser.id)
          .then(({ error }) => {
            if (error) {
              console.warn("[progress] failed to save:", error.message);
            }
          });
      },

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

        // Prefer update of existing row; insert only if missing
        const { data: updatedRows, error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: cleanName,
            username: cleanUsername,
          })
          .eq("id", current.id)
          .select("id");

        let profileError = updateError;

        if (!profileError && (!updatedRows || updatedRows.length === 0)) {
          const { error: insertError } = await supabase.from("profiles").insert({
            id: current.id,
            full_name: cleanName,
            username: cleanUsername,
          });
          profileError = insertError;
        }

        if (profileError) {
          const msg = profileError.message || "Failed to update profile.";
          // Common misconfigured Supabase schema (profiles.id as bigint)
          if (/bigint/i.test(msg) && /uuid|invalid input syntax/i.test(msg)) {
            return {
              error:
                "Database profile id type is wrong (bigint vs uuid). Run supabase/fix-profiles-uuid.sql in the Supabase SQL Editor, then try again.",
            };
          }
          if (/duplicate key|unique/i.test(msg)) {
            return { error: "That username is already taken." };
          }
          return { error: msg };
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

        void import("@/lib/activity").then(({ logUserAction }) =>
          logUserAction({
            actionType: "profile_update",
            path: "/profile",
            userId: current.id,
            details: `Name/username → ${cleanName} / @${cleanUsername}`,
          })
        );

        return { error: null };
      },

      updateAvatar: async (file) => {
        const current = get().user;
        if (!current) return { error: "Not logged in." };

        const kind = guessImageType(file);
        if (!kind) {
          return { error: "Use a JPG, PNG, WebP, or GIF image." };
        }
        if (file.size > MAX_AVATAR_BYTES) {
          return { error: "Image must be under 2MB." };
        }

        // Ensure session is fresh so storage RLS sees auth.uid()
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          return { error: "Session expired. Please log in again." };
        }

        // Clear previous files so replace works even without upsert policies
        await clearUserAvatarFiles(current.id);

        const path = `${current.id}/avatar.${kind.ext}`;
        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(path, file, {
            upsert: true,
            contentType: kind.mime,
            cacheControl: "3600",
          });

        if (uploadError) {
          return { error: storageSetupHint(uploadError.message) };
        }

        const { data: publicData } = supabase.storage
          .from(AVATAR_BUCKET)
          .getPublicUrl(path);

        // Bust browser / CDN cache after re-upload
        const avatarUrl = `${publicData.publicUrl}?t=${Date.now()}`;

        const { data: updatedRows, error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: avatarUrl })
          .eq("id", current.id)
          .select("id");

        let profileError = updateError;
        if (!profileError && (!updatedRows || updatedRows.length === 0)) {
          const { error: insertError } = await supabase.from("profiles").insert({
            id: current.id,
            avatar_url: avatarUrl,
            username: current.username,
            full_name: current.name,
          });
          profileError = insertError;
        }

        if (profileError) {
          const msg = profileError.message || "Failed to save avatar on profile.";
          if (/bigint/i.test(msg) && /uuid|invalid input syntax/i.test(msg)) {
            return {
              error:
                "Database profile id type is wrong (bigint vs uuid). Run supabase/fix-profiles-uuid.sql in the Supabase SQL Editor, then try again.",
            };
          }
          return { error: storageSetupHint(msg) };
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

        void import("@/lib/activity").then(({ logUserAction }) =>
          logUserAction({
            actionType: "avatar_update",
            path: "/profile",
            userId: current.id,
            details: "Uploaded profile photo",
          })
        );

        return { error: null };
      },

      removeAvatar: async () => {
        const current = get().user;
        if (!current) return { error: "Not logged in." };

        if (!isCustomAvatar(current.avatar)) {
          return { error: "No custom profile photo to remove." };
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          return { error: "Session expired. Please log in again." };
        }

        // Best-effort storage cleanup (profile row still cleared if this fails)
        await clearUserAvatarFiles(current.id);

        const fallback = defaultAvatarUrl(current.id);

        const { data: updatedRows, error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", current.id)
          .select("id");

        let profileError = updateError;
        if (!profileError && (!updatedRows || updatedRows.length === 0)) {
          const { error: insertError } = await supabase.from("profiles").insert({
            id: current.id,
            avatar_url: null,
            username: current.username,
            full_name: current.name,
          });
          profileError = insertError;
        }

        if (profileError) {
          return { error: storageSetupHint(profileError.message || "Failed to remove photo.") };
        }

        await supabase.auth.updateUser({
          data: { avatar_url: null },
        });

        set({
          user: {
            ...current,
            avatar: fallback,
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
              avatar: profile?.avatar_url || defaultAvatarUrl(session.user.id),
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
            // Site visits + live presence are handled in Navbar (skipped on /adminumar7811)
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
