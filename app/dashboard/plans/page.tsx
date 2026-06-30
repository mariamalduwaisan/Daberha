"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2, Lock, Zap, BookOpen,
  Building2, Headphones, Users, TrendingUp, ChevronRight, ChevronLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

type StepStatus = "done" | "active" | "locked";
type Step = { id: string; titleAr: string; titleEn: string; descAr: string; descEn: string; status: StepStatus };

const PLAN_STEPS: Record<string, Step[]> = {
  "nbk-trainee": [
    { id: "1", titleAr: "تحليل السيرة الذاتية",   titleEn: "CV Analysis",           descAr: "تحسين سيرتك الذاتية.",             descEn: "Improve your CV for banking.",      status: "done"   },
    { id: "2", titleAr: "الأسئلة المتوقعة",        titleEn: "Expected Questions",    descAr: "15 سؤالاً مخصصاً لـ NBK.",         descEn: "15 custom NBK questions.",          status: "active" },
    { id: "3", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",        descAr: "محاكاة لمقابلة حقيقية.",           descEn: "Real interview simulation.",        status: "locked" },
    { id: "4", titleAr: "اللمسات الأخيرة",         titleEn: "Final Touches",         descAr: "مراجعة قبل يوم المقابلة.",         descEn: "Review before interview day.",      status: "locked" },
  ],
  "boubyan-cs": [
    { id: "1", titleAr: "فهم ثقافة بوبيان",        titleEn: "Boubyan Culture",       descAr: "القيم الجوهرية للبنك.",            descEn: "Core bank values.",                 status: "done"   },
    { id: "2", titleAr: "أسئلة خدمة العملاء",      titleEn: "Customer Service Q&A", descAr: "المواقف الشائعة وكيفية التعامل.",  descEn: "Common scenarios.",                 status: "active" },
    { id: "3", titleAr: "تمرين الاستجابة السريعة", titleEn: "Quick Response Drill",  descAr: "الإجابة الصحيحة تحت الضغط.",       descEn: "Answering under pressure.",         status: "locked" },
  ],
  "generic-banking": [
    { id: "1", titleAr: "أسس القطاع المصرفي",      titleEn: "Banking Foundations",   descAr: "المصطلحات والمنتجات الأساسية.",    descEn: "Key terms and products.",           status: "active" },
    { id: "2", titleAr: "الأسئلة السلوكية",        titleEn: "Behavioural Questions", descAr: "إتقان أسلوب STAR.",                descEn: "Master the STAR method.",           status: "locked" },
    { id: "3", titleAr: "مقابلة تجريبية شاملة",    titleEn: "Full Mock Interview",   descAr: "محاكاة كاملة لمقابلة بنك.",        descEn: "Complete bank interview sim.",      status: "locked" },
  ],
  "financial-analysis": [
    { id: "1", titleAr: "النسب المالية الأساسية",  titleEn: "Key Financial Ratios",  descAr: "السيولة والربحية والرافعة المالية.", descEn: "Liquidity, profitability, leverage.", status: "active" },
    { id: "2", titleAr: "قراءة القوائم المالية",   titleEn: "Financial Statements",  descAr: "تحليل الميزانية وقائمة الدخل.",     descEn: "Balance sheets & income stmts.",    status: "locked" },
  ],
};

const SKILL_FOCUS = [
  { tagAr: "توصية الذكاء الاصطناعي", tagEn: "AI Recommendation", titleAr: "إتقان أسلوب STAR", titleEn: "Master the STAR Method", descAr: "كيفية صياغة إنجازاتك باستخدام الموقف، المهمة، الإجراء، النتيجة.", descEn: "Frame achievements using Situation, Task, Action, Result.", metaAr: "15 دقيقة قراءة", metaEn: "15 min read", accent: "text-primary bg-primary/10" },
  { tagAr: "التواصل", tagEn: "Communication", titleAr: "الثقة والتواصل المهني", titleEn: "Professional Communication", descAr: "لغة الجسد ونبرة الصوت في القطاع المالي.", descEn: "Body language and tone in financial settings.", metaAr: "8 دقائق فيديو", metaEn: "8 min video", accent: "text-secondary bg-secondary/10" },
];

type PlanConfig = { id: string; titleAr: string; titleEn: string; unitCount: number; descAr: string; descEn: string; Icon: React.ElementType; iconBg: string; iconColor: string };

const PLANS: PlanConfig[] = [
  { id: "nbk-trainee",        titleAr: "NBK Management Trainee",    titleEn: "NBK Management Trainee",    unitCount: 10, descAr: "برنامج الكوادر الوطنية في بنك الكويت الوطني", descEn: "NBK National Cadre programme", Icon: Building2,  iconBg: "bg-[#0F1E3C]",    iconColor: "text-white"       },
  { id: "boubyan-cs",         titleAr: "Boubyan Customer Service",  titleEn: "Boubyan Customer Service",  unitCount: 8,  descAr: "خدمة العملاء في بنك بوبيان",                  descEn: "Boubyan Bank CS track",        Icon: Headphones, iconBg: "bg-primary/15",    iconColor: "text-primary"     },
  { id: "generic-banking",    titleAr: "Generic Banking Interview", titleEn: "Generic Banking Interview", unitCount: 12, descAr: "دليل المقابلات المصرفية العامة",               descEn: "General banking interview",    Icon: Users,      iconBg: "bg-secondary/15",  iconColor: "text-secondary"   },
  { id: "financial-analysis", titleAr: "Financial Analysis Pro",    titleEn: "Financial Analysis Pro",    unitCount: 5,  descAr: "التحليل المالي للمقابلات التقنية",             descEn: "Financial analysis track",     Icon: TrendingUp, iconBg: "bg-emerald-100",   iconColor: "text-emerald-600" },
];

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done")   return <CheckCircle2 size={20} className="text-primary" fill="currentColor" strokeWidth={0} />;
  if (status === "active") return <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></div>;
  return <Lock size={14} className="text-gray-300" />;
}

