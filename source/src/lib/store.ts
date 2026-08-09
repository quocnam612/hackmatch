"use client";

import { useSyncExternalStore } from "react";
import type { AppNotification, ChatMessage, NotificationType, Project, TeamRequest, UserProfile } from "@/types";
import { seedUsers } from "@/data/seed";
import { seedProjects } from "@/data/seedProjects";

interface DB {
  users: UserProfile[];
  projects: Project[];
  requests: TeamRequest[];
  chatMessages: ChatMessage[];
  notifications: AppNotification[];
  currentUserId: string | null;
}

const STORAGE_KEY = "hackmatch:db:v7";
const EMPTY_DB: DB = {
  users: [],
  projects: [],
  requests: [],
  chatMessages: [],
  notifications: [],
  currentUserId: null,
};

function freshSeededDb(): DB {
  return {
    users: seedUsers(),
    projects: seedProjects(),
    requests: [],
    chatMessages: [],
    notifications: [],
    currentUserId: null,
  };
}

/** Backfills fields added after some records were already persisted, so stale
 * LocalStorage (e.g. from a schema change mid-session) can't crash the app —
 * this is defense-in-depth on top of the STORAGE_KEY version bump. */
function normalizeUser(u: Partial<UserProfile>): UserProfile {
  return {
    ...u,
    hardSkills: u.hardSkills ?? [],
    softSkills: u.softSkills ?? [],
    languages: u.languages ?? [],
    followedBy: u.followedBy ?? [],
  } as UserProfile;
}

function normalizeProject(p: Partial<Project>): Project {
  return {
    ...p,
    roles: p.roles ?? [],
    optionalSoftSkills: p.optionalSoftSkills ?? [],
    followedBy: p.followedBy ?? [],
  } as Project;
}

function loadInitial(): DB {
  if (typeof window === "undefined") return EMPTY_DB;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DB>;
      if (parsed && Array.isArray(parsed.users)) {
        return {
          users: parsed.users.map(normalizeUser),
          projects: (parsed.projects ?? []).map(normalizeProject),
          requests: parsed.requests ?? [],
          chatMessages: parsed.chatMessages ?? [],
          notifications: parsed.notifications ?? [],
          currentUserId: parsed.currentUserId ?? null,
        };
      }
    }
  } catch {
    // corrupt storage — fall through to a fresh seeded DB
  }
  return freshSeededDb();
}

let state: DB = loadInitial();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot(): DB {
  return EMPTY_DB;
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

export function addUser(input: Omit<UserProfile, "id" | "createdAt">): UserProfile {
  const user: UserProfile = {
    ...input,
    id: newId("user"),
    createdAt: new Date().toISOString(),
  };
  state = { ...state, users: [...state.users, user] };
  persist();
  return user;
}

export function updateUser(userId: string, patch: Partial<Omit<UserProfile, "id" | "createdAt">>) {
  state = {
    ...state,
    users: state.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
  };
  persist();
}

export function isUsernameTaken(db: DB, username: string, excludeUserId?: string): boolean {
  const normalized = username.trim().toLowerCase();
  return db.users.some((u) => u.id !== excludeUserId && u.username.toLowerCase() === normalized);
}

export function toggleFollowUser(targetUserId: string, followerId: string) {
  state = {
    ...state,
    users: state.users.map((u) => {
      if (u.id !== targetUserId) return u;
      const following = u.followedBy.includes(followerId);
      return { ...u, followedBy: following ? u.followedBy.filter((id) => id !== followerId) : [...u.followedBy, followerId] };
    }),
  };
  persist();
}

export function toggleFollowProject(projectId: string, followerId: string) {
  state = {
    ...state,
    projects: state.projects.map((p) => {
      if (p.id !== projectId) return p;
      const following = p.followedBy.includes(followerId);
      return { ...p, followedBy: following ? p.followedBy.filter((id) => id !== followerId) : [...p.followedBy, followerId] };
    }),
  };
  persist();
}

export function setCurrentUser(userId: string | null) {
  state = { ...state, currentUserId: userId };
  persist();
}

export function addProject(input: Omit<Project, "id" | "createdAt">): Project {
  const project: Project = {
    ...input,
    id: newId("project"),
    createdAt: new Date().toISOString(),
  };
  state = { ...state, projects: [...state.projects, project] };
  persist();
  return project;
}

export function updateProject(projectId: string, patch: Partial<Project>) {
  state = {
    ...state,
    projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...patch } : p)),
  };
  persist();
}

