"use client";

import { useState } from "react";
import Link from "next/link";
import { markAllNotificationsRead, markNotificationRead, useDB } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { BellIcon } from "@/components/icons";
import type { AppNotification } from "@/types";

function notificationText(n: AppNotification, actorName: string, projectTitle: string, t: (key: string) => string): string {
  switch (n.type) {
    case "request_received":
      return `${actorName} ${t("notif.requestReceived")} "${projectTitle}".`;
    case "request_accepted":
      return `${t("notif.requestAccepted")} "${projectTitle}".`;
    case "request_rejected":
      return `${t("notif.requestRejected")} "${projectTitle}" ${t("notif.wasDeclined")}.`;
    case "invite_received":
      return `${actorName} ${t("notif.inviteReceived")} "${projectTitle}".`;
    case "invite_accepted":
      return `${actorName} ${t("notif.inviteAccepted")} "${projectTitle}".`;
    case "invite_rejected":
      return `${actorName} ${t("notif.inviteRejected")} "${projectTitle}".`;
    default:
      return "";
  }
}

export function NotificationBell() {
  const db = useDB();
  const t = useT();
  const [open, setOpen] = useState(false);
  const currentUser = db.users.find((u) => u.id === db.currentUserId);

  if (!currentUser) return null;

  const myNotifications = [...db.notifications]
    .filter((n) => n.userId === currentUser.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-surface-border text-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-surface-border bg-surface/95 p-2 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-semibold text-foreground">{t("notif.title")}</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead(currentUser.id)}
                  className="text-xs text-accent hover:underline"
                >
                  {t("notif.markAllRead")}
                </button>
              )}
            </div>
            {myNotifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted/70">{t("notif.none")}</p>
            ) : (
              <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                {myNotifications.map((n) => {
                  const actor = db.users.find((u) => u.id === n.actorUserId);
                  const project = db.projects.find((p) => p.id === n.projectId);
                  return (
                    <li key={n.id}>
                      <Link
                        href={project ? `/projects/${project.id}` : "#"}
                        onClick={() => {
                          markNotificationRead(n.id);
                          setOpen(false);
                        }}
                        className={`block rounded-lg px-2 py-2 text-sm hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ${
                          n.read ? "text-muted" : "font-medium text-foreground"
                        }`}
                      >
                        {notificationText(n, actor?.name ?? t("notif.someone"), project?.title ?? t("notif.aProject"), t)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
