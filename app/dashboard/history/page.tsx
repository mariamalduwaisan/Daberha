import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
    <div className="flex flex-col min-h-screen bg-neutral">
      {/* Top bar */}
      <div className="px-5 pt-12 pb-4 bg-surface shadow-sm">
        <h1 className="text-xl font-extrabold text-gray-900">السجل</h1>
        <p className="text-muted text-sm">جلساتك التدريبية السابقة</p>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-2xl p-4 border border-border text-center">
            <p className="text-3xl font-extrabold text-secondary">
              {avgScore != null ? `${avgScore}%` : "—"}
            </p>
            <p className="text-xs text-muted mt-1">متوسط الدرجة</p>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border text-center">
            <p className="text-3xl font-extrabold text-primary">
              {sessions?.length ?? 0}
            </p>
            <p className="text-xs text-muted mt-1">إجمالي الجلسات</p>
          </div>
        </div>

        {/* Sessions list */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">الجلسات السابقة</h2>

          {!sessions?.length ? (
            <div className="bg-surface rounded-2xl border border-border p-8 text-center">
              <p className="text-4xl mb-3">🎤</p>
              <p className="font-medium text-gray-700">لا توجد جلسات بعد</p>
              <p className="text-muted text-sm mt-1">
                ابدأ مقابلة تجريبية لترى نتائجك هنا
              </p>
              <Link
                href="/dashboard/training"
                className="mt-4 inline-block bg-secondary text-white text-sm font-bold rounded-full px-5 py-2"
              >
                ابدأ التدريب
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{session.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(session.created_at).toLocaleDateString("ar-KW", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {session.score != null && (
                    <span
                      className={`text-lg font-extrabold ${
                        session.score >= 80
                          ? "text-emerald-500"
                          : session.score >= 60
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {session.score}%
                    </span>
                  )}
                  <span className="text-xs text-muted mr-3 bg-gray-100 rounded-full px-2 py-0.5">
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
