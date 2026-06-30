import { createClient } from "@/lib/supabase/server";
import {
  CheckCircle2, Lock, ChevronLeft, Zap, BookOpen,
  Building2, Headphones, Users, TrendingUp, ArrowLeft,
} from "lucide-react";

type Step = { id: string; title: string; description: string; status: "done" | "active" | "locked" };

const PLAN_STEPS: Record<string, Step[]> = {
  "nbk-trainee": [
    { id: "1", title: "تحليل السيرة الذاتية",   description: "تحسين سيرتك الذاتية لتتوافق مع معايير القطاع المصرفي الكويتي.",    status: "done"   },
    { id: "2", title: "الأسئلة المتوقعة",        description: "الذكاء الاصطناعي يُعدّ 15 سؤالاً مخصصاً بناءً على متطلبات بنك NBK.", status: "active" },
    { id: "3", title: "مقابلة تجريبية",          description: "محاكاة لمقابلة حقيقية مع ملاحظات صوتية فورية.",                     status: "locked" },
    { id: "4", title: "اللمسات الأخيرة",         description: "مراجعة المفاهيم الأساسية وتوجيهات ذهنية قبل يوم المقابلة.",         status: "locked" },
  ],
  "boubyan-cs": [
    { id: "1", title: "فهم ثقافة بوبيان",        description: "القيم الجوهرية للبنك ورؤيته الإسلامية.",                            status: "done"   },
    { id: "2", title: "أسئلة خدمة العملاء",      description: "أشهر المواقف وكيفية التعامل معها.",                                 status: "active" },
    { id: "3", title: "تمرين الاستجابة السريعة", description: "جلسة تدريبية على الإجابات الصحيحة تحت الضغط.",                      status: "locked" },
  ],
  "generic-banking": [
    { id: "1", title: "أسس القطاع المصرفي",      description: "المصطلحات والمنتجات الأساسية في البنوك الكويتية.",                  status: "active" },
    { id: "2", title: "الأسئلة السلوكية",        description: "إتقان أسلوب STAR في الإجابة.",                                     status: "locked" },
    { id: "3", title: "مقابلة تجريبية شاملة",    description: "محاكاة كاملة لمقابلة بنك.",                                         status: "locked" },
  ],
  "financial-analysis": [
    { id: "1", title: "النسب المالية الأساسية",  description: "السيولة، الربحية، والرافعة المالية.",                                status: "active" },
    { id: "2", title: "قراءة القوائم المالية",   description: "تحليل الميزانية وقائمة الدخل.",                                      status: "locked" },
  ],
};

const SKILL_FOCUS = [
  {
    tag: "توصية الذكاء الاصطناعي",
    title: "إتقان أسلوب STAR",
    description: "كيفية صياغة إنجازاتك المصرفية باستخدام الموقف، المهمة، الإجراء، والنتيجة.",
    meta: "15 دقيقة قراءة",
    accent: "text-primary bg-primary/10",
  },
  {
    tag: "التواصل",
    title: "الثقة والتواصل المهني",
    description: "لغة الجسد ونبرة الصوت التي تعكس السلطة المهنية في القطاع المالي.",
    meta: "8 دقائق فيديو",
    accent: "text-secondary bg-secondary/10",
  },
];

type PlanConfig = { id: string; title: string; unitCount: number; description: string; Icon: React.ElementType; iconBg: string; iconColor: string };

const PLANS: PlanConfig[] = [
  { id: "nbk-trainee",        title: "NBK Management Trainee",    unitCount: 10, description: "برنامج شامل للتحضير لبرنامج الكوادر الوطنية في بنك الكويت الوطني", Icon: Building2, iconBg: "bg-[#0F1E3C]",    iconColor: "text-white"        },
  { id: "boubyan-cs",         title: "Boubyan Customer Service",  unitCount: 8,  description: "خدمة العملاء في بنك بوبيان – الأسئلة والمواقف الشائعة",             Icon: Headphones, iconBg: "bg-primary/15",  iconColor: "text-primary"      },
  { id: "generic-banking",    title: "Generic Banking Interview", unitCount: 12, description: "دليل شامل للمقابلات المصرفية العامة في الكويت والخليج",              Icon: Users,      iconBg: "bg-secondary/15",iconColor: "text-secondary"    },
  { id: "financial-analysis", title: "Financial Analysis Pro",    unitCount: 5,  description: "التحليل المالي والنسب المحاسبية للمقابلات التقنية",                  Icon: TrendingUp, iconBg: "bg-emerald-100", iconColor: "text-emerald-600"  },
];

