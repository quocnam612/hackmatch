"use client";

import { useSyncExternalStore } from "react";

type ChatView = "groups" | "messages";

interface UiState {
  chatOpen: boolean;
  chatView: ChatView;
  activeChatProjectId: string | null;
  leftSidebarOpen: boolean;
}

const EMPTY_UI_STATE: UiState = { chatOpen: false, chatView: "groups", activeChatProjectId: null, leftSidebarOpen: true };
let state: UiState = { ...EMPTY_UI_STATE };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot(): UiState {
  return EMPTY_UI_STATE;
}

export function useUiStore(): UiState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleChat() {
  const opening = !state.chatOpen;
  state = { ...state, chatOpen: opening, chatView: opening ? "groups" : state.chatView };
  emit();
}

export function closeChat() {
  state = { ...state, chatOpen: false };
  emit();
}

/** Deep-link straight to a project's messages (used by the "Open chat" button on a project page). */
export function openChatForProject(projectId: string) {
  state = { ...state, chatOpen: true, chatView: "messages", activeChatProjectId: projectId };
  emit();
}

export function setChatView(view: ChatView) {
  state = { ...state, chatView: view };
  emit();
}

export function openChatGroup(projectId: string) {
  state = { ...state, activeChatProjectId: projectId, chatView: "messages" };
  emit();
}

export function toggleLeftSidebar() {
  state = { ...state, leftSidebarOpen: !state.leftSidebarOpen };
  emit();
}
