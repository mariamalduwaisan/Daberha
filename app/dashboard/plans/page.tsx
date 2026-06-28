import { createClient } from "@/lib/supabase/server";

const PLANS = [
  {
    id: "nbk-trainee",
    title: "NBK Management Trainee",
    unitCount: 10,
    icon: "🏦",
    description: "برنامج شامل للتحضير لبرنامج الكوادر الوطنية في بنك الكويت الوطني",
  },
  {
    id: "boubyan-cs",
    title: "Boubyan Customer Service",
    unitCount: 8,
    icon: "🎧",
    description: "خدمة العملاء في بنك بوبيان – الأسئلة والمواقف الشائعة",
  },
  {
    id: "generic-banking",
    title: "Generic Banking Interview",
    unitCount: 12,
    icon: "👥",
    description: "دليل شامل للمقابلات المصرفية العامة في الكويت والخليج",
  },
  {
    id: "financial-analysis",
    title: "Financial Analysis Pro",
    unitCount: 5,
    icon: "📈",
    description: "التحليل المالي والنسب المحاسبية للمقابلات التقنية",
  },
];

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: activity } = await supabase
    .from("user_activity")
    .select("resource_id, metadata")
    .eq("user_id", user!.id)
    .eq("activity_type", "plan_progress");

  const progressMap: Record<string, number> = {};
  (activity ?? []).forEach((a) => {
    if (a.resource_id) progressMap[a.resource_id] = a.metadata?.progress ?? 0;
  });

  const activePlan = PLANS.find((p) => (progressMap[p.id] ?? 0) > 0) ?? null;

  return (
    <div className="flex flex-col min-h-screen bg-neutral">
      {/* Top bar */}
      <div className="px-5 pt-12 pb-4 bg-surface shadow-sm">
        <h1 className="text-xl font-extrabold text-gray-900">خططك التحضيرية</h1>
        <p className="text-muted text-sm">تابع تقدمك واستعد لمقابلتك بذكاء</p>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Active plan */}
        {activePlan && (
          <div className="bg-surface rounded-2xl border border-border p-5">
            <p className="text-xs text-muted mb-3">الخطة النشطة</p>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="font-extrabold text-gray-900 text-base">{activePlan.title}</h2>
                <span className="text-xs text-secondary font-medium bg-secondary/10 rounded-full px-2 py-0.5 inline-block mt-1">
                  قيد التقدم
                </span>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted">التقدم الإجمالي</span>
                    <span className="text-xs font-bold text-secondary">
                      {progressMap[activePlan.id] ?? 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{ width: `${progressMap[activePlan.id] ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <span className="text-3xl">{activePlan.icon}</span>
            </div>
            <button className="mt-4 w-full py-3 rounded-xl bg-secondary text-white font-bold text-sm">
              ← استمرار
            </button>
          </div>
        )}

        {/* Available plans */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">خطط متاحة لك</h2>
            <span className="text-xs text-muted">{PLANS.length} خطط</span>
          </div>
          <div className="space-y-3">
            {PLANS.filter((p) => !activePlan || p.id !== activePlan.id).map((plan) => (
              <div
                key={plan.id}
                className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4"
              >
                <span className="text-2xl shrink-0">{plan.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{plan.title}</p>
                  <p className="text-xs text-muted mt-0.5">{plan.unitCount} وحدات تعليمية</p>
                </div>
                <button className="text-xs font-bold text-primary border border-primary rounded-full px-3 py-1.5 shrink-0 transition hover:bg-primary hover:text-white">
                  بدء
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
