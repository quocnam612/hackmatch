const COLORS = ["bg-accent", "bg-violet-500", "bg-fuchsia-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-teal-500", "bg-sky-500"];

function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

const SIZES = {
  sm: "h-6 w-6 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function Avatar({ userId, name, size = "md" }: { userId: string; name: string; size?: keyof typeof SIZES }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorForId(userId)} ${SIZES[size]}`}
      aria-hidden
    >
      {initial}
    </span>
  );
}
