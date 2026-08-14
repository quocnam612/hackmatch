import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[22px] border border-surface-border bg-surface/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.3)] ${className}`}
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
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";
  const variants: Record<string, string> = {
    primary: "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover",
    secondary:
      "border border-surface-border bg-surface text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.06]",
    danger: "bg-danger text-white hover:brightness-110",
    ghost: "text-accent hover:bg-accent/10",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "danger" | "accent" }) {
  const tones: Record<string, string> = {
    neutral: "bg-black/[0.05] text-muted dark:bg-white/10 dark:text-muted",
    success: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
    accent: "bg-accent/12 text-accent",
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
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <input
        className={`rounded-xl border border-surface-border bg-black/[0.03] px-3.5 py-2.5 text-sm text-foreground outline-none transition-shadow focus:border-accent/40 focus:bg-surface focus:ring-4 focus:ring-accent/15 dark:bg-white/[0.05] dark:focus:bg-surface ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <textarea
        className={`rounded-xl border border-surface-border bg-black/[0.03] px-3.5 py-2.5 text-sm text-foreground outline-none transition-shadow focus:border-accent/40 focus:bg-surface focus:ring-4 focus:ring-accent/15 dark:bg-white/[0.05] dark:focus:bg-surface ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="text-[15px] text-muted">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-3 py-14 text-center">
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </Card>
  );
}
