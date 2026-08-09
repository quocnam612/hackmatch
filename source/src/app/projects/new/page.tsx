"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addProject, useDB } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card, SectionHeading, TextArea, TextField } from "@/components/ui/Primitives";
import { SoftSkillPicker } from "@/components/ui/SkillPickers";
import { newRoleId, RoleEditor } from "@/components/ui/RoleEditor";
import { PROJECT_CATEGORIES, type ProjectCategory, type ProjectRole, type SoftSkillId } from "@/types";

export default function NewProjectPage() {
  const db = useDB();
  const router = useRouter();
  const t = useT();
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("hackathon");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [roles, setRoles] = useState<ProjectRole[]>([{ id: newRoleId(), name: "", requiredSkills: [] }]);
  const [softSkills, setSoftSkills] = useState<SoftSkillId[]>([]);
  const [teamSize, setTeamSize] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleAiAssist() {
    if (!idea.trim()) {
      setAiError("Describe your idea first.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/extract-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaDescription: idea, roleCount: teamSize }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "AI extraction failed.");
        return;
      }
      const aiRoles = data.roles as { name: string; requiredSkills: string[] }[];
      if (aiRoles.length === 0) {
        setAiError("AI couldn't determine any roles from that description — try adding more detail.");
        return;
      }
      // The team size (set above) drives the role count now — the AI just names
      // that many roles and splits skills across them, so replace rather than merge.
      setRoles(aiRoles.map((r) => ({ id: newRoleId(), name: r.name, requiredSkills: r.requiredSkills })));
      setSoftSkills((prev) => Array.from(new Set([...prev, ...(data.suggestedSoftSkills as SoftSkillId[])])) as SoftSkillId[]);
    } catch {
      setAiError("AI extraction failed — check your connection and add skills manually.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!db.currentUserId) {
      setError("Log in first (top-right) to host a project.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const cleanRoles = roles
      .map((r) => ({ ...r, name: r.name.trim() }))
      .filter((r) => r.name && r.requiredSkills.length > 0);
    if (cleanRoles.length === 0) {
      setError("Add at least one role with a name and required skills.");
      return;
    }
    const project = addProject({
      ownerId: db.currentUserId,
      title: title.trim(),
      ideaDescription: idea.trim(),
      category,
      location: location.trim() || undefined,
      deadline: deadline || undefined,
      externalLink: externalLink.trim() || undefined,
      roles: cleanRoles,
      optionalSoftSkills: softSkills,
      teamSize,
      followedBy: [],
    });
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12">
      <SectionHeading title={t("projects.hostTitle")} subtitle={t("projects.hostSubtitle")} />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField
            label={t("projects.projectTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Campus event finder app"
          />
          <TextArea
            label={t("projects.ideaDescription")}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            placeholder="What are you building, and why?"
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("projects.category")}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              className="rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
            >
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(`category.${c.id}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label={`${t("common.location")} (${t("common.optional")})`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Online, TP.HCM"
            />
            <TextField
              label={`${t("projects.deadline")} (${t("common.optional")})`}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <TextField
            label={`${category === "hackathon" ? t("projects.hackathonLink") : t("projects.repoLink")} (${t("common.optional")})`}
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://..."
          />
          <TextField
            label={t("projects.teamSizeLimit")}
            type="number"
            min={1}
            max={10}
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            hint={t("projects.teamSizeAiHint")}
          />
          <div className="flex flex-col gap-2">
            <Button type="button" variant="secondary" onClick={handleAiAssist} disabled={aiLoading}>
              {aiLoading ? t("projects.aiThinking") : t("projects.aiAssist")}
            </Button>
            {aiError && <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>}
          </div>
          <RoleEditor roles={roles} onChange={setRoles} />
          <SoftSkillPicker label={t("projects.preferredSoftSkills")} value={softSkills} onChange={setSoftSkills} />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit">{t("projects.createProject")}</Button>
        </form>
      </Card>
    </div>
  );
}
