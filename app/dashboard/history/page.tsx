import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Mic2, TrendingUp, BarChart2, ChevronLeft, Star } from "lucide-react";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const withScores = (sessions ?? []).filter((s) => s.score != null);
  const avgScore = withScores.length
    ? Math.round(withScores.reduce((sum, s) => sum + s.score, 0) / withScores.length)
    : null;

  const totalSessions = sessions?.length ?? 0;
  const bestScore = withScores.length
    ? Math.max(...withScores.map((s) => s.score))
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-surface border-b border-border">
        <h1 className="text-xl font-extrabold text-gray-900">السجل</h1>
        <p className="text-muted text-sm mt-0.5">جلساتك التدريبية السابقة</p>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface rounded-2xl p-3.5 text-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <BarChart2 size={15} className="text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{totalSessions}</p>
            <p className="text-[10px] text-muted mt-0.5 leading-tight">الجلسات</p>
          </div>
          <div className="bg-surface rounded-2xl p-3.5 text-center">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={15} className="text-secondary" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">
              {avgScore != null ? `${avgScore}%` : "—"}
            </p>
            <p className="text-[10px] text-muted mt-0.5 leading-tight">متوسط الدرجة</p>
          </div>
          <div className="bg-surface rounded-2xl p-3.5 text-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
              <Star size={15} className="text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">
              {bestScore != null ? `${bestScore}%` : "—"}
            </p>
            <p className="text-[10px] text-muted mt-0.5 leading-tight">أفضل درجة</p>
          </div>
        </div>

        {/* Sessions list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-gray-900">الجلسات السابقة</h2>
          </div>

          {!sessions?.length ? (
            <div className="bg-surface rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mic2 size={26} className="text-primary" />
              </div>
              <p className="font-extrabold text-gray-900">لا توجد جلسات بعد</p>
              <p className="text-muted text-sm mt-1 leading-relaxed max-w-xs mx-auto">
                ابدأ مقابلة تجريبية لترى نتائجك هنا
              </p>
              <Link
                href="/dashboard/training"
                className="mt-5 inline-block bg-primary text-white text-sm font-bold rounded-full px-6 py-2.5 transition active:scale-95"
              >
                ابدأ التدريب
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => {
                const scoreColor =
                  session.score == null    ? ""
                  : session.score >= 80   ? "text-emerald-500"
                  : session.score >= 60   ? "text-amber-500"
                  :                        "text-red-500";

                return (
                  <div
                    key={session.id}
                    className="bg-surface rounded-2xl px-4 py-3.5 flex items-center gap-3.5"
                  >
                    {/* Icon square */}
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mic2 size={18} className="text-primary" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{session.title}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {new Date(session.created_at).toLocaleDateString("ar-KW", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Score / action */}
                    {session.score != null ? (
                      <span className={`text-base font-extrabold shrink-0 ${scoreColor}`}>
                        {session.score}%
                      </span>
                    ) : (
                      <ChevronLeft size={18} className="text-muted shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
