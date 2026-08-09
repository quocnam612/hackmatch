import type {
  MatchResult,
  Project,
  ProjectRole,
  RoleAssignment,
  SoftSkillId,
  TeamMemberAllocation,
  TeamRequest,
  UserProfile,
} from "@/types";
import { projectRequiredSkills } from "@/types";
import { normalizeSkill } from "@/data/skills";

/** Hard caps guarantee the search always terminates quickly, per the no-infinite-loop requirement. */
const MAX_CANDIDATE_POOL = 14;
const MAX_COMBINATIONS = 50000;

interface RequiredSkill {
  raw: string;
  norm: string;
}

interface FindTeamInput {
  project: Pick<Project, "roles" | "optionalSoftSkills" | "teamSize">;
  candidates: UserProfile[];
  /** When set, the returned team (if any) is forced to include this candidate. */
  mustIncludeUserId?: string;
}

function dedupeRequired(skills: string[]): RequiredSkill[] {
  const seen = new Set<string>();
  const result: RequiredSkill[] = [];
  for (const raw of skills) {
    const norm = normalizeSkill(raw);
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      result.push({ raw: raw.trim(), norm });
    }
  }
  return result;
}

function candidateSkillSet(candidate: UserProfile): Set<string> {
  return new Set(candidate.hardSkills.map(normalizeSkill));
}

function countCovered(candidate: UserProfile, required: RequiredSkill[]): number {
  const set = candidateSkillSet(candidate);
  return required.reduce((n, r) => n + (set.has(r.norm) ? 1 : 0), 0);
}

function countSoftMatch(candidate: UserProfile, optionalSoftSkills: SoftSkillId[]): number {
  return candidate.softSkills.filter((s) => optionalSoftSkills.includes(s)).length;
}

function coveredRaw(candidate: UserProfile, required: RequiredSkill[]): string[] {
  const set = candidateSkillSet(candidate);
  return required.filter((r) => set.has(r.norm)).map((r) => r.raw);
}

function unionCoversAll(team: UserProfile[], required: RequiredSkill[]): boolean {
  const covered = new Set<string>();
  for (const member of team) for (const s of member.hardSkills) covered.add(normalizeSkill(s));
  return required.every((r) => covered.has(r.norm));
}

/** Bounded exhaustive search, smallest team size first, so results read as "minimal & optimal". */
function searchValidTeam(
  pool: UserProfile[],
  required: RequiredSkill[],
  teamSize: number,
  mustIncludeUserId?: string
): UserProfile[] | null {
  const forced = mustIncludeUserId ? pool.filter((c) => c.id === mustIncludeUserId) : [];
  const rest = pool.filter((c) => c.id !== mustIncludeUserId);

  let combosChecked = 0;
  let found: UserProfile[] | null = null;

  function dfs(start: number, chosen: UserProfile[], maxSize: number) {
    if (found || combosChecked >= MAX_COMBINATIONS) return;
    combosChecked++;
    if (unionCoversAll(chosen, required)) {
      found = chosen;
      return;
    }
    if (chosen.length >= maxSize) return;
    for (let i = start; i < rest.length; i++) {
      dfs(i + 1, [...chosen, rest[i]], maxSize);
      if (found) return;
    }
  }

  for (let size = Math.max(forced.length, 1); size <= teamSize && !found; size++) {
    dfs(0, forced, size);
  }

  return found;
}

