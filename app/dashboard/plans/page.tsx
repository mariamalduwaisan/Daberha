"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2, Lock, Zap, BookOpen,
  Building2, Headphones, Users, TrendingUp, ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

type StepStatus = "done" | "active" | "locked";
type Step = { id: string; titleAr: string; titleEn: string; descAr: string; descEn: string; status: StepStatus };

const PLAN_STEPS: Record<string, Step[]> = {
  "nbk-trainee": [
    { id: "1", titleAr: "تحليل السيرة الذاتية",   titleEn: "CV Analysis",           descAr: "تحسين سيرتك الذاتية لتتوافق مع معايير القطاع المصرفي الكويتي.",    descEn: "Improve your CV to match Kuwaiti banking sector standards.",    status: "done"   },
    { id: "2", titleAr: "الأسئلة المتوقعة",        titleEn: "Expected Questions",    descAr: "الذكاء الاصطناعي يُعدّ 15 سؤالاً مخصصاً بناءً على متطلبات بنك NBK.", descEn: "AI prepares 15 custom questions based on NBK requirements.",   status: "active" },
    { id: "3", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",        descAr: "محاكاة لمقابلة حقيقية مع ملاحظات صوتية فورية.",                     descEn: "Simulate a real interview with instant voice feedback.",        status: "locked" },
    { id: "4", titleAr: "اللمسات الأخيرة",         titleEn: "Final Touches",         descAr: "مراجعة المفاهيم الأساسية وتوجيهات ذهنية قبل يوم المقابلة.",         descEn: "Review core concepts and mental tips before interview day.",    status: "locked" },
  ],
  "boubyan-cs": [
    { id: "1", titleAr: "فهم ثقافة بوبيان",        titleEn: "Boubyan Culture",       descAr: "القيم الجوهرية للبنك ورؤيته الإسلامية.",                            descEn: "Core bank values and Islamic banking vision.",                  status: "done"   },
    { id: "2", titleAr: "أسئلة خدمة العملاء",      titleEn: "Customer Service Q&A", descAr: "أشهر المواقف وكيفية التعامل معها.",                                 descEn: "Most common scenarios and how to handle them.",                status: "active" },
    { id: "3", titleAr: "تمرين الاستجابة السريعة", titleEn: "Quick Response Drill",  descAr: "جلسة تدريبية على الإجابات الصحيحة تحت الضغط.",                      descEn: "Practice session on correct answers under pressure.",           status: "locked" },
  ],
  "generic-banking": [
    { id: "1", titleAr: "أسس القطاع المصرفي",      titleEn: "Banking Foundations",   descAr: "المصطلحات والمنتجات الأساسية في البنوك الكويتية.",                  descEn: "Key terms and products in Kuwaiti banks.",                     status: "active" },
    { id: "2", titleAr: "الأسئلة السلوكية",        titleEn: "Behavioural Questions", descAr: "إتقان أسلوب STAR في الإجابة.",                                     descEn: "Master the STAR answer method.",                               status: "locked" },
    { id: "3", titleAr: "مقابلة تجريبية شاملة",    titleEn: "Full Mock Interview",   descAr: "محاكاة كاملة لمقابلة بنك.",                                         descEn: "Complete bank interview simulation.",                          status: "locked" },
  ],
  "financial-analysis": [
    { id: "1", titleAr: "النسب المالية الأساسية",  titleEn: "Key Financial Ratios",  descAr: "السيولة، الربحية، والرافعة المالية.",                                descEn: "Liquidity, profitability, and leverage.",                      status: "active" },
    { id: "2", titleAr: "قراءة القوائم المالية",   titleEn: "Financial Statements",  descAr: "تحليل الميزانية وقائمة الدخل.",                                      descEn: "Analysing balance sheets and income statements.",              status: "locked" },
  ],
};

const SKILL_FOCUS = [
  { tag: { ar: "توصية الذكاء الاصطناعي", en: "AI Recommendation" }, titleAr: "إتقان أسلوب STAR", titleEn: "Master the STAR Method", descAr: "كيفية صياغة إنجازاتك المصرفية باستخدام الموقف، المهمة، الإجراء، والنتيجة.", descEn: "How to frame your banking achievements using Situation, Task, Action, Result.", metaAr: "15 دقيقة قراءة", metaEn: "15 min read", accent: "text-primary bg-primary/10" },
  { tag: { ar: "التواصل", en: "Communication" }, titleAr: "الثقة والتواصل المهني", titleEn: "Confidence & Professional Communication", descAr: "لغة الجسد ونبرة الصوت التي تعكس السلطة المهنية في القطاع المالي.", descEn: "Body language and tone that project authority in financial settings.", metaAr: "8 دقائق فيديو", metaEn: "8 min video", accent: "text-secondary bg-secondary/10" },
];

type PlanConfig = { id: string; titleAr: string; titleEn: string; unitCount: number; descAr: string; descEn: string; Icon: React.ElementType; iconBg: string; iconColor: string };

const PLANS: PlanConfig[] = [
  { id: "nbk-trainee",        titleAr: "NBK Management Trainee",    titleEn: "NBK Management Trainee",    unitCount: 10, descAr: "برنامج شامل للتحضير لبرنامج الكوادر الوطنية في بنك الكويت الوطني", descEn: "Comprehensive preparation for NBK's National Cadre programme", Icon: Building2,  iconBg: "bg-[#0F1E3C]",    iconColor: "text-white"        },
  { id: "boubyan-cs",         titleAr: "Boubyan Customer Service",  titleEn: "Boubyan Customer Service",  unitCount: 8,  descAr: "خدمة العملاء في بنك بوبيان – الأسئلة والمواقف الشائعة",             descEn: "Boubyan Bank CS — common questions and scenarios",              Icon: Headphones, iconBg: "bg-primary/15",    iconColor: "text-primary"      },
  { id: "generic-banking",    titleAr: "Generic Banking Interview", titleEn: "Generic Banking Interview", unitCount: 12, descAr: "دليل شامل للمقابلات المصرفية العامة في الكويت والخليج",              descEn: "General banking interview guide for Kuwait and Gulf",           Icon: Users,      iconBg: "bg-secondary/15",  iconColor: "text-secondary"    },
  { id: "financial-analysis", titleAr: "Financial Analysis Pro",    titleEn: "Financial Analysis Pro",    unitCount: 5,  descAr: "التحليل المالي والنسب المحاسبية للمقابلات التقنية",                  descEn: "Financial analysis and ratios for technical interviews",        Icon: TrendingUp, iconBg: "bg-emerald-100",   iconColor: "text-emerald-600"  },
];

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done")   return <CheckCircle2 size={22} className="text-primary" fill="currentColor" strokeWidth={0} />;
  if (status === "active") return <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-primary" /></div>;
  return <Lock size={16} className="text-gray-300" />;
}

