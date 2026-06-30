"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Mic2, Map, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

export default function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  const tabs = [
    { href: "/dashboard",           label: tx(t.nav.home,      lang), Icon: House,    exact: true  },
    { href: "/dashboard/training",  label: tx(t.nav.training,  lang), Icon: Mic2,     exact: false },
    { href: "/dashboard/plans",     label: tx(t.nav.plans,     lang), Icon: Map,      exact: false },
    { href: "/dashboard/materials", label: tx(t.nav.materials, lang), Icon: BookOpen, exact: false },
  ];

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[#0A0E1A]/95 backdrop-blur-md border-t border-white/5 z-50 md:hidden">
      <div className="flex pb-safe max-w-lg mx-auto">
        {tabs.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center pt-2.5 pb-3 gap-1 relative transition-colors">
              {active && (
                <span className="absolute top-0 inset-x-4 h-[2px] rounded-b-full bg-primary" />
              )}
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8}
                className={`transition-all duration-200 ${active ? "text-primary scale-110" : "text-white/40"}`} />
              <span className={`text-[10px] font-semibold transition-colors ${active ? "text-primary" : "text-white/40"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
