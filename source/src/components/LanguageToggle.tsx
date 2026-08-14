"use client";

import { useEffect } from "react";
import { setLang, useLang } from "@/lib/i18n";

export function LanguageToggle() {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="flex items-center rounded-full border border-surface-border p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLang("vi")}
        aria-pressed={lang === "vi"}
        className={`rounded-full px-2 py-1 transition-colors ${
          lang === "vi" ? "bg-accent text-white" : "text-muted hover:text-foreground"
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-2 py-1 transition-colors ${
          lang === "en" ? "bg-accent text-white" : "text-muted hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