export default function PlansPage() {
  const { lang, isRTL } = useLanguage();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("user_activity")
        .select("resource_id, metadata")
        .eq("user_id", user.id)
        .eq("activity_type", "plan_progress")
        .then(({ data }) => {
          const map: Record<string, number> = {};
          (data ?? []).forEach((a) => { if (a.resource_id) map[a.resource_id] = a.metadata?.progress ?? 0; });
          setProgressMap(map);
        });
    });
  }, []);

  const activePlan = PLANS.find((p) => (progressMap[p.id] ?? 0) > 0) ?? null;
  const steps      = activePlan ? (PLAN_STEPS[activePlan.id] ?? []) : [];
  const activeStep = steps.find((s) => s.status === "active");
  const doneCount  = steps.filter((s) => s.status === "done").length;

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-28 md:pb-10" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 pb-5 bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-extrabold text-gray-900">{tx(t.plans.title, lang)}</h1>
          <p className="text-muted text-sm mt-0.5">{tx(t.plans.subtitle, lang)}</p>
        </div>
      </div>

      <div className="px-5 md:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {activePlan ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Steps column */}
              <div className="lg:col-span-2 space-y-5">
                {/* Active plan card */}
                <div className={`${activePlan.iconBg} rounded-2xl p-5 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.2) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1">{tx(t.plans.activePlan, lang)}</span>
                  <h2 className="text-base font-extrabold text-white mt-2">{isRTL ? activePlan.titleAr : activePlan.titleEn}</h2>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">{isRTL ? activePlan.descAr : activePlan.descEn}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/60">{doneCount} {tx(t.plans.from, lang)} {steps.length} {tx(t.plans.steps, lang)}</span>
                      <span className="text-xs font-bold text-white">{progressMap[activePlan.id] ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressMap[activePlan.id] ?? 0}%` }} />
                    </div>
                  </div>
                </div>

                {/* Steps timeline */}
                <div>
                  <h2 className="font-extrabold text-gray-900 mb-3">{tx(t.plans.steps, lang)}</h2>
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
                            step.status === "active" ? "bg-surface border border-primary shadow-sm shadow-primary/10"
                            : step.status === "done" ? "bg-surface border border-border"
                            :                          "bg-gray-50 opacity-60"
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              {step.status === "active" && <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">{tx(t.plans.status.active, lang)}</span>}
                              {step.status === "done"   && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5">{tx(t.plans.status.done, lang)}</span>}
                              {step.status === "locked" && <span className="text-[10px] font-bold bg-gray-100 text-muted rounded-full px-2 py-0.5">{tx(t.plans.status.locked, lang)}</span>}
                            </div>
                            <h3 className="font-extrabold text-gray-900 text-sm">{idx + 1}. {isRTL ? step.titleAr : step.titleEn}</h3>
                            <p className="text-xs text-muted mt-1 leading-relaxed">{isRTL ? step.descAr : step.descEn}</p>
                            {step.status === "active" && (
                              <button className="mt-3 w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm transition active:scale-95">
                                {tx(t.plans.resume, lang)}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Skill focus column */}
              <div className="space-y-4">
                <h2 className="font-extrabold text-gray-900">{tx(t.plans.skills, lang)}</h2>
                {SKILL_FOCUS.map((item) => (
                  <div key={item.titleEn} className="bg-surface rounded-2xl p-4">
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${item.accent}`}>
                      {isRTL ? item.tag.ar : item.tag.en}
                    </span>
                    <h3 className="font-extrabold text-gray-900 text-sm mt-2">{isRTL ? item.titleAr : item.titleEn}</h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
                    <div className="flex items-center mt-3 text-muted gap-1.5">
                      <BookOpen size={12} />
                      <span className="text-xs">{isRTL ? item.metaAr : item.metaEn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted font-medium mb-4">{tx(t.plans.chooseplan, lang)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLANS.map((plan) => (
                  <div key={plan.id} className="bg-surface rounded-2xl px-4 py-4 flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center shrink-0`}>
                      <plan.Icon size={18} className={plan.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm leading-snug">{isRTL ? plan.titleAr : plan.titleEn}</p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{isRTL ? plan.descAr : plan.descEn}</p>
                      <p className="text-[11px] text-muted mt-0.5">{plan.unitCount} {tx(t.plans.units, lang)}</p>
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
            <Zap size={16} />{tx(t.plans.nextStep, lang)} {isRTL ? activeStep.titleAr : activeStep.titleEn}
          </button>
        </div>
      )}
    </div>
  );
}
