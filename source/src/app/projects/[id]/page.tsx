"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { addRequest, isProjectParticipant, toggleFollowProject, updateProject, updateRequestStatus, useDB } from "@/lib/store";
import { assignTeamToRoles, findTeam, rankCandidatesForRole } from "@/lib/matching";
import { openChatForProject } from "@/lib/uiStore";
import { useT } from "@/lib/i18n";
import { UserLink } from "@/components/UserLink";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { ChatIcon, LinkIcon } from "@/components/icons";
import { Badge, Button, Card, EmptyState, SectionHeading, TextField } from "@/components/ui/Primitives";
import { SoftSkillPicker } from "@/components/ui/SkillPickers";
import { RoleEditor } from "@/components/ui/RoleEditor";
import type { SoftSkillId } from "@/types";

function ExternalLinkButton({
  project,
  t,
}: {
  project: { category: string; externalLink?: string };
  t: (key: string) => string;
}) {
  if (!project.externalLink) return null;
  const label = project.category === "hackathon" ? t("projects.hackathonDetails") : t("projects.repository");
  return (
    <a href={project.externalLink} target="_blank" rel="noopener noreferrer">
      <Button variant="secondary" type="button">
        <LinkIcon /> {label}
      </Button>
    </a>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const db = useDB();
  const t = useT();
  const project = db.projects.find((p) => p.id === params.id);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const requests = useMemo(() => (project ? db.requests.filter((r) => r.projectId === project.id) : []), [db.requests, project]);
  const acceptedMembers = useMemo(
    () => db.users.filter((u) => requests.some((r) => r.userId === u.id && r.status === "accepted")),
    [db.users, requests]
  );

  const currentAssignments = useMemo(() => {
    if (!project) return [];
    return assignTeamToRoles(acceptedMembers, project.roles);
  }, [project, acceptedMembers]);

  const openRoles = useMemo(() => {
    if (!project) return [];
    return project.roles.filter((role) => {
      const a = currentAssignments.find((x) => x.roleId === role.id);
      return !a || !a.userId || a.coveredSkills.length < role.requiredSkills.length;
    });
  }, [project, currentAssignments]);

  const recruitCandidatePool = useMemo(() => {
    if (!project) return [];
    return db.users.filter((u) => !acceptedMembers.some((m) => m.id === u.id) && u.id !== project.ownerId);
  }, [project, db.users, acceptedMembers]);

  const suggestionResult = useMemo(() => {
    if (!project || openRoles.length === 0) return null;
    return findTeam({
      project: { roles: openRoles, optionalSoftSkills: project.optionalSoftSkills, teamSize: openRoles.length },
      candidates: recruitCandidatePool,
    });
  }, [project, openRoles, recruitCandidatePool]);

  const potentialParticipants = useMemo(
    () => openRoles.map((role) => ({ role, ranked: rankCandidatesForRole(role, recruitCandidatePool) })),
    [openRoles, recruitCandidatePool]
  );

  if (!project) {
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <EmptyState title={t("projects.notFoundTitle")} description={t("projects.notFoundDesc")} />
      </div>
    );
  }

  const owner = db.users.find((u) => u.id === project.ownerId);
  const isOwner = db.currentUserId === project.ownerId;
  const myRequest = requests.find((r) => r.userId === db.currentUserId);
  const isParticipant = db.currentUserId ? isProjectParticipant(db, project.id, db.currentUserId) : false;

  function handleJoinRequest() {
    if (!db.currentUserId || !project) return;
    addRequest({
      projectId: project.id,
      userId: db.currentUserId,
      direction: "candidate_to_project",
      roleId: selectedRoleId || undefined,
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeading
            title={project.title}
            subtitle={
              <span>
                {t("projects.hostedBy")} {owner ? <UserLink userId={owner.id} name={owner.name} /> : "?"}
              </span>
            }
          />
          <div className="flex items-center gap-2">
            {isParticipant && (
              <Button type="button" onClick={() => openChatForProject(project.id)}>
                <ChatIcon /> {t("chat.title")}
              </Button>
            )}
            <ExternalLinkButton project={project} t={t} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="accent">{t(`category.${project.category}`)}</Badge>
          {project.location && <Badge>{project.location}</Badge>}
          {project.deadline && (
            <Badge>
              {t("projects.deadline")}: {project.deadline}
            </Badge>
          )}
          <span className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              {project.followedBy.length} {t("common.followers")}
            </span>
            {db.currentUserId && (
              <FollowButton
                following={project.followedBy.includes(db.currentUserId)}
                onToggle={() => toggleFollowProject(project.id, db.currentUserId!)}
              />
            )}
          </span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{project.ideaDescription}</p>
      </div>

      <Card className="flex flex-col gap-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t("projects.constraints")}
        </h3>
        {isOwner ? (
          <>
            <TextField
              label={project.category === "hackathon" ? t("projects.hackathonLink") : t("projects.repoLink")}
              value={project.externalLink ?? ""}
              onChange={(e) => updateProject(project.id, { externalLink: e.target.value || undefined })}
              placeholder="https://..."
            />
            <TextField
              label={t("projects.teamSizeLimit")}
              type="number"
              min={1}
              max={10}
              value={project.teamSize}
              onChange={(e) => updateProject(project.id, { teamSize: Number(e.target.value) })}
            />
            <RoleEditor roles={project.roles} onChange={(roles) => updateProject(project.id, { roles })} />
            <SoftSkillPicker
              label={t("common.softSkills")}
              value={project.optionalSoftSkills}
              onChange={(skills) => updateProject(project.id, { optionalSoftSkills: skills as SoftSkillId[] })}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {project.roles.map((role) => {
                const assignment = currentAssignments.find((a) => a.roleId === role.id);
                const filled = assignment?.userId && assignment.coveredSkills.length === role.requiredSkills.length;
                return (
                  <div key={role.id} className="flex flex-col gap-1 rounded-xl border border-black/10 p-3 dark:border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{role.name}</span>
                      <Badge tone={filled ? "success" : "neutral"}>{filled ? t("projects.filled") : t("projects.open")}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.requiredSkills.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {project.optionalSoftSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.optionalSoftSkills.map((s) => (
                  <Badge key={s} tone="accent">
                    {t(`soft.${s}`)}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("projects.teamSizeLimit")}: {project.teamSize}
            </p>
          </>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t("projects.currentTeam")}
        </h3>
        {acceptedMembers.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("projects.noMembersYet")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {currentAssignments
              .filter((a) => a.userId)
              .map((a) => (
                <li key={a.roleId} className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {a.roleName} — <UserLink userId={a.userId!} name={db.users.find((u) => u.id === a.userId)?.name ?? "?"} />
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {t("projects.covers")}: {a.coveredSkills.join(", ") || "—"}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t("projects.suggestedTeam")}
        </h3>
        {openRoles.length === 0 ? (
          <Badge tone="success">{t("projects.allRolesFilled")}</Badge>
        ) : suggestionResult?.valid ? (
          <div className="flex flex-col gap-3">
            <Badge tone="success">
              {t("projects.openRolesCovered")}: {openRoles.length}/{openRoles.length}
            </Badge>
            <ul className="flex flex-col gap-2">
              {suggestionResult.roleAssignments.map((a) => (
                <li key={a.roleId} className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {a.roleName} — {a.userId ? <UserLink userId={a.userId} name={db.users.find((u) => u.id === a.userId)?.name ?? "?"} /> : "?"}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {t("projects.covers")}: {a.coveredSkills.join(", ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{suggestionResult.reason}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Badge tone="danger">
              {t("projects.noValidTeam")} ({suggestionResult?.coveragePercent ?? 0}% {t("projects.coverage")})
            </Badge>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{suggestionResult?.reason}</p>
            {suggestionResult && suggestionResult.missingSkills.length > 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("projects.missing")}: {suggestionResult.missingSkills.join(", ")}
              </p>
            )}
          </div>
        )}
      </Card>

      {isOwner && openRoles.length > 0 && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("projects.potentialParticipants")}
          </h3>
          {potentialParticipants.every(({ ranked }) => ranked.length === 0) ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("findTeam.noCandidatesDesc")}</p>
          ) : (
            potentialParticipants.map(({ role, ranked }) =>
              ranked.length === 0 ? null : (
                <div key={role.id} className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{role.name}</p>
                  <ul className="flex flex-col gap-2">
                    {ranked.map(({ user: candidate, matchedSkills, missingSkills }) => {
                      const existingRequest = db.requests.find((r) => r.projectId === project.id && r.userId === candidate.id);
                      return (
                        <li
                          key={candidate.id}
                          className="flex flex-col gap-2 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar userId={candidate.id} name={candidate.name} size="sm" />
                            <UserLink userId={candidate.id} name={candidate.name} />
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
                              tone={
                                existingRequest.status === "accepted"
                                  ? "success"
                                  : existingRequest.status === "rejected"
                                    ? "danger"
                                    : "neutral"
                              }
                            >
                              {t(`status.${existingRequest.status}`)}
                            </Badge>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() =>
                                addRequest({
                                  projectId: project.id,
                                  userId: candidate.id,
                                  direction: "project_to_candidate",
                                  roleId: role.id,
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
                </div>
              )
            )
          )}
        </Card>
      )}

      {isOwner ? (
        <Card className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("projects.joinRequests")}
          </h3>
          {requests.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("projects.noRequestsYet")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {requests.map((r) => {
                const u = db.users.find((user) => user.id === r.userId);
                const roleName = project.roles.find((role) => role.id === r.roleId)?.name;
                const isInvite = r.direction === "project_to_candidate";
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-black/10 p-3 text-sm dark:border-white/10"
                  >
                    <span className="flex flex-col">
                      {u ? <UserLink userId={u.id} name={u.name} showAvatar /> : "?"}
                      <span className="text-xs text-zinc-400">
                        {roleName && `${roleName} · `}
                        {isInvite ? t("findTeam.invitedBy") : t("projects.applied")}
                      </span>
                    </span>
                    {r.status === "pending" ? (
                      isInvite ? (
                        <Badge tone="neutral">{t("findTeam.awaitingResponse")}</Badge>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => updateRequestStatus(r.id, "accepted")}>
                            {t("common.accept")}
                          </Button>
                          <Button variant="danger" onClick={() => updateRequestStatus(r.id, "rejected")}>
                            {t("common.reject")}
                          </Button>
                        </div>
                      )
                    ) : (
                      <Badge tone={r.status === "accepted" ? "success" : "danger"}>{t(`status.${r.status}`)}</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {!db.currentUserId ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
                {t("auth.login")}
              </Link>{" "}
              {t("common.loginToContinue")}
            </p>
          ) : myRequest ? (
            myRequest.direction === "project_to_candidate" && myRequest.status === "pending" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{t("findTeam.youWereInvited")}</span>
                <Button variant="secondary" onClick={() => updateRequestStatus(myRequest.id, "accepted")}>
                  {t("common.accept")}
                </Button>
                <Button variant="danger" onClick={() => updateRequestStatus(myRequest.id, "rejected")}>
                  {t("common.reject")}
                </Button>
              </div>
            ) : (
              <Badge tone={myRequest.status === "accepted" ? "success" : myRequest.status === "rejected" ? "danger" : "neutral"}>
                {t("request.yourStatus")}: {t(`status.${myRequest.status}`)}
              </Badge>
            )
          ) : (
            <>
              {openRoles.length > 0 && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("projects.applyingFor")}</span>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  >
                    <option value="">{t("projects.anyRole")}</option>
                    {openRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <Button onClick={handleJoinRequest} className="self-start">
                {t("common.requestToJoin")}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
