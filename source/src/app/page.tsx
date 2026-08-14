"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDB } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button, Card } from "@/components/ui/Primitives";

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-surface-border bg-surface/70 py-5">
      <span className="text-2xl font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export default function Home() {
  const db = useDB();
  const t = useT();
  const currentUser = db.users.find((u) => u.id === db.currentUserId);

  const stats = useMemo(() => {
    const totalRoles = db.projects.reduce((n, p) => n + p.roles.length, 0);
    const filledRoleUserIds = new Set(db.requests.filter((r) => r.status === "accepted").map((r) => `${r.projectId}:${r.userId}`));
    return {
      candidates: db.users.length,
      projects: db.projects.length,
      openRoles: Math.max(totalRoles - filledRoleUserIds.size, 0),
      matches: filledRoleUserIds.size,
    };
  }, [db.users.length, db.projects, db.requests]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <span className="inline-flex w-fit items-center gap-2 self-center rounded-full bg-accent/12 px-3 py-1 text-xs font-medium text-accent sm:self-start">
          {t("home.badge")}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{t("home.title")}</h1>
        <p className="max-w-xl text-muted sm:text-lg">
          {currentUser ? `${t("home.welcomeBack")}, ${currentUser.name}.` : t("home.subtitleGuest")}
        </p>
        <div className="flex justify-center gap-3 sm:justify-start">
          <Link href="/projects/new">
            <Button>{t("home.hostProject")}</Button>
          </Link>
          <Link href="/find-team">
            <Button variant="secondary">{t("home.findTeam")}</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={stats.candidates} label={t("home.statCandidates")} />
        <StatTile value={stats.projects} label={t("home.statProjects")} />
        <StatTile value={stats.openRoles} label={t("home.statOpenRoles")} />
        <StatTile value={stats.matches} label={t("home.statMatches")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col gap-2">
          <h3 className="font-semibold text-foreground">{t("home.step1Title")}</h3>
          <p className="text-sm text-muted">{t("home.step1Desc")}</p>
          <Link href="/register">
            <Button variant="secondary" className="mt-2">
              {t("auth.register")}
            </Button>
          </Link>
        </Card>
        <Card className="flex flex-col gap-2">
          <h3 className="font-semibold text-foreground">{t("home.step2Title")}</h3>
          <p className="text-sm text-muted">{t("home.step2Desc")}</p>
          <Link href="/projects">
            <Button variant="secondary" className="mt-2">
              {t("nav.projects")}
            </Button>
          </Link>
        </Card>
        <Card className="flex flex-col gap-2">
          <h3 className="font-semibold text-foreground">{t("home.step3Title")}</h3>
          <p className="text-sm text-muted">{t("home.step3Desc")}</p>
          <Link href="/find-team">
            <Button variant="secondary" className="mt-2">
              {t("home.findTeam")}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
