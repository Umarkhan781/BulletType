"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);
  const router = useRouter();

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setMessage("");
    setMessageOk(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageOk(false);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessageOk(true);
        setMessage("Password reset link sent. Check your email.");
      }
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/dashboard");
      }
    } else {
      const cleanUsername = username.trim().replace(/^@/, "");
      const cleanFullName = fullName.trim();

      if (!cleanFullName || !cleanUsername) {
        setMessage("Full name and username are required.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: cleanFullName,
            username: cleanUsername,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: cleanUsername,
            full_name: cleanFullName,
          });
        }
        setMessageOk(true);
        setMessage("Check your email for confirmation link!");
      }
    }
    setLoading(false);
  };

  const title =
    mode === "login"
      ? "Welcome Back"
      : mode === "signup"
        ? "Create Account"
        : "Reset Password";

  const subtitle =
    mode === "login"
      ? "Login to BulletType"
      : mode === "signup"
        ? "Join BulletType"
        : "Enter your email and we'll send a reset link";

  const submitLabel =
    mode === "login" ? "Login" : mode === "signup" ? "Sign Up" : "Send Reset Link";

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">{title}</h1>
        <p className="text-center text-zinc-400 mb-8">{subtitle}</p>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === "signup" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                minLength={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          )}

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-sm text-blue-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

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
            {loading ? "Please wait..." : submitLabel}
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-6">
          {mode === "forgot" ? (
            <>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-blue-400 hover:underline"
              >
                Login
              </button>
            </>
          ) : mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-blue-400 hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-blue-400 hover:underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
