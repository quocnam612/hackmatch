"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addRequest, useDB } from "@/lib/store";
import { assignTeamToRoles, findOpenRoleOpportunities, rankCandidatesForRole } from "@/lib/matching";
import { useT } from "@/lib/i18n";
import { UserLink } from "@/components/UserLink";
import { Avatar } from "@/components/Avatar";
import { Badge, Button, Card, EmptyState, SectionHeading } from "@/components/ui/Primitives";

type GapFilter = "all" | 0 | 1 | 2 | "3plus";
type Tab = "opportunities" | "recruit";

function OpportunitiesPanel({ currentUserId, currentUserName }: { currentUserId: string; currentUserName: string }) {
  const db = useDB();
  const t = useT();
  const currentUser = db.users.find((u) => u.id === currentUserId)!;
  const [gapFilter, setGapFilter] = useState<GapFilter>("all");

  const opportunities = useMemo(
    () => findOpenRoleOpportunities(currentUser, db.projects, db.requests, db.users),
    [currentUser, db.projects, db.requests, db.users]
  );

  const filtered = useMemo(() => {
    if (gapFilter === "all") return opportunities;
    if (gapFilter === "3plus") return opportunities.filter((o) => o.gap >= 3);
    return opportunities.filter((o) => o.gap === gapFilter);
  }, [opportunities, gapFilter]);

  const filters: { key: GapFilter; label: string }[] = [
    { key: "all", label: t("findTeam.filterAll") },
    { key: 0, label: t("findTeam.fullyMatched") },
    { key: 1, label: t("findTeam.missing1") },
    { key: 2, label: t("findTeam.missing2") },
    { key: "3plus", label: t("findTeam.missing3plus") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t("findTeam.subtitlePrefix")} {currentUserName}.
      </p>

      {opportunities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={String(f.key)}
              type="button"
              onClick={() => setGapFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                gapFilter === f.key ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {opportunities.length === 0 ? (
        <EmptyState title={t("findTeam.noMatchTitle")} description={t("findTeam.noMatchDesc")} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t("findTeam.noFilterMatchTitle")} description={t("findTeam.noFilterMatchDesc")} />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(({ project, role, matchedSkills, missingSkills, gap }) => {
            const owner = db.users.find((u) => u.id === project.ownerId);
            const existingRequest = db.requests.find((r) => r.projectId === project.id && r.userId === currentUser.id);
            return (
              <Card key={`${project.id}-${role.id}`} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-base font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                    >
                      {project.title}
                    </Link>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{role.name}</span>
                  </div>
                  <Badge tone={gap === 0 ? "success" : "accent"}>
                    {gap === 0 ? t("findTeam.fullyMatched") : `${t("findTeam.missingN")} ${gap}`}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="accent">{t(`category.${project.category}`)}</Badge>
                  {project.location && <Badge>{project.location}</Badge>}
                  {project.deadline && <Badge>{project.deadline}</Badge>}
                  <span className="text-xs text-zinc-400">
                    {t("projects.hostedBy")} {owner ? <UserLink userId={owner.id} name={owner.name} /> : "?"}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{project.ideaDescription}</p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map((s) => (
                    <Badge key={s} tone="success">
                      {s}
                    </Badge>
                  ))}
                  {missingSkills.map((s) => (
                    <Badge key={s} tone="danger">
                      {s}
                    </Badge>
                  ))}
                </div>
                {existingRequest ? (
                  <Badge
                    tone={existingRequest.status === "accepted" ? "success" : existingRequest.status === "rejected" ? "danger" : "neutral"}
                  >
                    {t("request.yourStatus")}: {t(`status.${existingRequest.status}`)}
                  </Badge>
                ) : (
                  <Button
                    onClick={() =>
                      addRequest({
                        projectId: project.id,
                        userId: currentUser.id,
                        direction: "candidate_to_project",
                        roleId: role.id,
                      })
                    }
                    className="self-start"
                  >
                    {t("common.requestToJoin")}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecruitPanel({ currentUserId }: { currentUserId: string }) {
  const db = useDB();
  const t = useT();
  const myProjects = useMemo(() => db.projects.filter((p) => p.ownerId === currentUserId), [db.projects, currentUserId]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(myProjects[0]?.id ?? "");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const project = myProjects.find((p) => p.id === selectedProjectId) ?? myProjects[0];

  const requests = useMemo(() => (project ? db.requests.filter((r) => r.projectId === project.id) : []), [db.requests, project]);
  const acceptedMembers = useMemo(
    () => db.users.filter((u) => requests.some((r) => r.userId === u.id && r.status === "accepted")),
    [db.users, requests]
  );
  const currentAssignments = useMemo(() => (project ? assignTeamToRoles(acceptedMembers, project.roles) : []), [project, acceptedMembers]);
  const openRoles = useMemo(() => {
    if (!project) return [];
    return project.roles.filter((role) => {
      const a = currentAssignments.find((x) => x.roleId === role.id);
      return !a || !a.userId || a.coveredSkills.length < role.requiredSkills.length;
    });
  }, [project, currentAssignments]);

  const activeRole = openRoles.find((r) => r.id === selectedRoleId) ?? openRoles[0];

  const candidatePool = useMemo(() => {
    if (!project) return [];
    const excluded = new Set([project.ownerId, ...acceptedMembers.map((m) => m.id)]);
    return db.users.filter((u) => !excluded.has(u.id));
  }, [db.users, project, acceptedMembers]);

  const ranked = useMemo(() => (activeRole ? rankCandidatesForRole(activeRole, candidatePool) : []), [activeRole, candidatePool]);

  if (myProjects.length === 0) {
    return (
      <EmptyState
        title={t("findTeam.noProjectsToRecruitTitle")}
        description={t("findTeam.noProjectsToRecruitDesc")}
        action={
          <Link href="/projects/new">
            <Button>{t("projects.hostTitle")}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {myProjects.length > 1 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("findTeam.selectProject")}</span>
          <select
            value={project?.id ?? ""}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedRoleId("");
            }}
            className="rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
          >
            {myProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      )}

      {project && openRoles.length === 0 ? (
        <Badge tone="success">{t("projects.allRolesFilled")}</Badge>
      ) : project ? (
        <>
          <div className="flex flex-wrap gap-1.5">
            {openRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  activeRole?.id === role.id ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                }`}
              >
                {role.name}
              </button>
            ))}
          </div>

          {ranked.length === 0 ? (
            <EmptyState title={t("findTeam.noCandidatesTitle")} description={t("findTeam.noCandidatesDesc")} />
          ) : (
            <ul className="flex flex-col gap-2">
              {ranked.map(({ user, matchedSkills, missingSkills }) => {
                const existingRequest = db.requests.find((r) => r.projectId === project.id && r.userId === user.id);
                return (
                  <li key={user.id} className="flex flex-col gap-2 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar userId={user.id} name={user.name} size="sm" />
                      <UserLink userId={user.id} name={user.name} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map((s) => (
                        <Badge key={s} tone="success">
                          {s}
                        </Badge>
                      ))}
                      {missingSkills.map((s) => (
                        <Badge key={s} tone="danger">
                          {s}
                        </Badge>
                      ))}
                    </div>
                    {existingRequest ? (
                      <Badge
                        tone={existingRequest.status === "accepted" ? "success" : existingRequest.status === "rejected" ? "danger" : "neutral"}
                      >
                        {t(`status.${existingRequest.status}`)}
                      </Badge>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          addRequest({
                            projectId: project.id,
                            userId: user.id,
                            direction: "project_to_candidate",
                            roleId: activeRole?.id,
                          })
                        }
                      >
                        {t("findTeam.invite")}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}

export default function FindTeamPage() {
  const db = useDB();
  const t = useT();
  const currentUser = db.users.find((u) => u.id === db.currentUserId);
  const [tab, setTab] = useState<Tab>("opportunities");

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <EmptyState
          title={t("common.loginFirstTitle")}
          description={t("common.loginToContinue")}
          action={
            <Link href="/login">
              <Button>{t("auth.login")}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <SectionHeading title={t("findTeam.title")} />

      <div className="flex gap-1.5 border-b border-black/10 dark:border-white/10">
        <button
          type="button"
          onClick={() => setTab("opportunities")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "opportunities"
              ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {t("findTeam.tabOpportunities")}
        </button>
        <button
          type="button"
          onClick={() => setTab("recruit")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "recruit" ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {t("findTeam.tabRecruit")}
        </button>
      </div>

      {tab === "opportunities" ? (
        <OpportunitiesPanel currentUserId={currentUser.id} currentUserName={currentUser.name} />
      ) : (
        <RecruitPanel currentUserId={currentUser.id} />
      )}
    </div>
  );
}