function StepIcon({ status }: { status: Step["status"] }) {
  if (status === "done")   return <CheckCircle2 size={22} className="text-primary" fill="currentColor" strokeWidth={0} />;
  if (status === "active") return <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-primary" /></div>;
  return <Lock size={16} className="text-gray-300" />;
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
  const steps      = activePlan ? (PLAN_STEPS[activePlan.id] ?? []) : [];
  const activeStep = steps.find((s) => s.status === "active");
  const doneCount  = steps.filter((s) => s.status === "done").length;

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-28 md:pb-10">
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 pb-5 bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-extrabold text-gray-900">خططك التحضيرية</h1>
          <p className="text-muted text-sm mt-0.5">تابع تقدمك واستعد لمقابلتك بذكاء</p>
        </div>
      </div>

      <div className="px-5 md:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {activePlan ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left col: steps */}
              <div className="lg:col-span-2 space-y-5">
                {/* Active plan card */}
                <div className={`${activePlan.iconBg} rounded-2xl p-5 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
                  <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1">الخطة النشطة</span>
                  <h2 className="text-base font-extrabold text-white mt-2">{activePlan.title}</h2>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">{activePlan.description}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/60">{doneCount} من {steps.length} خطوات</span>
                      <span className="text-xs font-bold text-white">{progressMap[activePlan.id] ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressMap[activePlan.id] ?? 0}%` }} />
                    </div>
                  </div>
                </div>

                {/* Steps timeline */}
                <div>
                  <h2 className="font-extrabold text-gray-900 mb-3">الخطوات</h2>
                  <div className="space-y-0">
                    {steps.map((step, idx) => {
                      const isLast = idx === steps.length - 1;
                      return (
                        <div key={step.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-8 h-8 shrink-0 mt-1">
                              <StepIcon status={step.status} />
                            </div>
                            {!isLast && <div className="w-px flex-1 bg-border my-1" />}
                          </div>
                          <div className={`flex-1 mb-2 rounded-2xl p-4 ${
                            step.status === "active"  ? "bg-surface border border-primary shadow-sm shadow-primary/10"
                            : step.status === "done"  ? "bg-surface border border-border"
                            :                           "bg-gray-50 opacity-60"
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              {step.status === "active"  && <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">قيد التنفيذ</span>}
                              {step.status === "done"    && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5">مكتمل</span>}
                              {step.status === "locked"  && <span className="text-[10px] font-bold bg-gray-100 text-muted rounded-full px-2 py-0.5">مقفل</span>}
                            </div>
                            <h3 className="font-extrabold text-gray-900 text-sm">{idx + 1}. {step.title}</h3>
                            <p className="text-xs text-muted mt-1 leading-relaxed">{step.description}</p>
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
                </div>
              </div>

              {/* Right col: skill focus */}
              <div className="space-y-4">
                <h2 className="font-extrabold text-gray-900">تركيز المهارات</h2>
                {SKILL_FOCUS.map((item) => (
                  <div key={item.title} className="bg-surface rounded-2xl p-4">
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${item.accent}`}>{item.tag}</span>
                    <h3 className="font-extrabold text-gray-900 text-sm mt-2">{item.title}</h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-muted">
                        <BookOpen size={12} /><span className="text-xs">{item.meta}</span>
                      </div>
                      <ChevronLeft size={16} className="text-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Plans grid — 2-col on desktop */
            <div>
              <p className="text-sm text-muted font-medium mb-4">اختر خطة لبدء مسارك التحضيري</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLANS.map((plan) => (
                  <div key={plan.id} className="bg-surface rounded-2xl px-4 py-4 flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center shrink-0`}>
                      <plan.Icon size={18} className={plan.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm leading-snug">{plan.title}</p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{plan.description}</p>
                      <p className="text-[11px] text-muted mt-0.5">{plan.unitCount} وحدات</p>
                    </div>
                    <button className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center transition active:scale-95 hover:bg-primary hover:text-white">
                      <ArrowLeft size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      {activePlan && activeStep && (
        <div className="fixed bottom-16 md:bottom-6 inset-x-0 md:right-64 max-w-5xl md:mx-8 px-5 md:px-0 pb-3 md:pb-0 z-40">
          <button className="w-full py-4 rounded-2xl bg-primary text-white font-extrabold text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition active:scale-95">
            <Zap size={16} />بدء الخطوة التالية: {activeStep.title}
          </button>
        </div>
      )}
    </div>
  );
}