/** Best-effort greedy set-cover, used only to explain what a size-limited team could still achieve. */
function greedyCover(
  pool: UserProfile[],
  required: RequiredSkill[],
  teamSize: number,
  mustIncludeUserId?: string
): UserProfile[] {
  const forced = mustIncludeUserId ? pool.find((c) => c.id === mustIncludeUserId) : undefined;
  const chosen: UserProfile[] = forced ? [forced] : [];
  const covered = new Set<string>();
  for (const member of chosen) for (const s of member.hardSkills) covered.add(normalizeSkill(s));

  const remainingPool = pool.filter((c) => c.id !== mustIncludeUserId);

  while (chosen.length < teamSize) {
    let best: UserProfile | null = null;
    let bestGain = 0;
    for (const candidate of remainingPool) {
      if (chosen.includes(candidate)) continue;
      const gain = candidate.hardSkills.filter(
        (s) => required.some((r) => r.norm === normalizeSkill(s)) && !covered.has(normalizeSkill(s))
      ).length;
      if (gain > bestGain) {
        bestGain = gain;
        best = candidate;
      }
    }
    if (!best) break;
    chosen.push(best);
    for (const s of best.hardSkills) covered.add(normalizeSkill(s));
    if (required.every((r) => covered.has(r.norm))) break;
  }

  return chosen;
}

/** Greedily assigns each role to the best-fit team member, most-constrained role first. Bounded (no recursion). */
function assignRoles(team: UserProfile[], roles: ProjectRole[]): Map<string, string[]> {
  const skillSets = new Map(team.map((u) => [u.id, new Set(u.hardSkills.map(normalizeSkill))]));
  const assignedMemberIds = new Set<string>();
  const memberRoleIds = new Map<string, string[]>();

  const withCandidates = roles
    .map((role) => {
      const reqNorm = role.requiredSkills.map(normalizeSkill);
      const qualified = team.filter((u) => reqNorm.every((s) => skillSets.get(u.id)!.has(s)));
      return { role, reqNorm, qualified };
    })
    .sort((a, b) => a.qualified.length - b.qualified.length);

  for (const { role, reqNorm, qualified } of withCandidates) {
    let chosen = qualified.find((u) => !assignedMemberIds.has(u.id)) ?? qualified[0];
    if (!chosen) {
      let bestCount = 0;
      for (const u of team) {
        const count = reqNorm.filter((s) => skillSets.get(u.id)!.has(s)).length;
        if (count > bestCount) {
          bestCount = count;
          chosen = u;
        }
      }
    }
    if (chosen) {
      assignedMemberIds.add(chosen.id);
      const arr = memberRoleIds.get(chosen.id) ?? [];
      arr.push(role.id);
      memberRoleIds.set(chosen.id, arr);
    }
  }

  return memberRoleIds;
}

function toAllocation(
  candidate: UserProfile,
  required: RequiredSkill[],
  optionalSoftSkills: SoftSkillId[],
  memberRoleIds: Map<string, string[]>
): TeamMemberAllocation {
  return {
    userId: candidate.id,
    coveredSkills: coveredRaw(candidate, required),
    matchedSoftSkills: candidate.softSkills.filter((s) => optionalSoftSkills.includes(s)),
    assignedRoleIds: memberRoleIds.get(candidate.id) ?? [],
  };
}

function toRoleAssignments(roles: ProjectRole[], team: UserProfile[], memberRoleIds: Map<string, string[]>): RoleAssignment[] {
  const roleToMember = new Map<string, string>();
  for (const [userId, roleIds] of memberRoleIds) for (const roleId of roleIds) roleToMember.set(roleId, userId);

  return roles.map((role) => {
    const userId = roleToMember.get(role.id) ?? null;
    const member = userId ? team.find((u) => u.id === userId) : undefined;
    const memberSkills = member ? new Set(member.hardSkills.map(normalizeSkill)) : new Set<string>();
    return {
      roleId: role.id,
      roleName: role.name,
      requiredSkills: role.requiredSkills,
      userId,
      coveredSkills: role.requiredSkills.filter((s) => memberSkills.has(normalizeSkill(s))),
    };
  });
}

