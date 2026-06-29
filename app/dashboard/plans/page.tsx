import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Circle, Lock, ChevronLeft, Zap, BookOpen } from "lucide-react";

type Step = {
  id: string;
  title: string;
  description: string;
  status: "done" | "active" | "locked";
};

const PLAN_STEPS: Record<string, Step[]> = {
  "nbk-trainee": [
    { id: "1", title: "تحليل السيرة الذاتية",      description: "تحسين سيرتك الذاتية لتتوافق مع معايير القطاع المصرفي الكويتي.",     status: "done"   },
    { id: "2", title: "الأسئلة المتوقعة",           description: "الذكاء الاصطناعي يُعدّ 15 سؤالاً مخصصاً بناءً على متطلبات بنك NBK.",  status: "active" },
    { id: "3", title: "مقابلة تجريبية",             description: "محاكاة لمقابلة حقيقية مع ملاحظات صوتية فورية.",                      status: "locked" },
    { id: "4", title: "اللمسات الأخيرة",            description: "مراجعة المفاهيم الأساسية وتوجيهات ذهنية قبل يوم المقابلة.",          status: "locked" },
  ],
  "boubyan-cs": [
    { id: "1", title: "فهم ثقافة بوبيان",           description: "القيم الجوهرية للبنك ورؤيته الإسلامية.",                             status: "done"   },
    { id: "2", title: "أسئلة خدمة العملاء",         description: "أشهر المواقف وكيفية التعامل معها.",                                  status: "active" },
    { id: "3", title: "تمرين الاستجابة السريعة",    description: "جلسة تدريبية على الإجابات الصحيحة تحت الضغط.",                       status: "locked" },
  ],
  "generic-banking": [
    { id: "1", title: "أسس القطاع المصرفي",         description: "المصطلحات والمنتجات الأساسية في البنوك الكويتية.",                   status: "active" },
    { id: "2", title: "الأسئلة السلوكية",           description: "إتقان أسلوب STAR في الإجابة.",                                      status: "locked" },
    { id: "3", title: "مقابلة تجريبية شاملة",       description: "محاكاة كاملة لمقابلة بنك.",                                          status: "locked" },
  ],
  "financial-analysis": [
    { id: "1", title: "النسب المالية الأساسية",     description: "السيولة، الربحية، والرافعة المالية.",                                 status: "active" },
    { id: "2", title: "قراءة القوائم المالية",      description: "تحليل الميزانية وقائمة الدخل.",                                       status: "locked" },
  ],
};

const SKILL_FOCUS = [
  {
    tag: "توصية الذكاء الاصطناعي",
    TagIcon: Zap,
    title: "إتقان أسلوب STAR",
    description: "كيفية صياغة إنجازاتك المصرفية باستخدام أسلوب الموقف، المهمة، الإجراء، والنتيجة.",
    meta: "15 دقيقة قراءة",
    MetaIcon: BookOpen,
  },
  {
    tag: "التواصل",
    TagIcon: Zap,
    title: "الثقة والتواصل المهني",
    description: "لغة الجسد ونبرة الصوت التي تعكس السلطة المهنية في القطاع المالي.",
    meta: "8 دقائق فيديو",
    MetaIcon: BookOpen,
  },
];

const PLANS = [
  { id: "nbk-trainee",       title: "NBK Management Trainee",      unitCount: 10, icon: "🏦", description: "برنامج شامل للتحضير لبرنامج الكوادر الوطنية في بنك الكويت الوطني" },
  { id: "boubyan-cs",        title: "Boubyan Customer Service",     unitCount: 8,  icon: "🎧", description: "خدمة العملاء في بنك بوبيان – الأسئلة والمواقف الشائعة" },
  { id: "generic-banking",   title: "Generic Banking Interview",    unitCount: 12, icon: "👥", description: "دليل شامل للمقابلات المصرفية العامة في الكويت والخليج" },
  { id: "financial-analysis",title: "Financial Analysis Pro",       unitCount: 5,  icon: "📈", description: "التحليل المالي والنسب المحاسبية للمقابلات التقنية" },
];

