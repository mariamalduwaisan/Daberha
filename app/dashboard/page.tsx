"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mic2, Map, BookOpen, Clock, TrendingUp,
  ChevronLeft, ChevronRight, Zap, Sparkles,
  BarChart2, Star, ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

type Session = { id: string; title: string; created_at: string; score: number | null };

export default function DashboardHome() {
  const { lang, isRTL } = useLanguage();
  const [sessions,   setSessions]   = useState<Session[]>([]);
  const [firstName,  setFirstName]  = useState("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setFirstName(user.email?.split("@")[0] ?? "");
      const { data } = await supabase
        .from("chat_sessions")
        .select("id,title,created_at,score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setSessions(data ?? []);
    })();
  }, []);

  const withScores = sessions.filter((s) => s.score != null);
  const avgScore   = withScores.length
    ? Math.round(withScores.reduce((a, s) => a + (s.score ?? 0), 0) / withScores.length)
    : null;
  const bestScore  = withScores.length ? Math.max(...withScores.map((s) => s.score ?? 0)) : null;

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const KPI = [
    {
      label:   { ar: "إجمالي الجلسات",  en: "Total Sessions"  },
      value:   sessions.length || "0",
      sub:     { ar: "جلسة تدريبية",    en: "practice sessions" },
      icon:    Mic2,
      color:   "text-primary",
      bg:      "bg-primary/10",
      border:  "border-primary/20",
    },
    {
      label:   { ar: "متوسط الدرجة",    en: "Avg Score"       },
      value:   avgScore != null ? `${avgScore}%` : "—",
      sub:     { ar: "عبر كل الجلسات",  en: "across all sessions" },
      icon:    BarChart2,
      color:   "text-secondary",
      bg:      "bg-secondary/10",
      border:  "border-secondary/20",
    },
    {
      label:   { ar: "أفضل درجة",       en: "Best Score"      },
      value:   bestScore != null ? `${bestScore}%` : "—",
      sub:     { ar: "أعلى درجة حتى الآن", en: "highest score so far" },
      icon:    Star,
      color:   "text-amber-500",
      bg:      "bg-amber-500/10",
      border:  "border-amber-500/20",
    },
    {
      label:   { ar: "خطط متاحة",       en: "Plans Available" },
      value:   "4",
      sub:     { ar: "مسار تحضيري",     en: "prep paths"      },
      icon:    TrendingUp,
      color:   "text-emerald-500",
      bg:      "bg-emerald-500/10",
      border:  "border-emerald-500/20",
    },
  ];

  const QUICK = [
    { href: "/dashboard/training",  labelAr: "ابدأ تدريباً",  labelEn: "Start Practice",  subAr: "مقابلة تجريبية",        subEn: "Mock interview",       Icon: Mic2,     accent: "bg-primary",     glow: "shadow-primary/25"     },
    { href: "/dashboard/plans",     labelAr: "خططي",          labelEn: "My Plans",        subAr: "تابع مسارك",            subEn: "Track your journey",   Icon: Map,      accent: "bg-secondary",   glow: "shadow-secondary/25"   },
    { href: "/dashboard/materials", labelAr: "المصادر",       labelEn: "Resources",       subAr: "أدلة وفيديوهات",        subEn: "Guides & videos",      Icon: BookOpen, accent: "bg-emerald-600", glow: "shadow-emerald-600/25" },
    { href: "/dashboard/history",   labelAr: "السجل",         labelEn: "History",         subAr: "جلساتك السابقة",        subEn: "Past sessions",        Icon: Clock,    accent: "bg-amber-500",   glow: "shadow-amber-500/25"   },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Welcome banner ── */}
      <div className="rounded-2xl bg-[#0A0E1A] relative overflow-hidden p-6 md:p-8 flex items-center justify-between gap-6">
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(124,58,237,.15) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* orb */}
        <div className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full bg-primary/10 animate-spin-slow pointer-events-none" />

        <div className="relative z-10">
          <p className="text-white/40 text-sm mb-1">{tx(t.home.greeting, lang)}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">{firstName}</h2>
          <div className="w-10 h-1 rounded-full bg-gradient-to-r from-primary to-secondary mt-2 mb-3" />
          <p className="text-white/50 text-sm max-w-sm leading-relaxed">{tx(t.home.subtitle, lang)}</p>
        </div>

        <div className="relative z-10 shrink-0 hidden sm:flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
            <div className="w-16 h-16 rounded-full bg-white/5 border border-primary/30 backdrop-blur flex items-center justify-center animate-float">
              <Sparkles size={26} className="text-primary" />
            </div>
          </div>
          <Link href="/dashboard/training"
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold rounded-xl px-4 py-2 shadow-lg shadow-primary/30 hover:bg-primary-dark transition active:scale-95">
            <Zap size={12} />{tx(t.home.startSession, lang)}
          </Link>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label.en} className={`bg-surface rounded-2xl border ${border} p-5 flex flex-col gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-gray-900 mt-0.5">{tx(label, lang)}</p>
              <p className="text-[11px] text-muted">{tx(sub, lang)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick actions — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">{tx(t.home.sections, lang)}</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK.map(({ href, labelAr, labelEn, subAr, subEn, Icon, accent, glow }) => (
              <Link key={href} href={href}
                className={`${accent} rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group transition hover:shadow-xl ${glow} active:scale-[0.97]`}>
                <div className="absolute inset-0 pointer-events-none opacity-10"
                  style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.25) 1px,transparent 1px)", backgroundSize: "14px 14px" }} />
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon size={19} className="text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">{isRTL ? labelAr : labelEn}</p>
                  <p className="text-white/55 text-xs mt-0.5">{isRTL ? subAr : subEn}</p>
                </div>
                <ArrowUpRight size={14} className="absolute top-4 left-4 text-white/30 group-hover:text-white/60 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* AI tip — 1/3 */}
        <div className="bg-surface rounded-2xl border border-border p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles size={15} className="text-primary" />
            </div>
            <p className="font-extrabold text-gray-900 text-sm">{isRTL ? "نصيحة اليوم" : "Today's Tip"}</p>
          </div>
          <div className="flex-1 bg-primary/5 rounded-xl p-4 border border-primary/10">
            <p className="text-sm text-gray-900 font-semibold leading-relaxed">
              {isRTL
                ? "استخدم أسلوب STAR في إجاباتك: الموقف → المهمة → الإجراء → النتيجة. يجعل إجاباتك واضحة وقابلة للقياس."
                : "Use the STAR method: Situation → Task → Action → Result. It makes your answers clear and measurable."}
            </p>
          </div>
          <Link href="/dashboard/training"
            className="flex items-center justify-center gap-2 bg-primary text-white text-xs font-bold rounded-xl py-2.5 transition hover:bg-primary-dark active:scale-95">
            <Mic2 size={13} />{isRTL ? "جرّبها الآن" : "Try it now"}
          </Link>
        </div>
      </div>

      {/* ── Recent sessions table ── */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-extrabold text-gray-900 text-sm">{tx(t.home.recentTitle, lang)}</h2>
          <Link href="/dashboard/history" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
            {tx(t.home.viewAll, lang)} <Chevron size={13} />
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulse-ring" />
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center animate-float">
                <TrendingUp size={24} className="text-primary" />
              </div>
            </div>
            <p className="font-extrabold text-gray-900 text-sm">{tx(t.home.emptyTitle, lang)}</p>
            <p className="text-muted text-xs mt-1 max-w-xs mx-auto leading-relaxed">{tx(t.home.emptySub, lang)}</p>
            <Link href="/dashboard/training"
              className="mt-4 inline-flex items-center gap-2 bg-primary text-white text-xs font-bold rounded-full px-5 py-2 transition hover:bg-primary-dark active:scale-95">
              <Mic2 size={12} />{tx(t.home.startTraining, lang)}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((s, i) => {
              const sc = s.score;
              const scoreColor = sc == null ? "" : sc >= 80 ? "text-emerald-500" : sc >= 60 ? "text-amber-500" : "text-red-500";
              return (
                <div key={s.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-neutral transition">
                  <span className="text-xs text-muted font-mono w-5 shrink-0">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mic2 size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                    <p className="text-xs text-muted">
                      {new Date(s.created_at).toLocaleDateString(isRTL ? "ar-KW" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {sc != null
                    ? (
                      <div className="shrink-0 text-right">
                        <span className={`text-sm font-extrabold ${scoreColor}`}>{sc}%</span>
                        <div className="w-16 h-1 rounded-full bg-gray-100 mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${sc >= 80 ? "bg-emerald-500" : sc >= 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${sc}%` }} />
                        </div>
                      </div>
                    )
                    : <span className="text-xs text-muted bg-gray-100 rounded-full px-2.5 py-1 shrink-0">{tx(t.home.noScore, lang)}</span>
                  }
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
