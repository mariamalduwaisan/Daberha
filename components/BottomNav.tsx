"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Map, BookOpen, Mic2 } from "lucide-react";

const tabs = [
  { href: "/dashboard/history", label: "السجل",    Icon: Clock   },
  { href: "/dashboard/plans",   label: "الخطط",    Icon: Map     },
  { href: "/dashboard/materials", label: "المصادر", Icon: BookOpen },
  { href: "/dashboard/training", label: "تدريب",   Icon: Mic2    },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto bg-surface border-t border-border z-50">
      <div className="flex pb-safe">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center pt-2 pb-3 gap-1 relative transition-colors"
            >
              {isActive && (
                <span className="absolute top-0 inset-x-4 h-[3px] rounded-b-full bg-primary" />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? "text-primary" : "text-muted"}
              />
              <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-muted"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
