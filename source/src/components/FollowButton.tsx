"use client";

import { useT } from "@/lib/i18n";
import { CheckIcon, UserPlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Primitives";

export function FollowButton({ following, onToggle }: { following: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <Button type="button" variant={following ? "secondary" : "primary"} onClick={onToggle}>
      {following ? <CheckIcon size={14} /> : <UserPlusIcon size={14} />}
      {following ? t("common.following") : t("common.follow")}
    </Button>
  );
}
