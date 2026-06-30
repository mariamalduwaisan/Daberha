"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic2, TrendingUp, BarChart2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

type Session = { id: string; title: string; created_at: string; score: number | null };

export default function HistoryPage() {
  const { lang, isRTL } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("chat_sessions")
        .select("id,title,created_at,score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => setSessions(data ?? []));
    });
  }, []);

  const withScores    = sessions.filter((s) => s.score != null);
  const avgScore      = withScores.length ? Math.round(withScores.reduce((sum, s) => sum + (s.score ?? 0), 0) / withScores.length) : null;
  const bestScore     = withScores.length ? Math.max(...withScores.map((s) => s.score ?? 0)) : null;
  const totalSessions = sessions.length;

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-24 md:pb-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 pb-5 bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-extrabold text-gray-900">{tx(t.history.title, lang)}</h1>
          <p className="text-muted text-sm mt-0.5">{tx(t.history.subtitle, lang)}</p>
        </div>
      </div>

      <div className="px-5 md:px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface rounded-2xl p-4 text-center">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <BarChart2 size={16} className="text-primary" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{totalSessions}</p>
              <p className="text-[11px] text-muted mt-0.5">{tx(t.history.sessions, lang)}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center">
              <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                <TrendingUp size={16} className="text-secondary" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {avgScore != null ? `${avgScore}%` : "—"}
              </p>
              <p className="text-[11px] text-muted mt-0.5">{tx(t.history.avgScore, lang)}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <Star size={16} className="text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {bestScore != null ? `${bestScore}%` : "—"}
              </p>
              <p className="text-[11px] text-muted mt-0.5">{tx(t.history.bestScore, lang)}</p>
            </div>
          </div>

          {/* Sessions */}
          <div>
            <h2 className="font-extrabold text-gray-900 mb-4">{tx(t.history.pastSessions, lang)}</h2>

            {!sessions.length ? (
              <div className="bg-surface rounded-2xl p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mic2 size={26} className="text-primary" />
                </div>
                <p className="font-extrabold text-gray-900">{tx(t.history.emptyTitle, lang)}</p>
                <p className="text-muted text-sm mt-1 leading-relaxed">{tx(t.history.emptySub, lang)}</p>
                <Link href="/dashboard/training"
                  className="mt-5 inline-block bg-primary text-white text-sm font-bold rounded-full px-6 py-2.5 transition active:scale-95">
                  {tx(t.history.startTraining, lang)}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sessions.map((session) => {
                  const scoreColor =
                    session.score == null  ? "" :
                    session.score >= 80    ? "text-emerald-500" :
                    session.score >= 60    ? "text-amber-500"   : "text-red-500";
                  return (
                    <div key={session.id} className="bg-surface rounded-2xl px-4 py-3.5 flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Mic2 size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{session.title}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {new Date(session.created_at).toLocaleDateString(isRTL ? "ar-KW" : "en-GB", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                      {session.score != null
                        ? <span className={`text-base font-extrabold shrink-0 ${scoreColor}`}>{session.score}%</span>
                        : <span className="text-xs text-muted bg-gray-100 rounded-full px-2.5 py-1 shrink-0">{tx(t.history.noScore, lang)}</span>
                      }
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
