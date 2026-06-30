"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Mic2, Map, BookOpen } from "lucide-react";

const tabs = [
  { href: "/dashboard",           label: "الرئيسية", Icon: House    },
  { href: "/dashboard/training",  label: "تدريب",    Icon: Mic2     },
  { href: "/dashboard/plans",     label: "الخطط",    Icon: Map      },
  { href: "/dashboard/materials", label: "المصادر",  Icon: BookOpen },
];

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface border-t border-border z-50 md:hidden">
      <div className="flex pb-safe max-w-lg mx-auto">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center pt-2 pb-3 gap-1 relative transition-colors">
              {active && (
                <span className="absolute top-0 inset-x-4 h-[3px] rounded-b-full bg-primary" />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={`transition-transform duration-200 ${active ? "text-primary scale-110" : "text-muted"}`}
              />
              <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-muted"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
