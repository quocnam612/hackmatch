"use client";

import { useState, type FormEvent } from "react";
import { updateUser, useDB } from "@/lib/store";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { HardSkillInput, LanguagePicker, SoftSkillPicker } from "@/components/ui/SkillPickers";
import { Button, Card, EmptyState, SectionHeading, TextField } from "@/components/ui/Primitives";
import type { LanguageId, SoftSkillId, UserProfile } from "@/types";

export default function EditProfilePage() {
  const db = useDB();
  const t = useT();
  const currentUser = db.users.find((u) => u.id === db.currentUserId);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <EmptyState title={t("common.loginFirstTitle")} description={t("common.loginToContinue")} />
      </div>
    );
  }

  // Keyed by user id: if the active account ever changes, this remounts the form
  // fresh with the new user's data instead of needing an effect to resync state.
  return <ProfileForm key={currentUser.id} userId={currentUser.id} initialUser={currentUser} />;
}

function ProfileForm({ initialUser }: { userId: string; initialUser: UserProfile }) {
  const db = useDB();
  const t = useT();
  const currentUser = db.users.find((u) => u.id === initialUser.id) ?? initialUser;

  const [name, setName] = useState(initialUser.name);
  const [location, setLocation] = useState(initialUser.location ?? "");
  const [githubUrl, setGithubUrl] = useState(initialUser.githubUrl ?? "");
  const [hardSkills, setHardSkills] = useState<string[]>(initialUser.hardSkills);
  const [softSkills, setSoftSkills] = useState<SoftSkillId[]>(initialUser.softSkills);
  const [languages, setLanguages] = useState<LanguageId[]>(initialUser.languages);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (hardSkills.length === 0) {
      setError("Add at least one hard skill.");
      return;
    }

    let passwordHash: string | undefined;
    if (newPassword) {
      if (!currentPassword) {
        setError("Enter your current password to set a new one.");
        return;
      }
      const ok = await verifyPassword(currentPassword, currentUser.passwordHash);
      if (!ok) {
        setError("Current password is incorrect.");
        return;
      }
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }
      passwordHash = await hashPassword(newPassword);
    }

    setLoading(true);
    try {
      updateUser(currentUser.id, {
        name: name.trim(),
        location: location.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        hardSkills,
        softSkills,
        languages,
        ...(passwordHash ? { passwordHash } : {}),
      });
      setCurrentPassword("");
      setNewPassword("");
      setSuccess(t("profile.updated"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12">
      <SectionHeading title={t("profile.editTitle")} subtitle={t("profile.editSubtitle")} />
      {initialUser.hardSkills.length === 0 && (
        <div className="flex flex-col gap-1 rounded-2xl border border-accent/25 bg-accent/8 p-4">
          <p className="text-sm font-medium text-accent">{t("profile.completeSkillsTitle")}</p>
          <p className="text-sm text-muted">{t("profile.completeSkillsDesc")}</p>
        </div>
      )}
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField label={t("common.name")} value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label={`${t("common.location")} (${t("common.optional")})`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextField
            label={`${t("common.github")} (${t("common.optional")})`}
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
          />
          <HardSkillInput value={hardSkills} onChange={setHardSkills} />
          <SoftSkillPicker value={softSkills} onChange={setSoftSkills} />
          <LanguagePicker value={languages} onChange={setLanguages} />
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-surface-border p-4">
            <p className="text-sm font-medium text-foreground">{t("profile.changePassword")}</p>
            <TextField
              label={t("profile.currentPassword")}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={currentUser.isSeed ? "12345678" : "••••••••"}
            />
            <TextField
              label={t("profile.newPassword")}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          {success && <p className="text-sm text-success">{success}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