function pushNotification(input: Omit<AppNotification, "id" | "createdAt" | "read">) {
  const notification: AppNotification = {
    ...input,
    id: newId("notif"),
    read: false,
    createdAt: new Date().toISOString(),
  };
  state = { ...state, notifications: [...state.notifications, notification] };
}

export function addRequest(input: Omit<TeamRequest, "id" | "createdAt" | "status">): TeamRequest {
  const request: TeamRequest = {
    ...input,
    id: newId("request"),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  state = { ...state, requests: [...state.requests, request] };

  const project = state.projects.find((p) => p.id === input.projectId);
  if (project) {
    if (input.direction === "candidate_to_project") {
      // Candidate applied — notify the owner.
      pushNotification({
        userId: project.ownerId,
        type: "request_received",
        projectId: project.id,
        actorUserId: input.userId,
      });
    } else {
      // Owner invited a candidate — notify the candidate.
      pushNotification({
        userId: input.userId,
        type: "invite_received",
        projectId: project.id,
        actorUserId: project.ownerId,
      });
    }
  }
  persist();
  return request;
}

export function updateRequestStatus(requestId: string, status: TeamRequest["status"]) {
  let updated: TeamRequest | undefined;
  state = {
    ...state,
    requests: state.requests.map((r) => {
      if (r.id !== requestId) return r;
      updated = { ...r, status };
      return updated;
    }),
  };

  if (updated && (status === "accepted" || status === "rejected")) {
    const project = state.projects.find((p) => p.id === updated!.projectId);
    if (project) {
      if (updated.direction === "candidate_to_project") {
        // Owner decided on the candidate's application — notify the candidate.
        pushNotification({
          userId: updated.userId,
          type: status === "accepted" ? "request_accepted" : "request_rejected",
          projectId: project.id,
          actorUserId: project.ownerId,
        });
      } else {
        // Candidate decided on the owner's invite — notify the owner.
        pushNotification({
          userId: project.ownerId,
          type: status === "accepted" ? "invite_accepted" : "invite_rejected",
          projectId: project.id,
          actorUserId: updated.userId,
        });
      }
    }
  }
  persist();
}

export function markNotificationRead(notificationId: string) {
  state = {
    ...state,
    notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
  };
  persist();
}

export function markAllNotificationsRead(userId: string) {
  state = {
    ...state,
    notifications: state.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
  };
  persist();
}

export function addChatMessage(projectId: string, authorId: string, text: string): ChatMessage {
  const message: ChatMessage = {
    id: newId("msg"),
    projectId,
    authorId,
    text,
    createdAt: new Date().toISOString(),
  };
  state = { ...state, chatMessages: [...state.chatMessages, message] };
  persist();
  return message;
}

export function isProjectParticipant(db: DB, projectId: string, userId: string): boolean {
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return false;
  if (project.ownerId === userId) return true;
  return db.requests.some((r) => r.projectId === projectId && r.userId === userId && r.status === "accepted");
}

export function projectsForParticipant(db: DB, userId: string): Project[] {
  return db.projects.filter((p) => isProjectParticipant(db, p.id, userId));
}

export function projectsFollowedBy(db: DB, userId: string): Project[] {
  return db.projects.filter((p) => p.followedBy.includes(userId));
}

export type { NotificationType };
