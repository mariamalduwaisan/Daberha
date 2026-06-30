"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, Mic2, Map, BookOpen, Clock, LogOut, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

const NAV_GROUPS = [
  {
    labelAr: "القائمة",
    labelEn: "Menu",
    items: [
      { href: "/dashboard",          labelKey: "home",      Icon: House,    exact: true  },
      { href: "/dashboard/training", labelKey: "training",  Icon: Mic2,     exact: false },
    ],
  },
  {
    labelAr: "التطوير",
    labelEn: "Progress",
    items: [
      { href: "/dashboard/plans",     labelKey: "plans",     Icon: Map,      exact: false },
      { href: "/dashboard/materials", labelKey: "materials", Icon: BookOpen, exact: false },
    ],
  },
  {
    labelAr: "التحليلات",
    labelEn: "Analytics",
    items: [
      { href: "/dashboard/history",  labelKey: "history",   Icon: Clock,    exact: false },
    ],
  },
];

export default function SideNav() {
  const pathname           = usePathname();
  const router             = useRouter();
  const { lang, isRTL }   = useLanguage();
  const [email, setEmail]  = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) =>
      setEmail(user?.email ?? "")
    );
  }, []);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
  }

  const navLabel = (key: string) =>
    tx((t.nav as Record<string, { ar: string; en: string }>)[key], lang);

  const sidePos = isRTL ? "right-0 border-l" : "left-0 border-r";
  const dotPos  = isRTL ? "mr-auto" : "ml-auto";

  return (
    <aside className={`fixed top-0 ${sidePos} h-full w-64 bg-[#0A0E1A] border-white/5 z-40 flex-col hidden md:flex`}>

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/40">
            <BarChart2 size={17} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-base leading-tight">{tx(t.nav.appName, lang)}</p>
            <p className="text-[11px] text-white/35">{tx(t.nav.tagline, lang)}</p>
          </div>
        </div>
      </div>

      {/* ── Nav groups ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelEn}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-3 mb-1.5">
              {isRTL ? group.labelAr : group.labelEn}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, labelKey, Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-white/40 hover:bg-white/5 hover:text-white/80"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      active ? "bg-primary/20" : "group-hover:bg-white/8"
                    }`}>
                      <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                    </div>
                    <span className="text-sm font-semibold">{navLabel(labelKey)}</span>
                    {active && <span className={`${dotPos} w-1.5 h-1.5 rounded-full bg-primary`} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-white/5 p-3 space-y-2">
        {/* Toggles row */}
        <div className="flex gap-2">
          <ThemeToggle    className="flex-1 justify-center bg-white/5 border-white/10 text-white/50 hover:text-primary hover:border-primary" />
          <LanguageToggle className="flex-1 justify-center bg-white/5 border-white/10 text-white/50 hover:text-primary hover:border-primary" />
        </div>

        {/* User row */}
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary font-extrabold text-xs">
              {email.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="text-white/50 text-xs flex-1 truncate">{email}</p>
          <button onClick={signOut} aria-label="sign out"
            className="text-white/25 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-900/20">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
