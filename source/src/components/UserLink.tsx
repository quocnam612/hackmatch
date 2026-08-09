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
      className={`inline-flex items-center gap-2 hover:text-indigo-600 hover:underline dark:hover:text-indigo-400 ${className}`}
    >
      {showAvatar && <Avatar userId={userId} name={name} size="sm" />}
      {name}
    </Link>
  );
}
