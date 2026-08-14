"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { projectsForParticipant, toggleFollowUser, useDB } from "@/lib/store";
import { assignTeamToRoles } from "@/lib/matching";
import { useT } from "@/lib/i18n";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { GithubIcon, PinIcon } from "@/components/icons";
import { Badge, Button, Card, EmptyState, SectionHeading } from "@/components/ui/Primitives";
import type { Project, UserProfile } from "@/types";

function roleNameForUser(project: Project, userId: string, db: { users: UserProfile[]; requests: { projectId: string; userId: string; status: string; roleId?: string }[] }): string | null {
  const acceptedRequest = db.requests.find(
    (r) => r.projectId === project.id && r.userId === userId && r.status === "accepted"
  );
  if (acceptedRequest?.roleId) {
    const role = project.roles.find((r) => r.id === acceptedRequest.roleId);
    if (role) return role.name;
  }
  const acceptedMembers = db.users.filter((u) =>
    db.requests.some((r) => r.projectId === project.id && r.userId === u.id && r.status === "accepted")
  );
  const assignment = assignTeamToRoles(acceptedMembers, project.roles).find((a) => a.userId === userId);
  return assignment?.roleName ?? null;
}

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const db = useDB();
  const t = useT();
  const user = db.users.find((u) => u.id === params.id);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <EmptyState title={t("profile.notFoundTitle")} description={t("profile.notFoundDesc")} />
      </div>
    );
  }

  const isSelf = db.currentUserId === user.id;
  const isFollowing = db.currentUserId ? user.followedBy.includes(db.currentUserId) : false;
  const joinedProjects = projectsForParticipant(db, user.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar userId={user.id} name={user.name} size="lg" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted">@{user.username}</p>
            {user.location && (
              <p className="flex items-center gap-1 text-sm text-muted">
                <PinIcon /> {user.location}
              </p>
            )}
            {user.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted hover:text-accent"
              >
                <GithubIcon /> GitHub
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            {user.followedBy.length} {t("common.followers")}
          </span>
          {isSelf ? (
            <Link href="/profile/edit">
              <Button variant="secondary">{t("auth.editProfile")}</Button>
            </Link>
          ) : db.currentUserId ? (
            <FollowButton following={isFollowing} onToggle={() => toggleFollowUser(user.id, db.currentUserId!)} />
          ) : null}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {t("common.hardSkills")}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {user.hardSkills.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
        {user.softSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.softSkills.map((s) => (
              <Badge key={s} tone="accent">
                {t(`soft.${s}`)}
              </Badge>
            ))}
          </div>
        )}
        {user.languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.languages.map((l) => (
              <Badge key={l}>{t(`lang.${l}`)}</Badge>
            ))}
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-4">
        <SectionHeading title={t("profile.projectsJoined")} subtitle={`${joinedProjects.length} ${t("projects.members")}`} />
        {joinedProjects.length === 0 ? (
          <EmptyState title={t("profile.projectsJoined")} description={`${user.name} ${t("profile.noProjectsJoined")}`} />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {joinedProjects.map((project) => {
              const isOwner = project.ownerId === user.id;
              const roleName = isOwner ? t("projects.owner") : roleNameForUser(project, user.id, db);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex flex-col gap-1 rounded-2xl border border-surface-border bg-surface/70 p-4 hover:shadow-md"
                >
                  <span className="text-sm font-semibold text-foreground">{project.title}</span>
                  {roleName && <Badge tone="accent">{roleName}</Badge>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
