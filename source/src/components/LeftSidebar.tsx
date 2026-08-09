"use client";

import Link from "next/link";
import { projectsForParticipant, projectsFollowedBy, useDB } from "@/lib/store";
import { toggleLeftSidebar, useUiStore } from "@/lib/uiStore";
import { useT } from "@/lib/i18n";
import { Avatar } from "@/components/Avatar";
import { BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, FolderIcon, SettingsIcon } from "@/components/icons";

export function LeftSidebar() {
  const ui = useUiStore();
  const db = useDB();
  const t = useT();
  const currentUser = db.users.find((u) => u.id === db.currentUserId);

  if (!currentUser) return null;

  const open = ui.leftSidebarOpen;
  const hostedProjects = db.projects.filter((p) => p.ownerId === currentUser.id);
  const joinedProjects = projectsForParticipant(db, currentUser.id).filter((p) => p.ownerId !== currentUser.id);
  const followedProjects = projectsFollowedBy(db, currentUser.id);
  const following = db.users.filter((u) => u.id !== currentUser.id && u.followedBy.includes(currentUser.id));

  return (
    <aside
      className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col overflow-y-auto border-r border-black/10 bg-white/50 py-3 transition-[width] dark:border-white/10 dark:bg-white/[0.02] sm:flex ${
        open ? "w-56" : "w-14"
      }`}
    >
      <button
        type="button"
        onClick={() => toggleLeftSidebar()}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10 ${
          open ? "ml-auto mr-3" : "mx-auto"
        }`}
      >
        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </button>

      <nav className="flex flex-col gap-1 px-2">
        <Link
          href="/profile/edit"
          title={t("sidebar.accountSettings")}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
        >
          <SettingsIcon />
          {open && <span className="truncate">{t("sidebar.accountSettings")}</span>}
        </Link>
      </nav>

      <div className="mt-4 flex flex-col gap-1 px-2">
        {open && <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("sidebar.myProjects")}</p>}
        {hostedProjects.length === 0
          ? open && <p className="px-2 text-xs text-zinc-400">{t("sidebar.noneYet")}</p>
          : hostedProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                title={p.title}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <FolderIcon />
                {open && <span className="truncate">{p.title}</span>}
              </Link>
            ))}
      </div>

      <div className="mt-4 flex flex-col gap-1 px-2">
        {open && <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("sidebar.projectsJoined")}</p>}
        {joinedProjects.length === 0
          ? open && <p className="px-2 text-xs text-zinc-400">{t("sidebar.noneYet")}</p>
          : joinedProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                title={p.title}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <FolderIcon />
                {open && <span className="truncate">{p.title}</span>}
              </Link>
            ))}
      </div>

      <div className="mt-4 flex flex-col gap-1 px-2">
        {open && <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("sidebar.projectsFollowed")}</p>}
        {followedProjects.length === 0
          ? open && <p className="px-2 text-xs text-zinc-400">{t("sidebar.followProjectHint")}</p>
          : followedProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                title={p.title}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <BookmarkIcon />
                {open && <span className="truncate">{p.title}</span>}
              </Link>
            ))}
      </div>

      <div className="mt-4 flex flex-col gap-1 px-2">
        {open && <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("sidebar.following")}</p>}
        {following.length === 0
          ? open && <p className="px-2 text-xs text-zinc-400">{t("sidebar.followToAdd")}</p>
          : following.map((f) => (
              <Link
                key={f.id}
                href={`/users/${f.id}`}
                title={f.name}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <Avatar userId={f.id} name={f.name} size="sm" />
                {open && <span className="truncate">{f.name}</span>}
              </Link>
            ))}
      </div>
    </aside>
  );
}
