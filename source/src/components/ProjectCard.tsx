"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { UserLink } from "@/components/UserLink";
import { Badge, Card } from "@/components/ui/Primitives";
import type { Project, UserProfile } from "@/types";

export function ProjectCard({ project, owner }: { project: Project; owner?: UserProfile }) {
  const router = useRouter();
  const t = useT();

  return (
    <Card
      className="flex h-full cursor-pointer flex-col gap-3 transition-shadow hover:shadow-md"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{project.title}</h3>
        <Badge tone="accent">{t(`category.${project.category}`)}</Badge>
      </div>
      <p className="line-clamp-2 text-sm text-muted">{project.ideaDescription}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.roles.slice(0, 3).map((role) => (
          <Badge key={role.id}>{role.name}</Badge>
        ))}
        {project.roles.length > 3 && <Badge>+{project.roles.length - 3}</Badge>}
      </div>
      <div className="mt-auto flex items-center justify-between text-xs text-muted/70">
        <span onClick={(e) => e.stopPropagation()}>
          {t("projects.hostedBy")} {owner ? <UserLink userId={owner.id} name={owner.name} /> : "?"}
        </span>
        <span>
          {project.roles.length} {t("projects.roles")}
          {project.deadline ? ` · ${project.deadline}` : ""}
        </span>
      </div>
    </Card>
  );
}
