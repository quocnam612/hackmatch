"use client";

const THEME_KEY = "hackmatch:theme";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none" className={className}>
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
    </svg>
  );
}

function toggle() {
  const root = document.documentElement;
  const next = !root.classList.contains("dark");
  root.classList.toggle("dark", next);
  window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-black/10 bg-zinc-200 transition-colors dark:border-white/10 dark:bg-indigo-600"
    >
      <span className="flex h-4.5 w-4.5 translate-x-1 items-center justify-center rounded-full bg-white text-zinc-500 shadow transition-transform dark:translate-x-6">
        {/* Both icons always render — CSS (not JS branching) picks which is visible,
            so server and client markup are always identical and never mismatch. */}
        <SunIcon className="dark:hidden" />
        <MoonIcon className="hidden dark:block" />
      </span>
    </button>
  );
}
