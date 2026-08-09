"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addUser, isUsernameTaken, setCurrentUser, useDB } from "@/lib/store";
import { hashPassword } from "@/lib/auth";
import { suggestUsername } from "@/lib/slug";
import { useT } from "@/lib/i18n";
import { HardSkillInput, LanguagePicker, SoftSkillPicker } from "@/components/ui/SkillPickers";
import { Button, Card, SectionHeading, TextField } from "@/components/ui/Primitives";
import type { LanguageId, SoftSkillId } from "@/types";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export default function RegisterPage() {
  const db = useDB();
  const router = useRouter();
  const t = useT();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [location, setLocation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hardSkills, setHardSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<SoftSkillId[]>([]);
  const [languages, setLanguages] = useState<LanguageId[]>([]);
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
    if (hardSkills.length === 0) {
      setError("Add at least one hard skill.");
      return;
    }
    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      const user = addUser({
        name: name.trim(),
        username: finalUsername,
        location: location.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        hardSkills,
        softSkills,
        languages,
        passwordHash,
        followedBy: [],
        isSeed: false,
      });
      setCurrentUser(user.id);
      router.push("/");
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
            label={`${t("common.location")} (${t("common.optional")})`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. TP. Hồ Chí Minh"
          />
          <TextField
            label={`${t("common.github")} (${t("common.optional")})`}
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
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
          <HardSkillInput value={hardSkills} onChange={setHardSkills} />
          <SoftSkillPicker value={softSkills} onChange={setSoftSkills} />
          <LanguagePicker value={languages} onChange={setLanguages} />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? t("common.saving") : t("profile.createTitle")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
