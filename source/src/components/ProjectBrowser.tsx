"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState, TextField } from "@/components/ui/Primitives";
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/types";

export function ProjectBrowser() {
  const db = useDB();
  const t = useT();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.projects.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.ideaDescription.toLowerCase().includes(q) ||
        p.roles.some((role) => role.requiredSkills.some((s) => s.toLowerCase().includes(q)))
      );
    });
  }, [db.projects, query, category]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("projects.searchPlaceholder")}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              category === "all" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            }`}
          >
            {t("projects.all")}
          </button>
          {PROJECT_CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                category === c.id ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
              }`}
            >
              {t(`category.${c.id}`)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("projects.noMatch")} description={t("projects.noMatchDesc")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} owner={db.users.find((u) => u.id === project.ownerId)} />
          ))}
        </div>
      )}
    </div>
  );
}
