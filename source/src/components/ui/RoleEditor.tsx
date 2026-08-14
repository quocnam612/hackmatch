"use client";

import { useT } from "@/lib/i18n";
import { HardSkillInput } from "@/components/ui/SkillPickers";
import { Button, TextField } from "@/components/ui/Primitives";
import type { ProjectRole } from "@/types";

export function newRoleId(): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `role-${random}`;
}

export function RoleEditor({ roles, onChange }: { roles: ProjectRole[]; onChange: (roles: ProjectRole[]) => void }) {
  const t = useT();

  function addRole() {
    onChange([...roles, { id: newRoleId(), name: "", requiredSkills: [] }]);
  }

  function updateRole(id: string, patch: Partial<ProjectRole>) {
    onChange(roles.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRole(id: string) {
    onChange(roles.filter((r) => r.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-foreground">{t("projects.rolesHeading")}</span>
      {roles.length === 0 && <p className="text-xs text-muted">{t("projects.noRolesYet")}</p>}
      <div className="flex flex-col gap-4">
        {roles.map((role, index) => (
          <div key={role.id} className="flex flex-col gap-2 rounded-xl border border-surface-border p-3">
            <div className="flex items-center gap-2">
              <TextField
                value={role.name}
                onChange={(e) => updateRole(role.id, { name: e.target.value })}
                placeholder={`${t("projects.role")} ${index + 1}: e.g. Frontend Developer`}
                className="flex-1"
              />
              <Button type="button" variant="danger" onClick={() => removeRole(role.id)}>
                {t("common.remove")}
              </Button>
            </div>
            <HardSkillInput
              label={t("projects.roleSkills")}
              value={role.requiredSkills}
              onChange={(skills) => updateRole(role.id, { requiredSkills: skills })}
            />
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={addRole} className="self-start">
        + {t("projects.addRole")}
      </Button>
    </div>
  );
}
