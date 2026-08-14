"use client";

import { useState } from "react";
import { HARD_SKILL_SUGGESTIONS, normalizeSkill } from "@/data/skills";
import { useT } from "@/lib/i18n";
import { LANGUAGES, SOFT_SKILLS, type LanguageId, type SoftSkillId } from "@/types";

export function HardSkillInput({
  value,
  onChange,
  label,
  hint,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
  label?: string;
  hint?: string;
}) {
  const t = useT();
  const [draft, setDraft] = useState("");
  const effectiveLabel = label ?? t("common.hardSkills");
  const effectiveHint = hint ?? t("hardSkills.hint");

  const known = new Set(value.map(normalizeSkill));
  const suggestions = HARD_SKILL_SUGGESTIONS.filter(
    (s) => !known.has(normalizeSkill(s)) && s.toLowerCase().includes(draft.trim().toLowerCase()) && draft.trim().length > 0
  ).slice(0, 6);

  function commit(raw: string) {
    const skill = raw.trim();
    if (!skill) return;
    if (known.has(normalizeSkill(skill))) {
      setDraft("");
      return;
    }
    onChange([...value, skill]);
    setDraft("");
  }

  function remove(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{effectiveLabel}</span>
      <div className="flex flex-wrap gap-2 rounded-xl border border-surface-border bg-black/[0.03] p-2.5 dark:bg-white/[0.05]">
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-1 text-xs font-medium text-accent"
          >
            {skill}
            <button
              type="button"
              onClick={() => remove(skill)}
              className="text-accent hover:opacity-70"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit(draft);
            } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
              remove(value[value.length - 1]);
            }
          }}
          placeholder={value.length === 0 ? "e.g. React, PostgreSQL" : "..."}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-foreground outline-none"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="rounded-full border border-surface-border px-2.5 py-1 text-xs text-muted hover:border-accent/40 hover:text-accent"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {effectiveHint && <span className="text-xs text-muted">{effectiveHint}</span>}
    </div>
  );
}

export function SoftSkillPicker({
  value,
  onChange,
  label,
}: {
  value: SoftSkillId[];
  onChange: (skills: SoftSkillId[]) => void;
  label?: string;
}) {
  const t = useT();
  const effectiveLabel = label ?? t("common.softSkills");

  function toggle(id: SoftSkillId) {
    onChange(value.includes(id) ? value.filter((s) => s !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{effectiveLabel}</span>
      <div className="flex flex-wrap gap-2">
        {SOFT_SKILLS.map((skill) => {
          const active = value.includes(skill.id);
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggle(skill.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-surface-border bg-black/[0.03] text-foreground hover:border-accent/40 dark:bg-white/[0.05]"
              }`}
            >
              {t(`soft.${skill.id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LanguagePicker({
  value,
  onChange,
  label,
}: {
  value: LanguageId[];
  onChange: (languages: LanguageId[]) => void;
  label?: string;
}) {
  const t = useT();
  const effectiveLabel = label ?? t("common.languages");

  function toggle(id: LanguageId) {
    onChange(value.includes(id) ? value.filter((s) => s !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{effectiveLabel}</span>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const active = value.includes(lang.id);
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => toggle(lang.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-surface-border bg-black/[0.03] text-foreground hover:border-accent/40 dark:bg-white/[0.05]"
              }`}
            >
              {t(`lang.${lang.id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
