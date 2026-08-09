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
        className="fixed right-0 top-20 z-40 flex items-center gap-1.5 rounded-l-xl border border-r-0 border-black/10 bg-white px-2.5 py-3 text-zinc-600 shadow-md hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300"
      >
        <ChatIcon />
      </button>

      {ui.chatOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 sm:hidden" onClick={closeChat} />
          <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-950">
            <div className="flex items-center gap-2 border-b border-black/10 px-3 py-3 dark:border-white/10">
              {ui.chatView === "messages" && (
                <button
                  type="button"
                  onClick={() => setChatView("groups")}
                  aria-label="Back to chat groups"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
                >
                  <BackIcon />
                </button>
              )}
              <h2 className="flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {ui.chatView === "messages" ? activeProject?.title ?? t("chat.title") : t("chat.title")}
              </h2>
              <button
                type="button"
                onClick={closeChat}
                className="text-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {ui.chatView === "groups" ? (
              myProjects.length === 0 ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
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
                          className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-white/5"
                        >
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.title}</span>
                          <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
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
                    <p className="text-center text-sm text-zinc-400">{t("chat.noMessages")}</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {messages.map((m) => {
                        const author = db.users.find((u) => u.id === m.authorId);
                        const mine = m.authorId === currentUser.id;
                        return (
                          <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                            <span className="text-[11px] text-zinc-400">{author?.name ?? "?"}</span>
                            <span
                              className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${
                                mine
                                  ? "bg-indigo-600 text-white"
                                  : "bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-100"
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
                <form onSubmit={handleSend} className="flex gap-2 border-t border-black/10 p-3 dark:border-white/10">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t("chat.placeholder")}
                    className="flex-1 rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
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
