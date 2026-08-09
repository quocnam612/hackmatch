import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500",
    secondary: "border border-black/10 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10",
    danger: "bg-red-600 text-white hover:bg-red-500",
    ghost: "text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "danger" | "accent" }) {
  const tones: Record<string, string> = {
    neutral: "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function TextField({ label, hint, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>}
      <input
        className={`rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>}
      <textarea
        className={`rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>}
    </label>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
      {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">{title}</p>
      {description && <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
      {action}
    </Card>
  );
}
