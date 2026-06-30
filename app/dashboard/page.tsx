import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Mic2, Map, BookOpen, Clock,
  Zap, TrendingUp, ChevronLeft, Sparkles,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/training",
    label: "ابدأ التدريب",
    sub: "مقابلة تجريبية بالذكاء الاصطناعي",
    Icon: Mic2,
    bg: "bg-primary",
    delay: "delay-150",
  },
  {
    href: "/dashboard/plans",
    label: "خططي",
    sub: "تابع مسارك التحضيري",
    Icon: Map,
    bg: "bg-[#0F1E3C]",
    delay: "delay-225",
  },
  {
    href: "/dashboard/materials",
    label: "المصادر",
    sub: "أدلة وفيديوهات وملفات",
    Icon: BookOpen,
    bg: "bg-secondary",
    delay: "delay-300",
  },
  {
    href: "/dashboard/history",
    label: "السجل",
    sub: "جلساتك السابقة ودرجاتك",
    Icon: Clock,
    bg: "bg-emerald-600",
    delay: "delay-375",
  },
];

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const firstName = user?.email?.split("@")[0] ?? "مرحباً";

  const [{ data: sessions }, { data: activity }] = await Promise.all([
    supabase
      .from("chat_sessions")
      .select("id, title, created_at, score")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("user_activity")
      .select("created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const withScores = (sessions ?? []).filter((s) => s.score != null);
  const avgScore   = withScores.length
    ? Math.round(withScores.reduce((a, s) => a + s.score, 0) / withScores.length)
    : null;

  const lastActive = activity?.[0]?.created_at
    ? new Date(activity[0].created_at).toLocaleDateString("ar-KW", { day: "numeric", month: "long" })
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-24 md:pb-10">
      {/* ── Hero banner ── */}
      <div className="relative bg-[#0F1E3C] overflow-hidden px-5 md:px-8 pt-12 pb-10">
        {/* animated grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.25) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
        {/* slow-spinning orbs */}
        <div className="absolute left-[-80px] bottom-[-80px] w-64 h-64 rounded-full bg-primary/30 animate-spin-slow pointer-events-none" />
        <div className="absolute left-[-40px] bottom-[-40px] w-40 h-40 rounded-full bg-primary/20 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 flex items-center justify-between gap-6">
          <div className="animate-slide-up">
            <p className="text-white/50 text-sm font-medium mb-1">مرحباً،</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{firstName}</h1>
            <p className="text-white/60 text-sm mt-2 leading-relaxed max-w-xs">
              استمر في التحضير — كل جلسة تقربك من المقابلة المثالية
            </p>
            {lastActive && (
              <p className="text-white/40 text-xs mt-3">آخر نشاط: {lastActive}</p>
            )}
            <Link href="/dashboard/training"
              className="mt-5 inline-flex items-center gap-2 bg-primary text-white text-sm font-bold rounded-xl px-5 py-2.5 transition hover:bg-primary-dark active:scale-95 animate-slide-up delay-150">
              <Zap size={15} />
              ابدأ جلسة جديدة
            </Link>
          </div>

          {/* floating icon */}
          <div className="shrink-0 hidden sm:flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring delay-300" />
              <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-float">
                <Sparkles size={34} className="text-primary" />
              </div>
            </div>
            <span className="text-[11px] font-bold bg-white/10 text-white/70 rounded-full px-3 py-1">
              ذكاء اصطناعي
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up delay-75">
            <div className="bg-surface rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900">{sessions?.length ?? 0}</p>
              <p className="text-xs text-muted mt-1">جلسة تدريبية</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-primary">
                {avgScore != null ? `${avgScore}%` : "—"}
              </p>
              <p className="text-xs text-muted mt-1">متوسط الدرجة</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-secondary">4</p>
              <p className="text-xs text-muted mt-1">خطط متاحة</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-600">6</p>
              <p className="text-xs text-muted mt-1">مصادر تعليمية</p>
            </div>
          </div>

          {/* ── Quick actions grid ── */}
          <div>
            <h2 className="font-extrabold text-gray-900 mb-4 animate-fade-in delay-150">الأقسام الرئيسية</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(({ href, label, sub, Icon, bg, delay }) => (
                <Link key={href} href={href}
                  className={`animate-slide-up ${delay} ${bg} rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group transition hover:opacity-90 active:scale-95`}>
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="z-10">
                    <p className="font-extrabold text-white text-sm">{label}</p>
                    <p className="text-white/60 text-[11px] mt-0.5 leading-snug">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Recent sessions ── */}
          {sessions && sessions.length > 0 ? (
            <div className="animate-slide-up delay-375">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-gray-900">آخر الجلسات</h2>
                <Link href="/dashboard/history" className="text-xs text-primary font-bold flex items-center gap-1">
                  عرض الكل <ChevronLeft size={14} />
                </Link>
              </div>
              <div className="space-y-2">
                {sessions.map((s) => {
                  const scoreColor =
                    s.score == null  ? "" :
                    s.score >= 80    ? "text-emerald-500" :
                    s.score >= 60    ? "text-amber-500"   : "text-red-500";
                  return (
                    <div key={s.id} className="bg-surface rounded-2xl px-4 py-3.5 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Mic2 size={17} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {new Date(s.created_at).toLocaleDateString("ar-KW", { day: "numeric", month: "long" })}
                        </p>
                      </div>
                      {s.score != null
                        ? <span className={`text-sm font-extrabold shrink-0 ${scoreColor}`}>{s.score}%</span>
                        : <span className="text-xs text-muted bg-gray-100 rounded-full px-2.5 py-1 shrink-0">بدون درجة</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="animate-scale-in delay-300 bg-surface rounded-2xl p-8 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-float">
                  <TrendingUp size={28} className="text-primary" />
                </div>
              </div>
              <p className="font-extrabold text-gray-900">لا توجد جلسات بعد</p>
              <p className="text-muted text-sm mt-1 leading-relaxed max-w-xs mx-auto">
                ابدأ أول مقابلة تجريبية وستظهر نتائجك هنا
              </p>
              <Link href="/dashboard/training"
                className="mt-5 inline-flex items-center gap-2 bg-primary text-white text-sm font-bold rounded-full px-6 py-2.5 transition active:scale-95 hover:bg-primary-dark">
                <Mic2 size={14} />
                ابدأ التدريب
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
