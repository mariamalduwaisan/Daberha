"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { t, tx } from "@/lib/translations";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PAGE_TITLES: Record<string, { ar: string; en: string }> = {
  "/dashboard":           { ar: "لوحة التحكم",  en: "Dashboard"  },
  "/dashboard/training":  { ar: "التدريب",       en: "Practice"   },
  "/dashboard/plans":     { ar: "الخطط",         en: "Plans"      },
  "/dashboard/materials": { ar: "المصادر",       en: "Resources"  },
  "/dashboard/history":   { ar: "السجل",         en: "History"    },
};

const PAGE_SUBS: Record<string, { ar: string; en: string }> = {
  "/dashboard":           { ar: "مرحباً بك — نظرة عامة على تقدمك",              en: "Welcome back — here's your progress overview" },
  "/dashboard/training":  { ar: "أجرِ مقابلات تجريبية مع المساعد الذكي",         en: "Run AI-powered mock interview sessions"        },
  "/dashboard/plans":     { ar: "تابع مسارك التحضيري خطوة بخطوة",               en: "Track your prep journey step by step"          },
  "/dashboard/materials": { ar: "أدلة وفيديوهات ومقالات للتحضير",                en: "Guides, videos & articles for interview prep"  },
  "/dashboard/history":   { ar: "راجع جلساتك السابقة ودرجاتك",                   en: "Review your past sessions and scores"          },
};

export default function TopBar() {
  const pathname         = usePathname();
  const { lang, isRTL } = useLanguage();
  const [email, setEmail]  = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) =>
      setEmail(user?.email ?? "")
    );
  }, []);

  const title = PAGE_TITLES[pathname] ?? PAGE_TITLES["/dashboard"];
  const sub   = PAGE_SUBS[pathname]   ?? PAGE_SUBS["/dashboard"];

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-4 px-6 h-16">

        {/* Page title — desktop */}
        <div className="hidden md:block flex-1 min-w-0">
          <h1 className="text-base font-extrabold text-gray-900 leading-tight truncate">
            {tx(title, lang)}
          </h1>
          <p className="text-[11px] text-muted truncate hidden lg:block">{tx(sub, lang)}</p>
        </div>

        {/* Search */}
        <div className="flex-1 md:max-w-xs">
          <div className="relative">
            <Search size={14} className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted pointer-events-none`} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRTL ? "بحث..." : "Search..."}
              dir={isRTL ? "rtl" : "ltr"}
              className={`w-full ${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} py-2 rounded-xl border border-border bg-neutral text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition placeholder:text-muted`}
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle    className="hidden sm:flex border-border bg-neutral text-muted hover:text-primary hover:border-primary" />
          <LanguageToggle className="hidden sm:flex border-border bg-neutral text-muted hover:text-primary hover:border-primary" />

          <button aria-label="notifications"
            className="w-9 h-9 rounded-xl border border-border bg-neutral text-muted flex items-center justify-center hover:text-primary hover:border-primary transition">
            <Bell size={15} />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <span className="text-primary font-extrabold text-sm">
              {email.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
