"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Keyboard,
  Trophy,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { applyThemeClass, useSettingsStore } from "@/store/useSettingsStore";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BulletTypeLogo } from "@/components/layout/BulletTypeLogo";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { NavHoverGroup, NavHoverItem } from "@/components/layout/NavHoverGroup";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home, id: "home" },
  { href: "/learn", label: "Learn", icon: BookOpen, id: "learn" },
  { href: "/practice", label: "Typing Practice", icon: Keyboard, id: "practice" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, id: "leaderboard" },
] as const;

function pageName(pathname: string) {
  if (pathname === "/") return "Home";

  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      const words = segment.replace(/[-_]/g, " ");
      return words.charAt(0).toUpperCase() + words.slice(1);
    })
    .join(" / ");
}

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useSettingsStore();
 const { user, isAuthenticated, initializeAuth } = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [guestUsername, setGuestUsername] = useState<string | null>(null);
  const lastLoggedPageRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Assign persistent guest username once (stays same after refresh/reopen)
    if (!isAuthenticated) {
      void import("@/lib/guestIdentity").then(({ getOrCreateGuestUsername }) => {
        setGuestUsername(getOrCreateGuestUsername());
      });
    }
  }, [isAuthenticated]);

  const isAdminRoute =
    pathname === "/adminumar7811" ||
    pathname?.startsWith("/adminumar7811/") === true;

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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? user?.id ?? null;

      await recordSiteVisit(uid);
      stopPresence = startPresenceTracking(uid);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setTimeout(async () => {
          const { recordSiteVisit } = await import("@/lib/visits");
          const { startPresenceTracking } = await import("@/lib/presence");
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const uid = session?.user?.id ?? null;
          await recordSiteVisit(uid);
          stopPresence?.();
          stopPresence = startPresenceTracking(uid);
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
    if (isAdminRoute || !pathname) {
      lastLoggedPageRef.current = null;
      return;
    }

    // Auth hydration can rerun this effect for the same route. A page open is
    // one action, so write it once and let the next navigation create a row.
    if (lastLoggedPageRef.current === pathname) return;
    lastLoggedPageRef.current = pathname;

    void (async () => {
      const { logUserAction } = await import("@/lib/activity");
      await logUserAction({
        actionType: "page_view",
        path: pathname,
        details: `Opened ${pageName(pathname)}`,
      });
    })();
  }, [isAdminRoute, pathname]);

  useEffect(() => {
    if (!mounted) return;
    if (theme === "system") {
      setTheme("forest");
      return;
    }
    applyThemeClass(theme);
    // setTheme is stable from zustand; omit from deps to avoid useEffect size churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mounted]);

  return (
    <header className="sticky top-0 z-50 w-full overflow-visible bg-[var(--background)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label="BulletType home"
          >
            <BulletTypeLogo />
          </Link>

          <NavHoverGroup className="hidden items-center gap-1 md:flex" >
            <nav className="flex items-center gap-1" aria-label="Main">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <NavHoverItem key={item.id} id={item.id} label={item.label}>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-center rounded-xl p-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                        active
                          ? "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  </NavHoverItem>
                );
              })}
            </nav>
          </NavHoverGroup>
        </div>

        <NavHoverGroup className="flex items-center gap-1">
          <NavHoverItem id="appearance" label="Appearance">
            <ThemeSwitcher />
          </NavHoverItem>

          {isAuthenticated && user ? (
            <NavHoverItem id="profile" label="Profile">
              <Link href="/profile" aria-label="Profile">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-transparent">
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
            </NavHoverItem>
          ) : (
            <NavHoverItem id="profile" label="Profile">
              <Link href="/login" aria-label="Profile">
                <Button variant="ghost" size="sm" className="max-w-[11rem] gap-2 hover:bg-transparent">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      guestUsername || "guest"
                    )}`}
                    alt={guestUsername || "Guest"}
                    className="h-7 w-7 shrink-0 rounded-full object-cover border border-white/20"
                  />
                  <span className="hidden truncate text-left sm:inline font-medium">
                    {guestUsername ? `@${guestUsername}` : "Guest"}
                  </span>
                </Button>
              </Link>
            </NavHoverItem>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </NavHoverGroup>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--background)]">
          <nav className="flex flex-wrap items-center gap-1 p-3" aria-label="Mobile">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    active
                      ? "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
            <Link
              href="/settings"
              aria-label="Settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-lg p-2.5 text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
