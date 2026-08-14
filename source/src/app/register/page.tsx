"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addUser, isUsernameTaken, setCurrentUser, useDB } from "@/lib/store";
import { hashPassword } from "@/lib/auth";
import { suggestUsername } from "@/lib/slug";
import { useT } from "@/lib/i18n";
import { Button, Card, SectionHeading, TextField } from "@/components/ui/Primitives";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export default function RegisterPage() {
  const db = useDB();
  const router = useRouter();
  const t = useT();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveUsername = usernameTouched ? username : username || suggestUsername(name);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const finalUsername = effectiveUsername.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(finalUsername)) {
      setError("Username must be 3-20 characters: lowercase letters, numbers, or underscore.");
      return;
    }
    if (isUsernameTaken(db, finalUsername)) {
      setError("That username is already taken.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      const user = addUser({
        name: name.trim(),
        username: finalUsername,
        hardSkills: [],
        softSkills: [],
        languages: [],
        passwordHash,
        followedBy: [],
        isSeed: false,
      });
      setCurrentUser(user.id);
      router.push("/profile/edit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12">
      <SectionHeading title={t("profile.createTitle")} subtitle={t("profile.createSubtitle")} />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField label={t("common.name")} value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label={t("common.username")}
            value={effectiveUsername}
            onChange={(e) => {
              setUsernameTouched(true);
              setUsername(e.target.value.toLowerCase());
            }}
          />
          <TextField
            label={t("common.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label={t("common.confirmPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? t("common.saving") : t("profile.createTitle")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
