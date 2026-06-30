"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic2, TrendingUp, BarChart2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

type Session = { id: string; title: string; created_at: string; score: number | null };

export default function HistoryPage() {
  const { lang, isRTL } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      createClient().from("chat_sessions")
        .select("id,title,created_at,score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => setSessions(data ?? []));
    });
  }, []);

  const withScores    = sessions.filter((s) => s.score != null);
  const avgScore      = withScores.length ? Math.round(withScores.reduce((a, s) => a + (s.score ?? 0), 0) / withScores.length) : null;
  const bestScore     = withScores.length ? Math.max(...withScores.map((s) => s.score ?? 0)) : null;

  return (
    <div className="p-6 md:p-8 space-y-6" dir={isRTL ? "rtl" : "ltr"}>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: tx(t.history.sessions,  lang), value: sessions.length,                         Icon: BarChart2, color: "text-primary",    bg: "bg-primary/10",    border: "border-primary/20"    },
          { label: tx(t.history.avgScore,  lang), value: avgScore  != null ? `${avgScore}%`  : "—", Icon: TrendingUp, color: "text-secondary",  bg: "bg-secondary/10",  border: "border-secondary/20"  },
          { label: tx(t.history.bestScore, lang), value: bestScore != null ? `${bestScore}%` : "—", Icon: Star,       color: "text-amber-500",  bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
        ].map(({ label, value, Icon, color, bg, border }) => (
          <div key={label} className={`bg-surface rounded-2xl border ${border} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={19} className={color} />
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sessions table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-extrabold text-gray-900 text-sm">{tx(t.history.pastSessions, lang)}</h2>
        </div>

        {!sessions.length ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mic2 size={24} className="text-primary" />
            </div>
            <p className="font-extrabold text-gray-900 text-sm">{tx(t.history.emptyTitle, lang)}</p>
            <p className="text-muted text-xs mt-1">{tx(t.history.emptySub, lang)}</p>
            <Link href="/dashboard/training"
              className="mt-4 inline-block bg-primary text-white text-xs font-bold rounded-full px-5 py-2 transition hover:bg-primary-dark active:scale-95">
              {tx(t.history.startTraining, lang)}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((s, i) => {
              const sc = s.score;
              const scoreColor = sc == null ? "" : sc >= 80 ? "text-emerald-500" : sc >= 60 ? "text-amber-500" : "text-red-500";
              const Arr = isRTL ? ChevronLeft : ChevronRight;
              return (
                <div key={s.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-neutral transition">
                  <span className="text-xs text-muted font-mono w-5 shrink-0 text-center">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mic2 size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                    <p className="text-xs text-muted">
                      {new Date(s.created_at).toLocaleDateString(isRTL ? "ar-KW" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {sc != null ? (
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-sm font-extrabold ${scoreColor}`}>{sc}%</span>
                      <div className="w-20 h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${sc >= 80 ? "bg-emerald-500" : sc >= 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${sc}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted shrink-0">
                      <span className="text-xs">{tx(t.history.noScore, lang)}</span>
                      <Arr size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
