"use client";

import Link from "next/link";
import { useDB } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { UserMenu } from "@/components/UserMenu";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Primitives";

export function Header() {
  const db = useDB();
  const t = useT();
  const currentUser = db.users.find((u) => u.id === db.currentUserId);

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-black/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          <Logo size={32} />
          HackMatch
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300 sm:flex">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {t("nav.home")}
          </Link>
          <Link href="/projects" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {t("nav.projects")}
          </Link>
          <Link href="/find-team" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {t("nav.findTeam")}
          </Link>
          <Link href="/my-requests" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {t("nav.myRequests")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {currentUser ? (
            <>
              <NotificationBell />
              <UserMenu user={currentUser} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="secondary">{t("auth.login")}</Button>
              </Link>
              <Link href="/register">
                <Button>{t("auth.register")}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
