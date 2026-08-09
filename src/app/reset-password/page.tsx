"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && nextSession)) {
        setReady(true);
        setChecking(false);
      }
    });

    // Supabase puts recovery tokens in the URL hash; client parses them into a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setReady(true);
        setChecking(false);
        return;
      }

      timeoutId = setTimeout(async () => {
        if (!mounted) return;
        const { data: { session: again } } = await supabase.auth.getSession();
        if (again) {
          setReady(true);
        } else {
          setMessage("Invalid or expired reset link. Request a new one.");
        }
        setChecking(false);
      }, 800);
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageOk(false);

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessageOk(true);
    setMessage("Password updated. Redirecting to login...");
    setLoading(false);
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Set New Password
        </h1>
        <p className="text-center text-zinc-400 mb-8">
          Choose a new password for your BulletType account
        </p>

        {checking ? (
          <p className="text-center text-zinc-400 text-sm">Verifying reset link...</p>
        ) : !ready ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-400">{message || "Reset link not valid."}</p>
            <Link
              href="/login"
              className="inline-block text-blue-400 hover:underline text-sm"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />

            {message && (
              <p
                className={`text-sm text-center ${
                  messageOk ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
