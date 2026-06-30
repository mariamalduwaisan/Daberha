"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className={`flex items-center gap-1 text-xs font-bold rounded-full border border-border bg-surface px-3 py-1.5 transition hover:border-primary hover:text-primary active:scale-95 ${className}`}
      aria-label="Toggle language"
    >
      <span className={lang === "en" ? "text-primary" : "text-muted"}>EN</span>
      <span className="text-muted">/</span>
      <span className={lang === "ar" ? "text-primary" : "text-muted"}>ع</span>
    </button>
  );
}
