"use client";

import { useState, type FormEvent } from "react";
import { addChatMessage, projectsForParticipant, useDB } from "@/lib/store";
import { closeChat, openChatGroup, setChatView, toggleChat, useUiStore } from "@/lib/uiStore";
import { useT } from "@/lib/i18n";
import { BackIcon, ChatIcon } from "@/components/icons";
import { Button } from "@/components/ui/Primitives";

export function ChatDrawer() {
  const ui = useUiStore();
  const db = useDB();
  const t = useT();
  const [draft, setDraft] = useState("");
  const currentUser = db.users.find((u) => u.id === db.currentUserId);

  if (!currentUser) return null;

  const myProjects = projectsForParticipant(db, currentUser.id);
  const activeProject = myProjects.find((p) => p.id === ui.activeChatProjectId);
  const messages = activeProject ? db.chatMessages.filter((m) => m.projectId === activeProject.id) : [];

  function lastMessageFor(projectId: string) {
    return [...db.chatMessages].filter((m) => m.projectId === projectId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  }

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeProject || !currentUser) return;
    addChatMessage(activeProject.id, currentUser.id, draft.trim());
    setDraft("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => toggleChat()}
        aria-label={ui.chatOpen ? "Close chats" : "Open chats"}
        className="fixed right-0 top-20 z-40 flex items-center gap-1.5 rounded-l-2xl border border-r-0 border-surface-border bg-surface/90 px-2.5 py-3 text-muted shadow-md backdrop-blur-xl hover:text-accent"
      >
        <ChatIcon />
      </button>

      {ui.chatOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 sm:hidden" onClick={closeChat} />
          <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-surface-border bg-surface/95 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-2 border-b border-surface-border px-3 py-3">
              {ui.chatView === "messages" && (
                <button
                  type="button"
                  onClick={() => setChatView("groups")}
                  aria-label="Back to chat groups"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                >
                  <BackIcon />
                </button>
              )}
              <h2 className="flex-1 truncate text-sm font-semibold text-foreground">
                {ui.chatView === "messages" ? activeProject?.title ?? t("chat.title") : t("chat.title")}
              </h2>
              <button
                type="button"
                onClick={closeChat}
                className="text-lg text-muted hover:text-foreground"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {ui.chatView === "groups" ? (
              myProjects.length === 0 ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted">
                  {t("chat.noneTitle")}
                </div>
              ) : (
                <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
                  {myProjects.map((p) => {
                    const last = lastMessageFor(p.id);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => openChatGroup(p.id)}
                          className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                        >
                          <span className="text-sm font-medium text-foreground">{p.title}</span>
                          <span className="truncate text-xs text-muted">
                            {last ? last.text : t("chat.noMessagesShort")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-sm text-muted/70">{t("chat.noMessages")}</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {messages.map((m) => {
                        const author = db.users.find((u) => u.id === m.authorId);
                        const mine = m.authorId === currentUser.id;
                        return (
                          <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                            <span className="text-[11px] text-muted/70">{author?.name ?? "?"}</span>
                            <span
                              className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${
                                mine
                                  ? "bg-accent text-white"
                                  : "bg-black/[0.05] text-foreground dark:bg-white/10"
                              }`}
                            >
                              {m.text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <form onSubmit={handleSend} className="flex gap-2 border-t border-surface-border p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t("chat.placeholder")}
                    className="flex-1 rounded-full border border-surface-border bg-black/[0.03] px-3.5 py-2 text-sm text-foreground outline-none focus:ring-4 focus:ring-accent/15 dark:bg-white/[0.05]"
                  />
                  <Button type="submit">{t("common.send")}</Button>
                </form>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
