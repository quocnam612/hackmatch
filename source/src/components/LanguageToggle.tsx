"use client";

import { useEffect } from "react";
import { setLang, useLang } from "@/lib/i18n";

export function LanguageToggle() {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="flex items-center rounded-full border border-black/10 p-0.5 text-xs font-semibold dark:border-white/10">
      <button
        type="button"
        onClick={() => setLang("vi")}
        aria-pressed={lang === "vi"}
        className={`rounded-full px-2 py-1 transition-colors ${
          lang === "vi" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-2 py-1 transition-colors ${
          lang === "en" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        EN
      </button>
    </div>
  );
}
