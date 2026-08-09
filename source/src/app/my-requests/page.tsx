"use client";

import Link from "next/link";
import { updateRequestStatus, useDB } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Badge, Button, Card, EmptyState, SectionHeading } from "@/components/ui/Primitives";

export default function MyRequestsPage() {
  const db = useDB();
  const t = useT();
  const myRequests = db.requests.filter((r) => r.userId === db.currentUserId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <SectionHeading title={t("myRequests.title")} subtitle={t("myRequests.subtitle")} />
      {!db.currentUserId ? (
        <EmptyState
          title={t("common.loginFirstTitle")}
          description={t("common.loginToContinue")}
          action={
            <Link href="/login">
              <Button>{t("auth.login")}</Button>
            </Link>
          }
        />
      ) : myRequests.length === 0 ? (
        <EmptyState title={t("myRequests.noneTitle")} description={t("myRequests.noneDesc")} />
      ) : (
        <div className="flex flex-col gap-3">
          {myRequests.map((r) => {
            const project = db.projects.find((p) => p.id === r.projectId);
            const roleName = project?.roles.find((role) => role.id === r.roleId)?.name;
            const isInvite = r.direction === "project_to_candidate";
            return (
              <Card key={r.id} className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <Link
                    href={`/projects/${r.projectId}`}
                    className="text-sm font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                  >
                    {project?.title ?? "?"}
                  </Link>
                  <span className="text-xs text-zinc-400">
                    {roleName && `${roleName} · `}
                    {isInvite ? t("findTeam.youWereInvited") : t("projects.applied")}
                  </span>
                </div>
                {isInvite && r.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => updateRequestStatus(r.id, "accepted")}>
                      {t("common.accept")}
                    </Button>
                    <Button variant="danger" onClick={() => updateRequestStatus(r.id, "rejected")}>
                      {t("common.reject")}
                    </Button>
                  </div>
                ) : (
                  <Badge tone={r.status === "accepted" ? "success" : r.status === "rejected" ? "danger" : "neutral"}>
                    {t(`status.${r.status}`)}
                  </Badge>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
