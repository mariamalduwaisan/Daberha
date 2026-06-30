"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, Mic2, Map, BookOpen, Clock, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";
import LanguageToggle from "@/components/LanguageToggle";

export default function SideNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { lang } = useLanguage();

  const tabs = [
    { href: "/dashboard",           label: tx(t.nav.home,      lang), Icon: House,    exact: true  },
    { href: "/dashboard/training",  label: tx(t.nav.training,  lang), Icon: Mic2,     exact: false },
    { href: "/dashboard/plans",     label: tx(t.nav.plans,     lang), Icon: Map,      exact: false },
    { href: "/dashboard/materials", label: tx(t.nav.materials, lang), Icon: BookOpen, exact: false },
    { href: "/dashboard/history",   label: tx(t.nav.history,   lang), Icon: Clock,    exact: false },
  ];

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
  }

  return (
    <aside className="fixed top-0 right-0 h-full w-64 bg-[#0A0E1A] border-l border-white/5 z-40 flex-col hidden md:flex">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
            <span className="text-white font-extrabold text-sm">دب</span>
          </div>
          <div>
            <p className="font-extrabold text-white text-base leading-tight">{tx(t.nav.appName, lang)}</p>
            <p className="text-[11px] text-white/40">{tx(t.nav.tagline, lang)}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {tabs.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                active
                  ? "bg-primary/20 text-primary"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}>
              <Icon size={19} strokeWidth={active ? 2.5 : 1.8}
                className={`transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"}`} />
              <span className="font-semibold text-sm">{label}</span>
              {active && <span className="mr-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: lang toggle + sign out */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <div className="px-4 py-2">
          <LanguageToggle className="w-full justify-center bg-white/5 border-white/10 text-white/60 hover:text-primary hover:border-primary" />
        </div>
        <button onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:bg-red-900/20 hover:text-red-400 transition-all w-full group">
          <LogOut size={18} className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-semibold text-sm">{tx(t.nav.signOut, lang)}</span>
        </button>
      </div>
    </aside>
  );
}
