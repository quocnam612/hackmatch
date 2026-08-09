"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { Button, SectionHeading } from "@/components/ui/Primitives";
import { ProjectBrowser } from "@/components/ProjectBrowser";

export default function ProjectsPage() {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={t("projects.title")} subtitle={t("projects.subtitle")} />
        <Link href="/projects/new">
          <Button>{t("projects.new")}</Button>
        </Link>
      </div>
      <ProjectBrowser />
    </div>
  );
}
