import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { count: sessionCount } = await supabase
    .from("chat_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const name =
    profile?.full_name || user?.email?.split("@")[0] || "المستخدم";

  const quickLinks = [
    {
      href: "/dashboard/materials",
      label: "المواد",
      sub: "مكتبة المصادر والدروس",
      emoji: "📚",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      href: "/dashboard/training",
      label: "تدريب",
      sub: "مقابلات تجريبية ذكية",
      emoji: "🎤",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      href: "/dashboard/history",
      label: "السجل",
      sub: "الأداء والتقدم المحرز",
      emoji: "📊",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      href: "/dashboard/plans",
      label: "الخطط",
      sub: "مساراتك التعليمية",
      emoji: "🗺️",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-surface shadow-sm">
        <button className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
          🔔
        </button>
        <span className="text-lg font-extrabold text-secondary">دبرها</span>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">مرحباً، {name}! 👋</h2>
          <p className="text-muted text-sm mt-1">
            {sessionCount
              ? `أجريت ${sessionCount} جلسة حتى الآن · استمر!`
              : "ابدأ أولى جلساتك التدريبية اليوم"}
          </p>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl border ${item.bg} ${item.border} p-4 flex flex-col gap-2 transition active:scale-95`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="font-bold text-gray-900 text-sm">{item.label}</span>
              <span className="text-xs text-muted leading-snug">{item.sub}</span>
            </Link>
          ))}
        </div>

        {/* Featured CTA */}
        <Link
          href="/dashboard/training"
          className="block rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark text-white p-5 shadow-md transition active:scale-95"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold bg-white/20 rounded-full px-2 py-0.5">
              ميزة جديدة
            </span>
          </div>
          <h3 className="text-lg font-bold leading-snug">
            مقابلات تجريبية بالذكاء الاصطناعي
          </h3>
          <p className="text-sm text-white/80 mt-1 leading-relaxed">
            تدرب على أسئلة المقابلة وتلقَّ ملاحظات فورية من مساعدنا الذكي.
          </p>
          <div className="mt-4 inline-block bg-white text-secondary text-sm font-bold rounded-full px-4 py-1.5">
            ابدأ الآن ←
          </div>
        </Link>
      </div>
    </div>
  );
}
