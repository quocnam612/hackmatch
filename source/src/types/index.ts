export const SOFT_SKILLS = [
  { id: "presentation", label: "Presentation" },
  { id: "self_learning", label: "Self-learning" },
  { id: "critical_thinking", label: "Critical thinking" },
  { id: "brainstorming", label: "Brainstorming" },
  { id: "teamwork", label: "Teamwork" },
  { id: "leadership", label: "Leadership" },
  { id: "time_management", label: "Time management" },
  { id: "adaptability", label: "Adaptability" },
  { id: "communication", label: "Communication" },
  { id: "problem_solving", label: "Problem solving" },
] as const;

export type SoftSkillId = (typeof SOFT_SKILLS)[number]["id"];

export const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "vietnamese", label: "Vietnamese" },
  { id: "korean", label: "Korean" },
  { id: "japanese", label: "Japanese" },
  { id: "chinese", label: "Chinese" },
  { id: "french", label: "French" },
  { id: "german", label: "German" },
  { id: "spanish", label: "Spanish" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export interface UserProfile {
  id: string;
  /** Unique login handle, lowercase, distinct from the display name. */
  username: string;
  name: string;
  location?: string;
  githubUrl?: string;
  hardSkills: string[];
  softSkills: SoftSkillId[];
  /** Spoken/written languages, distinct from tech skills. */
  languages: LanguageId[];
  passwordHash: string;
  /** User ids who follow this profile. */
  followedBy: string[];
  /** Seeded mock account (default password "12345678"), as opposed to a user-registered one. */
  isSeed?: boolean;
  createdAt: string;
}

export const PROJECT_CATEGORIES = [
  { id: "hackathon", label: "Hackathon" },
  { id: "personal_project", label: "Personal project" },
  { id: "seminar", label: "Seminar" },
  { id: "thesis", label: "Thesis" },
  { id: "startup", label: "Startup" },
  { id: "workshop", label: "Workshop" },
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]["id"];

/** A seat on the team: a named responsibility plus the tech stack it needs. */
export interface ProjectRole {
  id: string;
  name: string;
  requiredSkills: string[];
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  ideaDescription: string;
  category: ProjectCategory;
  location?: string;
  deadline?: string;
  /** Repo link for code projects, or an event/hackathon page link. */
  externalLink?: string;
  roles: ProjectRole[];
  optionalSoftSkills: SoftSkillId[];
  teamSize: number;
  /** User ids who follow this project. */
  followedBy: string[];
  createdAt: string;
}

/** Union of every role's required skills — the flat set the matching engine covers. */
export function projectRequiredSkills(project: Pick<Project, "roles">): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const role of project.roles) {
    for (const skill of role.requiredSkills) {
      const norm = skill.trim().toLowerCase();
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        result.push(skill.trim());
      }
    }
  }
  return result;
}

export type RequestDirection = "candidate_to_project" | "project_to_candidate";
export type RequestStatus = "pending" | "accepted" | "rejected";

export interface TeamRequest {
  id: string;
  projectId: string;
  userId: string;
  direction: RequestDirection;
  status: RequestStatus;
  /** Which role this request targets, if the requester picked one. */
  roleId?: string;
  createdAt: string;
}

export interface TeamMemberAllocation {
  userId: string;
  coveredSkills: string[];
  matchedSoftSkills: SoftSkillId[];
  /** Role ids this member was assigned to cover. */
  assignedRoleIds: string[];
}

export interface RoleAssignment {
  roleId: string;
  roleName: string;
  requiredSkills: string[];
  userId: string | null;
  coveredSkills: string[];
}

export interface MatchResult {
  valid: boolean;
  members: TeamMemberAllocation[];
  roleAssignments: RoleAssignment[];
  coveragePercent: number;
  missingSkills: string[];
  reason: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export type NotificationType =
  | "request_received"
  | "request_accepted"
  | "request_rejected"
  | "invite_received"
  | "invite_accepted"
  | "invite_rejected";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  projectId: string;
  actorUserId: string;
  read: boolean;
  createdAt: string;
}
