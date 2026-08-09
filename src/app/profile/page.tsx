"use client";

import { useRef, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Award, MapPin, Calendar, Target, LogOut, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, recentTests, logout, updateProfile, updateAvatar } = useUserStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const startEdit = () => {
    if (!user) return;
    setFullName(user.name);
    setUsername(user.username);
    setMessage("");
    setMessageOk(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setMessage("");
    setMessageOk(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setMessageOk(false);

    const { error } = await updateProfile({
      name: fullName,
      username,
    });

    if (error) {
      setMessage(error);
    } else {
      setMessageOk(true);
      setMessage("Profile updated.");
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingAvatar(true);
    setMessage("");
    setMessageOk(false);

    const { error } = await updateAvatar(file);
    if (error) {
      setMessage(error);
      setMessageOk(false);
    } else {
      setMessageOk(true);
      setMessage("Profile photo updated.");
    }
    setUploadingAvatar(false);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-zinc-500 mb-4">You are not logged in.</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="glass rounded-3xl p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <img
              src={user.avatar}
              alt={user.username}
              className="h-24 w-24 rounded-full border-4 border-blue-500/30 object-cover bg-white/5"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Change profile photo"
              title="Change profile photo"
              className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-zinc-900 text-white shadow-md transition hover:bg-blue-600 disabled:opacity-50"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-1 w-full">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-3 max-w-md mx-auto sm:mx-0">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  autoComplete="username"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                {message && !messageOk && (
                  <p className="text-sm text-red-400">{message}</p>
                )}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-zinc-500">@{user.username}</p>
                {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
                {message && messageOk && (
                  <p className="mt-2 text-sm text-emerald-400">{message}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-zinc-500">
                  {user.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {user.country}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" /> Level {user.level}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEdit}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Tests", value: user.totalTests },
            { label: "Avg WPM", value: user.averageWpm },
            { label: "Best WPM", value: user.highestWpm },
            { label: "Accuracy", value: `${user.accuracy}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xl font-bold font-mono text-blue-400">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" /> Achievements
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.achievements.map((a) => (
              <span
                key={a}
                className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm text-amber-400"
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Recent Tests</h2>
          {recentTests.length === 0 ? (
            <p className="text-sm text-zinc-500">No recent tests.</p>
          ) : (
            <div className="space-y-2">
              {recentTests.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between rounded-xl bg-white/5 px-4 py-3 text-sm"
                >
                  <span className="capitalize">{t.mode}</span>
                  <span className="font-mono text-blue-400">
                    {t.wpm} WPM · {t.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
