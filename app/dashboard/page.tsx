import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Bell, BookOpen, Mic2, Clock, Map, ChevronLeft, Sparkles } from "lucide-react";

const quickLinks = [
  {
    href: "/dashboard/materials",
    label: "المصادر",
    sub: "مكتبة الدروس والملفات",
    Icon: BookOpen,
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    href: "/dashboard/training",
    label: "تدريب",
    sub: "مقابلات تجريبية ذكية",
    Icon: Mic2,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    href: "/dashboard/history",
    label: "السجل",
    sub: "أداؤك وتقدمك المحرز",
    Icon: Clock,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    href: "/dashboard/plans",
    label: "الخطط",
    sub: "مساراتك التعليمية",
    Icon: Map,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { count: sessionCount } = await supabase
    .from("chat_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const name = profile?.full_name || user?.email?.split("@")[0] || "المستخدم";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-surface border-b border-border">
        <button
          aria-label="الإشعارات"
          className="w-11 h-11 rounded-full bg-neutral border border-border flex items-center justify-center text-muted transition active:scale-95"
        >
          <Bell size={20} />
        </button>
        <span className="text-lg font-extrabold text-primary">دبرها</span>
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm select-none">
          {initials}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">مرحباً، {name}</h2>
          <p className="text-muted text-sm mt-1 leading-relaxed">
            {sessionCount
              ? `أجريت ${sessionCount} جلسة حتى الآن · استمر في التحضير!`
              : "ابدأ أولى جلساتك التدريبية اليوم"}
          </p>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ href, label, sub, Icon, iconBg, iconColor }) => (
            <Link
              key={href}
              href={href}
              className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-3 transition active:scale-95 hover:border-primary/30 hover:shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon size={20} className={iconColor} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-muted mt-0.5 leading-snug">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured CTA */}
        <Link
          href="/dashboard/training"
          className="block rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white p-5 shadow-lg shadow-primary/20 transition active:scale-95"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-white/70" />
            <span className="text-xs font-semibold text-white/80">ذكاء اصطناعي</span>
          </div>
          <h3 className="text-lg font-extrabold leading-snug">
            مقابلات تجريبية بالذكاء الاصطناعي
          </h3>
          <p className="text-sm text-white/75 mt-1.5 leading-relaxed">
            تدرب على أسئلة المقابلة وتلقَّ ملاحظات فورية من مساعدنا الذكي.
          </p>
          <div className="mt-4 inline-flex items-center gap-1 bg-white text-primary text-sm font-bold rounded-full px-4 py-1.5">
            ابدأ الآن
            <ChevronLeft size={14} />
          </div>
        </Link>
      </div>
    </div>
  );
}
