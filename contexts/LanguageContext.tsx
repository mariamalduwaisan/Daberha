"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/translations";

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  isRTL: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = localStorage.getItem("daberha-lang") as Lang | null;
    if (stored === "en" || stored === "ar") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("daberha-lang", l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  }

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
