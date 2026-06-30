"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Map, BookOpen, Mic2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const tabs = [
  { href: "/dashboard/training", label: "تدريب",    Icon: Mic2     },
  { href: "/dashboard/plans",    label: "الخطط",    Icon: Map      },
  { href: "/dashboard/materials",label: "المصادر",  Icon: BookOpen },
  { href: "/dashboard/history",  label: "السجل",    Icon: Clock    },
];

export default function SideNav() {
  const pathname = usePathname();
  const router   = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="fixed top-0 right-0 h-full w-64 bg-surface border-l border-border z-40 flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-sm">دب</span>
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-base leading-tight">دبرها</p>
            <p className="text-[11px] text-muted">مساعد المقابلات</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="font-semibold text-sm">{label}</span>
              {isActive && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-red-50 hover:text-red-500 transition-colors w-full"
        >
          <LogOut size={18} />
          <span className="font-semibold text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
