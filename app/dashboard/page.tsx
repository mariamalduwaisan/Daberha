"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic2, Map, BookOpen, Clock, Zap, TrendingUp, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";
import LanguageToggle from "@/components/LanguageToggle";

type Session = { id: string; title: string; created_at: string; score: number | null };

export default function DashboardHome() {
  const { lang, isRTL } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [sessions,  setSessions]  = useState<Session[]>([]);
  const [lastActive, setLastActive] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setFirstName(user.email?.split("@")[0] ?? "");

      const [{ data: sess }, { data: act }] = await Promise.all([
        supabase.from("chat_sessions").select("id,title,created_at,score").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("user_activity").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      ]);
      setSessions(sess ?? []);
      if (act?.[0]) setLastActive(new Date(act[0].created_at).toLocaleDateString(isRTL ? "ar-KW" : "en-GB", { day: "numeric", month: "long" }));
    })();
  }, [isRTL]);

  const withScores = sessions.filter((s) => s.score != null);
  const avgScore   = withScores.length ? Math.round(withScores.reduce((a, s) => a + (s.score ?? 0), 0) / withScores.length) : null;

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const QUICK_ACTIONS = [
    { href: "/dashboard/training",  label: tx(t.home.actions.training.label,  lang), sub: tx(t.home.actions.training.sub,  lang), Icon: Mic2,     bg: "bg-primary",    delay: "delay-150" },
    { href: "/dashboard/plans",     label: tx(t.home.actions.plans.label,     lang), sub: tx(t.home.actions.plans.sub,     lang), Icon: Map,      bg: "bg-[#0F1E3C]", delay: "delay-225" },
    { href: "/dashboard/materials", label: tx(t.home.actions.materials.label, lang), sub: tx(t.home.actions.materials.sub, lang), Icon: BookOpen, bg: "bg-secondary",  delay: "delay-300" },
    { href: "/dashboard/history",   label: tx(t.home.actions.history.label,   lang), sub: tx(t.home.actions.history.sub,   lang), Icon: Clock,    bg: "bg-emerald-600",delay: "delay-375" },
  ];

  const STATS = [
    { value: sessions.length,                       label: tx(t.home.stats.sessions,  lang), color: "text-white"          },
    { value: avgScore != null ? `${avgScore}%` : "—", label: tx(t.home.stats.avgScore, lang), color: "text-primary"        },
    { value: 4,                                      label: tx(t.home.stats.plans,     lang), color: "text-secondary"      },
    { value: 6,                                      label: tx(t.home.stats.resources, lang), color: "text-emerald-400"    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0E1A] pb-24 md:pb-10" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Stellar hero ── */}
      <div className="relative overflow-hidden px-5 md:px-8 pt-10 pb-12">
        {/* star-dot background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(124,58,237,.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* spinning orb */}
        <div className="absolute top-[-120px] left-[-120px] w-80 h-80 rounded-full bg-primary/10 animate-spin-slow pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full bg-secondary/8 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* top bar */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-extrabold text-xs">دب</span>
              </div>
              <span className="text-white font-extrabold text-base">{tx(t.nav.appName, lang)}</span>
            </div>
            <LanguageToggle className="bg-white/5 border-white/10 text-white/60 hover:text-primary hover:border-primary" />
          </div>

          {/* greeting */}
          <div className="flex items-center justify-between gap-6">
            <div className="animate-slide-up">
              <p className="text-white/40 text-sm font-medium mb-1">{tx(t.home.greeting, lang)}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{firstName}</h1>
              {/* gradient accent line */}
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-primary to-secondary mt-3 mb-4" />
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">{tx(t.home.subtitle, lang)}</p>
              {lastActive && <p className="text-white/30 text-xs mt-3">{tx(t.home.lastActive, lang)} {lastActive}</p>}

              <Link href="/dashboard/training"
                className="mt-6 inline-flex items-center gap-2 bg-primary text-white text-sm font-bold rounded-xl px-5 py-3 shadow-lg shadow-primary/30 hover:bg-primary-dark transition active:scale-95 animate-slide-up delay-150">
                <Zap size={15} />
                {tx(t.home.startSession, lang)}
              </Link>
            </div>

            {/* floating icon */}
            <div className="shrink-0 hidden sm:flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring delay-300" />
                <div className="w-20 h-20 rounded-full bg-white/5 border border-primary/30 flex items-center justify-center animate-float backdrop-blur-md">
                  <Sparkles size={32} className="text-primary" />
                </div>
              </div>
              <span className="text-[11px] font-bold bg-white/5 border border-white/10 text-white/50 rounded-full px-3 py-1">
                {tx(t.home.ai, lang)}
              </span>
            </div>
          </div>

          {/* stats — glassmorphism cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 animate-slide-up delay-75">
            {STATS.map(({ value, label, color }) => (
              <div key={label} className="rounded-2xl bg-white/5 border border-white/8 backdrop-blur-sm px-4 py-4 text-center">
                <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                <p className="text-xs text-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="px-5 md:px-8 py-6 bg-neutral flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="font-extrabold text-gray-900 mb-4 animate-fade-in">{tx(t.home.sections, lang)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(({ href, label, sub, Icon, bg, delay }) => (
                <Link key={href} href={href}
                  className={`animate-slide-up ${delay} ${bg} rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group transition hover:opacity-90 active:scale-95`}>
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.2) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="z-10">
                    <p className="font-extrabold text-white text-sm">{label}</p>
                    <p className="text-white/55 text-[11px] mt-0.5 leading-snug">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* recent sessions */}
          {sessions.length > 0 ? (
            <div className="animate-slide-up delay-375">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-gray-900">{tx(t.home.recentTitle, lang)}</h2>
                <Link href="/dashboard/history" className="text-xs text-primary font-bold flex items-center gap-1">
                  {tx(t.home.viewAll, lang)} <Chevron size={14} />
                </Link>
              </div>
              <div className="space-y-2">
                {sessions.map((s) => {
                  const color = s.score == null ? "" : s.score >= 80 ? "text-emerald-500" : s.score >= 60 ? "text-amber-500" : "text-red-500";
                  return (
                    <div key={s.id} className="bg-surface rounded-2xl px-4 py-3.5 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Mic2 size={17} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {new Date(s.created_at).toLocaleDateString(isRTL ? "ar-KW" : "en-GB", { day: "numeric", month: "long" })}
                        </p>
                      </div>
                      {s.score != null
                        ? <span className={`text-sm font-extrabold shrink-0 ${color}`}>{s.score}%</span>
                        : <span className="text-xs text-muted bg-gray-100 rounded-full px-2.5 py-1 shrink-0">{tx(t.home.noScore, lang)}</span>
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
              <p className="font-extrabold text-gray-900">{tx(t.home.emptyTitle, lang)}</p>
              <p className="text-muted text-sm mt-1 leading-relaxed max-w-xs mx-auto">{tx(t.home.emptySub, lang)}</p>
              <Link href="/dashboard/training"
                className="mt-5 inline-flex items-center gap-2 bg-primary text-white text-sm font-bold rounded-full px-6 py-2.5 transition active:scale-95 hover:bg-primary-dark">
                <Mic2 size={14} />{tx(t.home.startTraining, lang)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
