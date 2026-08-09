"use client";

import { useState } from "react";
import Link from "next/link";
import { setCurrentUser } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Avatar } from "@/components/Avatar";
import type { UserProfile } from "@/types";

export function UserMenu({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-black/10 py-1.5 pl-1.5 pr-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
      >
        <Avatar userId={user.id} name={user.name} size="sm" />
        {user.name}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-black/10 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-zinc-950">
            <Link
              href={`/users/${user.id}`}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
            >
              {t("auth.viewProfile")}
            </Link>
            <Link
              href="/profile/edit"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
            >
              {t("auth.editProfile")}
            </Link>
            <button
              onClick={() => {
                setCurrentUser(null);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              {t("auth.logout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
