import Link from "next/link";
import { Avatar } from "@/components/Avatar";

export function UserLink({
  userId,
  name,
  showAvatar = false,
  className = "",
}: {
  userId: string;
  name: string;
  showAvatar?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/users/${userId}`}
      className={`inline-flex items-center gap-2 hover:text-accent hover:underline dark:hover:text-accent ${className}`}
    >
      {showAvatar && <Avatar userId={userId} name={name} size="sm" />}
      {name}
    </Link>
  );
}
