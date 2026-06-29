import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Mic2, TrendingUp, BarChart2 } from "lucide-react";

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

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-surface border-b border-border">
        <h1 className="text-xl font-extrabold text-gray-900">السجل</h1>
        <p className="text-muted text-sm mt-0.5">جلساتك التدريبية السابقة</p>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-2xl p-4 border border-border text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <TrendingUp size={14} className="text-primary" />
              <span className="text-[11px] text-muted font-medium">متوسط الدرجة</span>
            </div>
            <p className="text-3xl font-extrabold text-primary">
              {avgScore != null ? `${avgScore}%` : "—"}
            </p>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <BarChart2 size={14} className="text-secondary" />
              <span className="text-[11px] text-muted font-medium">إجمالي الجلسات</span>
            </div>
            <p className="text-3xl font-extrabold text-secondary">
              {sessions?.length ?? 0}
            </p>
          </div>
        </div>

        {/* Sessions list */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">الجلسات السابقة</h2>

          {!sessions?.length ? (
            <div className="bg-surface rounded-2xl border border-border p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mic2 size={26} className="text-primary" />
              </div>
              <p className="font-semibold text-gray-900">لا توجد جلسات بعد</p>
              <p className="text-muted text-sm mt-1 leading-relaxed">
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
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mic2 size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{session.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(session.created_at).toLocaleDateString("ar-KW", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {session.score != null && (
                    <span className={`text-lg font-extrabold shrink-0 ${
                      session.score >= 80 ? "text-emerald-500" :
                      session.score >= 60 ? "text-amber-500" : "text-red-500"
                    }`}>
                      {session.score}%
                    </span>
                  )}
                  <span className="text-xs text-muted bg-gray-100 rounded-full px-2.5 py-1 shrink-0">
                    مراجعة
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
