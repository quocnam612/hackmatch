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
        className="flex items-center gap-2 rounded-full border border-surface-border py-1.5 pl-1.5 pr-3 text-sm font-medium text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
      >
        <Avatar userId={user.id} name={user.name} size="sm" />
        {user.name}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-surface-border bg-surface/95 p-1.5 shadow-xl backdrop-blur-2xl">
            <Link
              href={`/users/${user.id}`}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              {t("auth.viewProfile")}
            </Link>
            <Link
              href="/profile/edit"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              {t("auth.editProfile")}
            </Link>
            <button
              onClick={() => {
                setCurrentUser(null);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
            >
              {t("auth.logout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
