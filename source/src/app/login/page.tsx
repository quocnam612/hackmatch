"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setCurrentUser, useDB } from "@/lib/store";
import { verifyPassword, SEED_PASSWORD } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { Button, Card, SectionHeading, TextField } from "@/components/ui/Primitives";

export default function LoginPage() {
  const db = useDB();
  const router = useRouter();
  const t = useT();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function attemptLogin(loginUsername: string, userPassword: string) {
    setError(null);
    setLoading(true);
    try {
      const user = db.users.find((u) => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
      if (!user) {
        setError("No account with that username — register first.");
        return;
      }
      const ok = await verifyPassword(userPassword, user.passwordHash);
      if (!ok) {
        setError("Incorrect password.");
        return;
      }
      setCurrentUser(user.id);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    void attemptLogin(username, password);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-12">
      <SectionHeading title={t("login.title")} subtitle={t("login.subtitle")} />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField label={t("common.username")} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. an" />
          <TextField
            label={t("common.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? t("common.saving") : t("auth.login")}
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        <SectionHeading title={t("login.quickDemo")} subtitle={t("login.quickDemoSubtitle")} />
        <div className="flex flex-wrap gap-2">
          {db.users
            .filter((u) => u.isSeed)
            .map((u) => (
              <button
                key={u.id}
                type="button"
                disabled={loading}
                onClick={() => void attemptLogin(u.username, SEED_PASSWORD)}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              >
                {u.name} <span className="text-zinc-400">@{u.username}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
