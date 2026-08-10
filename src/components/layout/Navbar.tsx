"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Keyboard,
  Zap,
  LayoutDashboard,
  Trophy,
  User,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { applyThemeClass, useSettingsStore } from "@/store/useSettingsStore";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home, id: "home" },
  { href: "/learn", label: "Learn", icon: BookOpen, id: "learn" },
  { href: "/practice", label: "Practice", icon: Keyboard, id: "practice" },
  { href: "/expert", label: "Expert", icon: Zap, id: "expert" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, id: "leaderboard" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useSettingsStore();
 const { user, isAuthenticated, initializeAuth } = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [guestUsername, setGuestUsername] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Assign persistent guest username once (stays same after refresh/reopen)
    if (!isAuthenticated) {
      void import("@/lib/guestIdentity").then(({ getOrCreateGuestUsername }) => {
        setGuestUsername(getOrCreateGuestUsername());
      });
    }
  }, [isAuthenticated]);

  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        // Defer so we don't call getSession inside the auth callback (Supabase race)
        setTimeout(() => {
          void initializeAuth();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [initializeAuth]);

  // Visits + live presence + optional location: only on non-admin pages
  useEffect(() => {
    if (isAdminRoute) return;

    let stopPresence: (() => void) | undefined;

    void (async () => {
      const { recordSiteVisit } = await import("@/lib/visits");
      const { startPresenceTracking } = await import("@/lib/presence");
      const { logUserAction } = await import("@/lib/activity");
      const { requestUserLocation } = await import("@/lib/location");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? user?.id ?? null;

      // Optional location (browser asks once; denied users stay private)
      await requestUserLocation();

      await recordSiteVisit(uid);
      stopPresence = startPresenceTracking(uid);

      await logUserAction({
        actionType: "site_visit",
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        userId: uid,
        details: uid ? "registered" : "guest",
      });
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setTimeout(async () => {
          const { recordSiteVisit } = await import("@/lib/visits");
          const { startPresenceTracking } = await import("@/lib/presence");
          const { logUserAction } = await import("@/lib/activity");
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const uid = session?.user?.id ?? null;
          await recordSiteVisit(uid);
          stopPresence?.();
          stopPresence = startPresenceTracking(uid);
          await logUserAction({
            actionType: "login",
            path: typeof window !== "undefined" ? window.location.pathname : "/",
            userId: uid,
            details: "signed in",
          });
        }, 0);
      }
      if (event === "SIGNED_OUT") {
        setTimeout(() => {
          void (async () => {
            const { startPresenceTracking } = await import("@/lib/presence");
            const { logUserAction } = await import("@/lib/activity");
            await logUserAction({
              actionType: "logout",
              path:
                typeof window !== "undefined" ? window.location.pathname : "/",
              userId: null,
              details: "signed out",
            });
            stopPresence?.();
            stopPresence = startPresenceTracking(null);
          })();
        }, 0);
      }
    });

    return () => {
      stopPresence?.();
      subscription.unsubscribe();
    };
  }, [isAdminRoute, user?.id]);

  // Log page views when navigating (non-admin)
  useEffect(() => {
    if (isAdminRoute || !pathname) return;

    void (async () => {
      const { logUserAction } = await import("@/lib/activity");
      await logUserAction({
        actionType: "page_view",
        path: pathname,
        userId: user?.id ?? null,
        details: `Opened ${pathname}`,
      });
    })();
  }, [isAdminRoute, pathname, user?.id]);

  const toggleTheme = () => {
    // Cycle: dark → light → dark (dark is product default)
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyThemeClass(next);
  };

  useEffect(() => {
    if (!mounted) return;
    // If old "system" is still in memory, normalize to dark
    if (theme === "system") {
      setTheme("dark");
      applyThemeClass("dark");
      return;
    }
    applyThemeClass(theme);
    // setTheme is stable from zustand; omit from deps to avoid useEffect size churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mounted]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              BulletType
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {isAuthenticated && user ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-7 w-7 rounded-full object-cover border border-white/20"
                />
                <span className="hidden sm:inline font-medium">
                  {user.username}
                </span>
              </Button>
            </Link>
          ) : (
            <Link href="/login" title="Guest — sign up to keep your name forever">
              <Button variant="ghost" size="sm" className="gap-2 max-w-[11rem]">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    guestUsername || "guest"
                  )}`}
                  alt={guestUsername || "Guest"}
                  className="h-7 w-7 rounded-full object-cover border border-white/20 shrink-0"
                />
                <span className="hidden sm:inline font-medium truncate text-left">
                  {guestUsername ? `@${guestUsername}` : "Guest"}
                </span>
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}