export default function PlansPage() {
  const { lang, isRTL } = useLanguage();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      createClient().from("user_activity")
        .select("resource_id,metadata")
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
  const Chevron    = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="p-6 md:p-8 space-y-6" dir={isRTL ? "rtl" : "ltr"}>

      {activePlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Steps — 2/3 */}
          <div className="lg:col-span-2 space-y-4">

            {/* Active plan card */}
            <div className={`${activePlan.iconBg} rounded-2xl p-6 relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.2) 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1">{tx(t.plans.activePlan, lang)}</span>
                  <h2 className="text-lg font-extrabold text-white mt-2">{isRTL ? activePlan.titleAr : activePlan.titleEn}</h2>
                  <p className="text-xs text-white/60 mt-1">{isRTL ? activePlan.descAr : activePlan.descEn}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-2xl font-extrabold text-white">{progressMap[activePlan.id] ?? 0}%</span>
                  <p className="text-xs text-white/50 mt-0.5">{doneCount} {tx(t.plans.from, lang)} {steps.length}</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressMap[activePlan.id] ?? 0}%` }} />
              </div>
            </div>

            {/* Steps */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-extrabold text-gray-900 text-sm">{tx(t.plans.steps, lang)}</h2>
              </div>
              <div className="divide-y divide-border">
                {steps.map((step, idx) => (
                  <div key={step.id} className={`flex items-start gap-4 px-6 py-4 ${step.status === "locked" ? "opacity-50" : ""}`}>
                    <div className="mt-0.5 shrink-0"><StepIcon status={step.status} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">{idx + 1}. {isRTL ? step.titleAr : step.titleEn}</p>
                        {step.status === "active" && <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">{tx(t.plans.status.active, lang)}</span>}
                        {step.status === "done"   && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5">{tx(t.plans.status.done, lang)}</span>}
                      </div>
                      <p className="text-xs text-muted">{isRTL ? step.descAr : step.descEn}</p>
                      {step.status === "active" && (
                        <button className="mt-3 bg-primary text-white text-xs font-bold rounded-xl px-4 py-2 transition active:scale-95 hover:bg-primary-dark">
                          {tx(t.plans.resume, lang)}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skill focus — 1/3 */}
          <div className="space-y-4">
            <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">{tx(t.plans.skills, lang)}</h2>
            {SKILL_FOCUS.map((item) => (
              <div key={item.titleEn} className="bg-surface rounded-2xl border border-border p-5 space-y-3">
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${item.accent}`}>{isRTL ? item.tagAr : item.tagEn}</span>
                <h3 className="font-extrabold text-gray-900 text-sm">{isRTL ? item.titleAr : item.titleEn}</h3>
                <p className="text-xs text-muted leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
                <div className="flex items-center justify-between text-muted">
                  <div className="flex items-center gap-1.5"><BookOpen size={11} /><span className="text-xs">{isRTL ? item.metaAr : item.metaEn}</span></div>
                  <Chevron size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Plans grid */
        <div>
          <p className="text-sm text-muted mb-4">{tx(t.plans.chooseplan, lang)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLANS.map((plan) => (
              <button key={plan.id} className="bg-surface rounded-2xl border border-border px-5 py-4 flex items-center gap-4 text-start hover:border-primary transition group w-full">
                <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center shrink-0`}>
                  <plan.Icon size={18} className={plan.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{isRTL ? plan.titleAr : plan.titleEn}</p>
                  <p className="text-xs text-muted mt-0.5 truncate">{isRTL ? plan.descAr : plan.descEn}</p>
                  <p className="text-[11px] text-muted mt-0.5">{plan.unitCount} {tx(t.plans.units, lang)}</p>
                </div>
                <Chevron size={16} className="text-muted group-hover:text-primary transition shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticky CTA */}
      {activePlan && activeStep && (
        <div className="fixed bottom-4 inset-x-0 md:right-64 px-6 md:px-8 z-40 pointer-events-none">
          <button className="w-full max-w-5xl mx-auto pointer-events-auto py-3.5 rounded-2xl bg-primary text-white font-extrabold text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition hover:bg-primary-dark active:scale-[0.98]">
            <Zap size={15} />{tx(t.plans.nextStep, lang)} {isRTL ? activeStep.titleAr : activeStep.titleEn}
          </button>
        </div>
      )}
    </div>
  );
}