function describeTeam(
  members: TeamMemberAllocation[],
  users: UserProfile[],
  roles: ProjectRole[],
  optionalSoftSkills: SoftSkillId[]
): string {
  const roleNameById = new Map(roles.map((r) => [r.id, r.name]));
  const parts = members.map((m) => {
    const name = users.find((u) => u.id === m.userId)?.name ?? "Unknown";
    const roleNames = m.assignedRoleIds.map((id) => roleNameById.get(id)).filter(Boolean).join(" & ");
    const rolePart = roleNames ? ` as ${roleNames}` : "";
    const soft = m.matchedSoftSkills.length > 0 ? ` (matches ${m.matchedSoftSkills.length} preferred soft skill${m.matchedSoftSkills.length > 1 ? "s" : ""})` : "";
    return `${name}${rolePart}${soft}`;
  });
  const softNote = optionalSoftSkills.length > 0 ? " Team was ranked to also favor your preferred soft skills where possible." : "";
  return `Minimal team of ${members.length} covering every role: ${parts.join("; ")}.${softNote}`;
}

/** Assigns a fixed team (e.g. already-accepted members) to roles without running any search. */
export function assignTeamToRoles(team: UserProfile[], roles: ProjectRole[]): RoleAssignment[] {
  const memberRoleIds = assignRoles(team, roles);
  return toRoleAssignments(roles, team, memberRoleIds);
}

export function findTeam({ project, candidates, mustIncludeUserId }: FindTeamInput): MatchResult {
  const required = dedupeRequired(projectRequiredSkills(project));
  const teamSize = Math.max(1, Math.floor(project.teamSize) || 1);

  if (required.length === 0) {
    return {
      valid: false,
      members: [],
      roleAssignments: [],
      coveragePercent: 0,
      missingSkills: [],
      reason: "Add at least one role with required skills before requesting a team suggestion.",
    };
  }

  if (mustIncludeUserId && !candidates.some((c) => c.id === mustIncludeUserId)) {
    return {
      valid: false,
      members: [],
      roleAssignments: [],
      coveragePercent: 0,
      missingSkills: required.map((r) => r.raw),
      reason: "Selected candidate not found in the pool.",
    };
  }

  // Skills nobody in the entire pool can cover — an immediate, definitive gap.
  const poolCoverage = new Set<string>();
  for (const c of candidates) for (const s of c.hardSkills) poolCoverage.add(normalizeSkill(s));
  const uncoverable = required.filter((r) => !poolCoverage.has(r.norm));
  if (uncoverable.length > 0) {
    return {
      valid: false,
      members: [],
      roleAssignments: project.roles.map((role) => ({
        roleId: role.id,
        roleName: role.name,
        requiredSkills: role.requiredSkills,
        userId: null,
        coveredSkills: [],
      })),
      coveragePercent: Math.round(((required.length - uncoverable.length) / required.length) * 100),
      missingSkills: uncoverable.map((r) => r.raw),
      reason: `No candidate in the pool has: ${uncoverable.map((r) => r.raw).join(", ")}. Recruit or register someone with these skills first.`,
    };
  }

  const relevant = candidates.filter(
    (c) => c.id === mustIncludeUserId || c.hardSkills.some((s) => required.some((r) => r.norm === normalizeSkill(s)))
  );
  if (mustIncludeUserId && !relevant.some((c) => c.id === mustIncludeUserId)) {
    const forcedCandidate = candidates.find((c) => c.id === mustIncludeUserId);
    if (forcedCandidate) relevant.push(forcedCandidate);
  }

  const ranked = [...relevant].sort((a, b) => {
    if (a.id === mustIncludeUserId) return -1;
    if (b.id === mustIncludeUserId) return 1;
    const coverDelta = countCovered(b, required) - countCovered(a, required);
    if (coverDelta !== 0) return coverDelta;
    return countSoftMatch(b, project.optionalSoftSkills) - countSoftMatch(a, project.optionalSoftSkills);
  });

  const pool = ranked.slice(0, MAX_CANDIDATE_POOL);
  const team = searchValidTeam(pool, required, teamSize, mustIncludeUserId);

  if (!team) {
    const partial = greedyCover(pool, required, teamSize, mustIncludeUserId);
    const covered = new Set(partial.flatMap((m) => coveredRaw(m, required).map(normalizeSkill)));
    const stillMissing = required.filter((r) => !covered.has(r.norm));
    const memberRoleIds = assignRoles(partial, project.roles);
    return {
      valid: false,
      members: partial.map((m) => toAllocation(m, required, project.optionalSoftSkills, memberRoleIds)),
      roleAssignments: toRoleAssignments(project.roles, partial, memberRoleIds),
      coveragePercent: Math.round(((required.length - stillMissing.length) / required.length) * 100),
      missingSkills: stillMissing.map((r) => r.raw),
      reason:
        stillMissing.length > 0
          ? `Covering every required skill needs more than ${teamSize} member(s) from the current pool; within that limit "${stillMissing.map((r) => r.raw).join(", ")}" would remain unmet.`
          : `A team covering every required skill needs more than ${teamSize} member(s).`,
    };
  }

  const memberRoleIds = assignRoles(team, project.roles);
  const members = team.map((m) => toAllocation(m, required, project.optionalSoftSkills, memberRoleIds));
  return {
    valid: true,
    members,
    roleAssignments: toRoleAssignments(project.roles, team, memberRoleIds),
    coveragePercent: 100,
    missingSkills: [],
    reason: describeTeam(members, candidates, project.roles, project.optionalSoftSkills),
  };
}