function StepIcon({ status }: { status: Step["status"] }) {
  if (status === "done")   return <CheckCircle2 size={24} className="text-primary" fill="currentColor" strokeWidth={0} />;
  if (status === "active") return (
    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-primary" />
    </div>
  );
  return <Lock size={18} className="text-gray-300" />;
}

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
  const steps = activePlan ? (PLAN_STEPS[activePlan.id] ?? []) : [];
  const activeStep = steps.find((s) => s.status === "active");
  const doneCount = steps.filter((s) => s.status === "done").length;

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-surface border-b border-border">
        <h1 className="text-xl font-extrabold text-gray-900">خططك التحضيرية</h1>
        <p className="text-muted text-sm mt-0.5">تابع تقدمك واستعد لمقابلتك بذكاء</p>
      </div>

      {activePlan ? (
        /* ── Active plan: timeline view ── */
        <div className="px-5 py-6 space-y-6">
          {/* Plan title card */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <p className="text-xs font-semibold text-muted mb-1">الخطة النشطة</p>
            <h2 className="text-lg font-extrabold text-gray-900">{activePlan.title}</h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">{activePlan.description}</p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted">{doneCount} من {steps.length} خطوات مكتملة</span>
                <span className="text-xs font-bold text-primary">{progressMap[activePlan.id] ?? 0}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressMap[activePlan.id] ?? 0}%` }} />
              </div>
            </div>
          </div>

          {/* Steps timeline */}
          <div className="space-y-0">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;
              return (
                <div key={step.id} className="flex gap-4">
                  {/* Timeline line + icon */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 shrink-0 mt-1">
                      <StepIcon status={step.status} />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-border my-1" />}
                  </div>

                  {/* Step card */}
                  <div className={`flex-1 mb-3 rounded-2xl border p-4 ${
                    step.status === "active"
                      ? "border-primary bg-surface shadow-sm shadow-primary/10"
                      : step.status === "done"
                      ? "border-border bg-surface"
                      : "border-border bg-neutral opacity-60"
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {step.status === "active" && (
                            <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">قيد التنفيذ</span>
                          )}
                          {step.status === "done" && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5">مكتمل</span>
                          )}
                          {step.status === "locked" && (
                            <span className="text-[10px] font-bold bg-gray-100 text-muted rounded-full px-2 py-0.5">مقفل</span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-sm">
                          {idx + 1}. {step.title}
                        </h3>
                        <p className="text-xs text-muted mt-1 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                    {step.status === "active" && (
                      <button className="mt-3 w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm transition active:scale-95">
                        استئناف الخطوة
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skill focus section */}
          <div>
            <h2 className="font-extrabold text-gray-900 text-base mb-3">
              تركيز المهارات
            </h2>
            <div className="space-y-3">
              {SKILL_FOCUS.map((item) => (
                <div key={item.title} className="bg-surface rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <item.TagIcon size={12} className="text-primary" />
                    <span className="text-[11px] font-bold text-primary">{item.tag}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{item.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 text-muted">
                      <item.MetaIcon size={12} />
                      <span className="text-xs">{item.meta}</span>
                    </div>
                    <ChevronLeft size={16} className="text-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── No active plan: plans grid ── */
        <div className="px-5 py-6 space-y-4">
          <p className="text-sm text-muted">اختر خطة لبدء مسارك التحضيري</p>
          <div className="space-y-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4"
              >
                <span className="text-2xl shrink-0">{plan.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{plan.title}</p>
                  <p className="text-xs text-muted mt-0.5 leading-snug line-clamp-2">{plan.description}</p>
                  <p className="text-[11px] text-muted mt-1">{plan.unitCount} وحدات تعليمية</p>
                </div>
                <button className="shrink-0 text-xs font-bold text-primary border border-primary/40 rounded-full px-3 py-2 transition active:scale-95 hover:bg-primary hover:text-white hover:border-primary">
                  بدء
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom CTA (only when active plan with next step) */}
      {activePlan && activeStep && (
        <div className="fixed bottom-16 inset-x-0 max-w-[430px] mx-auto px-5 pb-3">
          <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition active:scale-95">
            <Zap size={16} />
            بدء الخطوة التالية: {activeStep.title}
          </button>
        </div>
      )}
    </div>
  );
}