export interface RoleOpportunity {
  project: Project;
  role: ProjectRole;
  matchedSkills: string[];
  missingSkills: string[];
  gap: number;
}

/**
 * Bounded, non-combinatorial scan (no search/backtracking needed): for each open project the
 * user doesn't own, finds roles not yet filled by an accepted member, and — only when the user's
 * skills overlap that role at all — reports how many skills they'd still be missing (the "gap").
 */
export function findOpenRoleOpportunities(
  user: UserProfile,
  projects: Project[],
  requests: TeamRequest[],
  allUsers: UserProfile[]
): RoleOpportunity[] {
  const userSkills = new Set(user.hardSkills.map(normalizeSkill));
  const opportunities: RoleOpportunity[] = [];

  for (const project of projects) {
    if (project.ownerId === user.id) continue;
    const acceptedIds = new Set(
      requests.filter((r) => r.projectId === project.id && r.status === "accepted").map((r) => r.userId)
    );
    const acceptedMembers = allUsers.filter((u) => acceptedIds.has(u.id));

    for (const role of project.roles) {
      const reqNorm = role.requiredSkills.map(normalizeSkill);
      const alreadyFilled = acceptedMembers.some((m) => {
        const set = new Set(m.hardSkills.map(normalizeSkill));
        return reqNorm.every((s) => set.has(s));
      });
      if (alreadyFilled) continue;

      const matchedSkills = role.requiredSkills.filter((s) => userSkills.has(normalizeSkill(s)));
      if (matchedSkills.length === 0) continue;

      const missingSkills = role.requiredSkills.filter((s) => !userSkills.has(normalizeSkill(s)));
      opportunities.push({ project, role, matchedSkills, missingSkills, gap: missingSkills.length });
    }
  }

  return opportunities.sort((a, b) => a.gap - b.gap);
}

export interface CandidateMatch {
  user: UserProfile;
  matchedSkills: string[];
  missingSkills: string[];
}

/**
 * The recruiter-facing counterpart to findOpenRoleOpportunities: given one role, ranks the
 * candidate pool by how many of that role's skills they cover, excluding anyone with zero
 * overlap. Linear scan, no search — bounded by the candidate pool size.
 */
export function rankCandidatesForRole(role: ProjectRole, candidates: UserProfile[]): CandidateMatch[] {
  return candidates
    .map((user) => {
      const userSkills = new Set(user.hardSkills.map(normalizeSkill));
      const matchedSkills = role.requiredSkills.filter((s) => userSkills.has(normalizeSkill(s)));
      const missingSkills = role.requiredSkills.filter((s) => !userSkills.has(normalizeSkill(s)));
      return { user, matchedSkills, missingSkills };
    })
    .filter((c) => c.matchedSkills.length > 0)
    .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length);
}
