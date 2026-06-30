"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2, Lock, Zap, BookOpen,
  Building2, Headphones, Users, TrendingUp,
  ChevronRight, ChevronLeft, Phone, Layers,
  Truck, Shield, FileText, ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

type StepStatus = "done" | "active" | "locked";
type Step = {
  id: string; titleAr: string; titleEn: string;
  descAr: string; descEn: string; status: StepStatus;
  resourceUrl?: string; resourceLabelAr?: string; resourceLabelEn?: string;
};

const PLAN_STEPS: Record<string, Step[]> = {
  "nbk-trainee": [
    { id: "1", titleAr: "تحليل السيرة الذاتية",   titleEn: "CV Analysis",           descAr: "تحسين سيرتك الذاتية لبرنامج NBK.",       descEn: "Tailor your CV for NBK Trainee programme.",   status: "done",   resourceUrl: "https://careers.nbk.com/", resourceLabelAr: "بوابة NBK", resourceLabelEn: "NBK Portal" },
    { id: "2", titleAr: "الأسئلة المتوقعة",        titleEn: "Expected Questions",    descAr: "15 سؤالاً مخصصاً لـ NBK.",               descEn: "15 custom NBK questions.",                    status: "active", resourceUrl: "https://www.naukri.com/campus/career-guidance/bank-interview-questions-and-answers", resourceLabelAr: "دليل الأسئلة", resourceLabelEn: "Q&A Guide" },
    { id: "3", titleAr: "القطاع المصرفي الكويتي",  titleEn: "Kuwait Banking Sector", descAr: "اقرأ تقرير KDIPA قبل المقابلة.",           descEn: "Read KDIPA report before the interview.",     status: "locked", resourceUrl: "https://kdipa.gov.kw/wp-content/uploads/2023/01/Financial-Services-Banking-Sector.pdf", resourceLabelAr: "تقرير KDIPA PDF", resourceLabelEn: "KDIPA Report PDF" },
    { id: "4", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",        descAr: "محاكاة لمقابلة حقيقية مع المساعد الذكي.", descEn: "Real interview simulation with AI.",          status: "locked" },
    { id: "5", titleAr: "اللمسات الأخيرة",         titleEn: "Final Touches",         descAr: "مراجعة لغة الجسد والثقة قبل يوم المقابلة.", descEn: "Body language & confidence review.",         status: "locked", resourceUrl: "https://www.indeed.com/career-advice/interviewing/body-language-tips-for-your-next-interview", resourceLabelAr: "دليل لغة الجسد", resourceLabelEn: "Body Language Guide" },
  ],
  "boubyan-cs": [
    { id: "1", titleAr: "فهم ثقافة بوبيان",        titleEn: "Boubyan Culture",        descAr: "القيم الجوهرية للبنك الإسلامي.",             descEn: "Core Islamic bank values.",                   status: "done",   resourceUrl: "https://www.boubyan.com.kw/en/about-us", resourceLabelAr: "موقع بوبيان", resourceLabelEn: "Boubyan Site" },
    { id: "2", titleAr: "مبادئ التمويل الإسلامي",  titleEn: "Islamic Finance Basics", descAr: "تقرير البنك الدولي عن التمويل الإسلامي.",   descEn: "World Bank Islamic Finance paper.",            status: "active", resourceUrl: "https://documents1.worldbank.org/curated/en/167041481601059316/pdf/110902-WP-Islamic-Banking-KR-Eng-PUBLIC.pdf", resourceLabelAr: "PDF البنك الدولي", resourceLabelEn: "World Bank PDF" },
    { id: "3", titleAr: "أسئلة خدمة العملاء",      titleEn: "Customer Service Q&A",  descAr: "المواقف الشائعة وكيفية التعامل.",            descEn: "Common scenarios and responses.",              status: "locked" },
    { id: "4", titleAr: "تمرين الاستجابة السريعة", titleEn: "Quick Response Drill",   descAr: "الإجابة الصحيحة تحت الضغط.",                descEn: "Answering correctly under pressure.",          status: "locked" },
  ],
  "generic-banking": [
    { id: "1", titleAr: "أسس القطاع المصرفي",      titleEn: "Banking Foundations",    descAr: "تعرّف على القطاع المصرفي الكويتي — KDIPA.", descEn: "Kuwait banking sector overview — KDIPA.",     status: "active", resourceUrl: "https://kdipa.gov.kw/wp-content/uploads/2023/01/Financial-Services-Banking-Sector.pdf", resourceLabelAr: "تقرير KDIPA PDF", resourceLabelEn: "KDIPA PDF" },
    { id: "2", titleAr: "المصطلحات المالية",        titleEn: "Financial Terminology",  descAr: "قاموس المصطلحات المصرفية والمالية.",          descEn: "Banking and financial terms dictionary.",      status: "locked", resourceUrl: "https://www.investopedia.com/financial-term-dictionary-4769738", resourceLabelAr: "Investopedia", resourceLabelEn: "Investopedia" },
    { id: "3", titleAr: "الأسئلة السلوكية",        titleEn: "Behavioural Questions",  descAr: "إتقان أسلوب STAR.",                          descEn: "Master the STAR method.",                     status: "locked", resourceUrl: "https://www.youtube.com/watch?v=KIiP_KDNTMk", resourceLabelAr: "فيديو STAR", resourceLabelEn: "STAR Video" },
    { id: "4", titleAr: "مقابلة تجريبية شاملة",    titleEn: "Full Mock Interview",    descAr: "محاكاة كاملة لمقابلة بنك.",                 descEn: "Complete bank interview simulation.",          status: "locked" },
  ],
  "financial-analysis": [
    { id: "1", titleAr: "النسب المالية الأساسية",  titleEn: "Key Financial Ratios",   descAr: "السيولة والربحية والرافعة المالية.",           descEn: "Liquidity, profitability, leverage.",          status: "active", resourceUrl: "https://www.investopedia.com/financial-term-dictionary-4769738", resourceLabelAr: "مرجع Investopedia", resourceLabelEn: "Investopedia Ref" },
    { id: "2", titleAr: "قراءة القوائم المالية",   titleEn: "Financial Statements",   descAr: "تحليل الميزانية وقائمة الدخل.",              descEn: "Balance sheets & income statements.",          status: "locked" },
    { id: "3", titleAr: "أسئلة تقنية تجريبية",     titleEn: "Technical Q&A Drill",    descAr: "أسئلة التحليل المالي في المقابلات.",          descEn: "Financial analysis questions in interviews.",  status: "locked" },
  ],
  "kfh-islamic": [
    { id: "1", titleAr: "مبادئ التمويل الإسلامي",  titleEn: "Islamic Finance Basics", descAr: "ورقة صندوق النقد الدولي عن التمويل الإسلامي.", descEn: "IMF paper on Islamic financial systems.",     status: "active", resourceUrl: "https://www.imf.org/external/pubs/ft/fandd/1997/06/pdf/iqbal.pdf", resourceLabelAr: "PDF صندوق النقد الدولي", resourceLabelEn: "IMF PDF" },
    { id: "2", titleAr: "منتجات KFH الإسلامية",    titleEn: "KFH Islamic Products",   descAr: "المرابحة والإجارة والمضاربة والصكوك.",        descEn: "Murabaha, Ijara, Mudaraba, Sukuk.",           status: "locked" },
    { id: "3", titleAr: "الامتثال الشرعي",         titleEn: "Sharia Compliance",      descAr: "كيف تعمل لجنة الرقابة الشرعية.",             descEn: "How the Sharia supervisory board works.",     status: "locked" },
    { id: "4", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",         descAr: "محاكاة مقابلة KFH.",                         descEn: "KFH interview simulation.",                   status: "locked" },
  ],
  "gulf-bank": [
    { id: "1", titleAr: "نبذة عن بنك الخليج",      titleEn: "About Gulf Bank",        descAr: "تاريخ البنك وقيمه وتوجهاته الاستراتيجية.",  descEn: "Bank history, values and strategic direction.", status: "active" },
    { id: "2", titleAr: "القطاع المصرفي الكويتي",  titleEn: "Kuwait Banking Sector",  descAr: "تقرير KDIPA الرسمي للقطاع.",                 descEn: "Official KDIPA sector report.",               status: "locked", resourceUrl: "https://kdipa.gov.kw/wp-content/uploads/2022/06/Financial-Services-and-Banking-Sector.pdf", resourceLabelAr: "تقرير KDIPA 2022", resourceLabelEn: "KDIPA 2022 PDF" },
    { id: "3", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",         descAr: "محاكاة مقابلة بنك الخليج.",                 descEn: "Gulf Bank interview simulation.",              status: "locked" },
  ],
  // ── Private companies ────────────────────────────────────────────────────────
  "zain-kuwait": [
    { id: "1", titleAr: "ثقافة زين وقيمها",        titleEn: "Zain Culture & Values",  descAr: "اقرأ تقرير الاستدامة لفهم بيئة العمل والقيم.", descEn: "Read sustainability report to understand culture.", status: "active", resourceUrl: "https://www.zain.com/en/investors/annual-reports/", resourceLabelAr: "التقرير السنوي", resourceLabelEn: "Annual Report" },
    { id: "2", titleAr: "أسئلة قطاع الاتصالات",    titleEn: "Telecom Sector Q&A",     descAr: "أسئلة سلوكية وتقنية خاصة بالاتصالات.",      descEn: "Behavioral and technical telecom questions.",  status: "locked", resourceUrl: "https://www.naukri.com/campus/career-guidance/bank-interview-questions-and-answers", resourceLabelAr: "دليل الأسئلة", resourceLabelEn: "Q&A Guide" },
    { id: "3", titleAr: "أسلوب STAR للاتصالات",    titleEn: "STAR Method — Telecom",  descAr: "تطبيق أسلوب STAR في بيئة الاتصالات.",       descEn: "Applying STAR method in a telecom context.",   status: "locked", resourceUrl: "https://www.youtube.com/watch?v=KIiP_KDNTMk", resourceLabelAr: "فيديو يوتيوب", resourceLabelEn: "YouTube Video" },
    { id: "4", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",         descAr: "محاكاة مقابلة زين.",                         descEn: "Zain interview simulation.",                   status: "locked" },
  ],
  "alghanim": [
    { id: "1", titleAr: "عن مجموعة الغانم",        titleEn: "About Alghanim Group",   descAr: "تعرّف على أكبر مجموعة خاصة في الكويت.",     descEn: "Learn about Kuwait's largest private group.",  status: "active", resourceUrl: "https://www.alghanim.com/en/careers", resourceLabelAr: "بوابة الوظائف", resourceLabelEn: "Careers Portal" },
    { id: "2", titleAr: "الأسئلة السلوكية",        titleEn: "Behavioural Questions",  descAr: "أسئلة القيادة والإدارة المتوقعة.",            descEn: "Expected leadership and management questions.", status: "locked", resourceUrl: "https://www.indeed.com/career-advice/interviewing/body-language-tips-for-your-next-interview", resourceLabelAr: "نصائح المقابلة", resourceLabelEn: "Interview Tips" },
    { id: "3", titleAr: "أسلوب STAR للشركات",      titleEn: "STAR Method — Corporate",descAr: "STAR في بيئة الأعمال الكبرى.",                descEn: "STAR in large corporate environments.",        status: "locked", resourceUrl: "https://www.youtube.com/watch?v=KIiP_KDNTMk", resourceLabelAr: "فيديو STAR", resourceLabelEn: "STAR Video" },
    { id: "4", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",         descAr: "محاكاة مقابلة الغانم.",                      descEn: "Alghanim interview simulation.",               status: "locked" },
  ],
  "agility": [
    { id: "1", titleAr: "عن أجيليتي وثقافتها",     titleEn: "About Agility",          descAr: "تعرّف على ثقافة وقيم أجيليتي للخدمات اللوجستية.", descEn: "Learn Agility's culture and values.",         status: "active", resourceUrl: "https://www.agility.com/en/sustainability/", resourceLabelAr: "تقرير الاستدامة", resourceLabelEn: "Sustainability Report" },
    { id: "2", titleAr: "أسئلة سلاسل التوريد",     titleEn: "Supply Chain Q&A",       descAr: "الأسئلة الشائعة في مجال اللوجستيات.",         descEn: "Common logistics and supply chain questions.",  status: "locked" },
    { id: "3", titleAr: "STAR في العمليات",         titleEn: "STAR — Operations",      descAr: "STAR في بيئة العمليات واللوجستيات.",          descEn: "STAR in operations and logistics context.",    status: "locked", resourceUrl: "https://www.youtube.com/watch?v=KIiP_KDNTMk", resourceLabelAr: "فيديو STAR", resourceLabelEn: "STAR Video" },
    { id: "4", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",         descAr: "محاكاة مقابلة أجيليتي.",                    descEn: "Agility interview simulation.",                status: "locked" },
  ],
  "gulf-insurance": [
    { id: "1", titleAr: "عن مجموعة الخليج للتأمين",titleEn: "About GIG",              descAr: "تعرّف على أكبر شركة تأمين في الكويت.",       descEn: "Learn about Kuwait's largest insurer.",        status: "active", resourceUrl: "https://www.gig.com.kw/en/about-us/careers", resourceLabelAr: "وظائف GIG", resourceLabelEn: "GIG Careers" },
    { id: "2", titleAr: "مصطلحات التأمين",          titleEn: "Insurance Terminology",  descAr: "المصطلحات الأساسية في قطاع التأمين.",         descEn: "Core insurance sector terminology.",           status: "locked", resourceUrl: "https://www.investopedia.com/financial-term-dictionary-4769738", resourceLabelAr: "مرجع Investopedia", resourceLabelEn: "Investopedia" },
    { id: "3", titleAr: "الأسئلة السلوكية",        titleEn: "Behavioural Questions",  descAr: "أسئلة التعامل مع المخاطر وخدمة العملاء.",    descEn: "Risk management and customer service questions.", status: "locked" },
    { id: "4", titleAr: "مقابلة تجريبية",          titleEn: "Mock Interview",         descAr: "محاكاة مقابلة GIG.",                         descEn: "GIG interview simulation.",                   status: "locked" },
  ],
};

const SKILL_FOCUS = [
  { tagAr: "توصية الذكاء الاصطناعي", tagEn: "AI Recommendation", titleAr: "إتقان أسلوب STAR", titleEn: "Master the STAR Method", descAr: "صياغة إنجازاتك باستخدام الموقف، المهمة، الإجراء، النتيجة.", descEn: "Frame achievements using Situation, Task, Action, Result.", metaAr: "15 دقيقة قراءة", metaEn: "15 min read", accent: "text-primary bg-primary/10", url: "https://www.youtube.com/watch?v=KIiP_KDNTMk" },
  { tagAr: "مرجع PDF", tagEn: "PDF Reference", titleAr: "القطاع المصرفي الكويتي", titleEn: "Kuwait Banking Sector", descAr: "تقرير KDIPA الرسمي — مرجع أساسي لكل مقابلة مصرفية.", descEn: "Official KDIPA report — essential reference for any banking interview.", metaAr: "تقرير KDIPA", metaEn: "KDIPA PDF", accent: "text-secondary bg-secondary/10", url: "https://kdipa.gov.kw/wp-content/uploads/2023/01/Financial-Services-Banking-Sector.pdf" },
  { tagAr: "مرجع PDF", tagEn: "PDF Reference", titleAr: "التمويل الإسلامي — صندوق النقد", titleEn: "Islamic Finance — IMF", descAr: "ورقة صندوق النقد الدولي لفهم أسس التمويل الإسلامي.", descEn: "IMF paper to understand Islamic finance fundamentals.", metaAr: "PDF • 5 صفحات", metaEn: "PDF • 5 pages", accent: "text-emerald-600 bg-emerald-50", url: "https://www.imf.org/external/pubs/ft/fandd/1997/06/pdf/iqbal.pdf" },
];

type PlanGroup = "banking" | "private";
type PlanConfig = {
  id: string; titleAr: string; titleEn: string; unitCount: number;
  descAr: string; descEn: string; Icon: React.ElementType;
  iconBg: string; iconColor: string; group: PlanGroup;
};

const PLANS: PlanConfig[] = [
  // ── Banking plans ────────────────────────────────────────────────────────────
  { id: "nbk-trainee",        titleAr: "NBK Management Trainee",         titleEn: "NBK Management Trainee",         unitCount: 5,  descAr: "برنامج الكوادر الوطنية في بنك الكويت الوطني",     descEn: "NBK National Cadre programme",        Icon: Building2,  iconBg: "bg-[#0F1E3C]",    iconColor: "text-white",       group: "banking"  },
  { id: "boubyan-cs",         titleAr: "بوبيان — خدمة العملاء",         titleEn: "Boubyan Customer Service",       unitCount: 4,  descAr: "خدمة العملاء في بنك بوبيان الإسلامي",            descEn: "Boubyan Bank CS track",               Icon: Headphones, iconBg: "bg-primary/15",    iconColor: "text-primary",     group: "banking"  },
  { id: "generic-banking",    titleAr: "مقابلات مصرفية عامة",           titleEn: "Generic Banking Interview",      unitCount: 4,  descAr: "دليل شامل لأي مقابلة في القطاع المصرفي",         descEn: "General banking interview guide",      Icon: Users,      iconBg: "bg-secondary/15",  iconColor: "text-secondary",   group: "banking"  },
  { id: "financial-analysis", titleAr: "التحليل المالي",                titleEn: "Financial Analysis Pro",         unitCount: 3,  descAr: "التحليل المالي للمقابلات التقنية",                descEn: "Financial analysis track",             Icon: TrendingUp, iconBg: "bg-emerald-100",   iconColor: "text-emerald-600", group: "banking"  },
  { id: "kfh-islamic",        titleAr: "بيت التمويل الكويتي (KFH)",     titleEn: "Kuwait Finance House (KFH)",     unitCount: 4,  descAr: "المقابلات المتخصصة في التمويل الإسلامي",          descEn: "Specialized Islamic finance interviews",Icon: BookOpen,   iconBg: "bg-amber-100",     iconColor: "text-amber-600",   group: "banking"  },
  { id: "gulf-bank",          titleAr: "بنك الخليج",                    titleEn: "Gulf Bank",                      unitCount: 3,  descAr: "التحضير لمقابلات بنك الخليج الكويتي",             descEn: "Gulf Bank Kuwait interview prep",      Icon: Building2,  iconBg: "bg-rose-100",      iconColor: "text-rose-500",    group: "banking"  },
  // ── Private company plans ─────────────────────────────────────────────────────
  { id: "zain-kuwait",        titleAr: "زين الكويت",                    titleEn: "Zain Kuwait",                    unitCount: 4,  descAr: "التحضير لمقابلات شركة زين للاتصالات",             descEn: "Zain telecom interview prep",          Icon: Phone,      iconBg: "bg-red-100",       iconColor: "text-red-500",     group: "private"  },
  { id: "alghanim",           titleAr: "مجموعة الغانم",                 titleEn: "Alghanim Industries",            unitCount: 4,  descAr: "التحضير لمقابلات مجموعة الغانم المتنوعة",         descEn: "Alghanim diversified group prep",      Icon: Layers,     iconBg: "bg-purple-100",    iconColor: "text-purple-600",  group: "private"  },
  { id: "agility",            titleAr: "أجيليتي للخدمات اللوجستية",    titleEn: "Agility Logistics",              unitCount: 4,  descAr: "التحضير لمقابلات شركة أجيليتي اللوجستية",        descEn: "Agility logistics interview prep",     Icon: Truck,      iconBg: "bg-sky-100",       iconColor: "text-sky-600",     group: "private"  },
  { id: "gulf-insurance",     titleAr: "مجموعة الخليج للتأمين (GIG)",  titleEn: "Gulf Insurance Group (GIG)",     unitCount: 4,  descAr: "التحضير لمقابلات أكبر شركة تأمين في الكويت",      descEn: "Gulf Insurance Group interview prep",  Icon: Shield,     iconBg: "bg-teal-100",      iconColor: "text-teal-600",    group: "private"  },
];

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done")   return <CheckCircle2 size={20} className="text-primary" fill="currentColor" strokeWidth={0} />;
  if (status === "active") return <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></div>;
  return <Lock size={14} className="text-gray-300" />;
}

export default function PlansPage() {
  const { lang, isRTL } = useLanguage();
  const [progressMap,  setProgressMap]  = useState<Record<string, number>>({});
  const [activeGroup,  setActiveGroup]  = useState<"all" | PlanGroup>("all");

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

  const displayedPlans = PLANS.filter((p) => activeGroup === "all" || p.group === activeGroup);

  return (
    <div className="p-6 md:p-8 space-y-6" dir={isRTL ? "rtl" : "ltr"}>

      {activePlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Steps — 2/3 */}
          <div className="lg:col-span-2 space-y-4">

            {/* Active plan banner */}
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

            {/* Steps list */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-extrabold text-gray-900 text-sm">{tx(t.plans.steps, lang)}</h2>
              </div>
              <div className="divide-y divide-border">
                {steps.map((step, idx) => (
                  <div key={step.id} className={`flex items-start gap-4 px-6 py-4 ${step.status === "locked" ? "opacity-50" : ""}`}>
                    <div className="mt-0.5 shrink-0"><StepIcon status={step.status} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{idx + 1}. {isRTL ? step.titleAr : step.titleEn}</p>
                        {step.status === "active" && <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">{tx(t.plans.status.active, lang)}</span>}
                        {step.status === "done"   && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5">{tx(t.plans.status.done, lang)}</span>}
                      </div>
                      <p className="text-xs text-muted">{isRTL ? step.descAr : step.descEn}</p>
                      {step.resourceUrl && (
                        <a href={step.resourceUrl} target="_blank" rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline">
                          <FileText size={11} />
                          {isRTL ? step.resourceLabelAr : step.resourceLabelEn}
                          <ExternalLink size={10} />
                        </a>
                      )}
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

          {/* Skill / resource focus — 1/3 */}
          <div className="space-y-4">
            <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">{tx(t.plans.skills, lang)}</h2>
            {SKILL_FOCUS.map((item) => (
              <a key={item.titleEn} href={item.url} target="_blank" rel="noopener noreferrer"
                className="bg-surface rounded-2xl border border-border p-5 space-y-3 block hover:border-primary transition group">
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${item.accent}`}>{isRTL ? item.tagAr : item.tagEn}</span>
                <h3 className="font-extrabold text-gray-900 text-sm">{isRTL ? item.titleAr : item.titleEn}</h3>
                <p className="text-xs text-muted leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
                <div className="flex items-center justify-between text-muted">
                  <div className="flex items-center gap-1.5"><BookOpen size={11} /><span className="text-xs">{isRTL ? item.metaAr : item.metaEn}</span></div>
                  <ExternalLink size={13} className="group-hover:text-primary transition" />
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : (

        /* Plans selection */
        <div className="space-y-6">

          {/* Group filter pills */}
          <div className="flex items-center gap-2">
            {(["all", "banking", "private"] as const).map((g) => {
              const label = g === "all"
                ? (isRTL ? "الكل" : "All")
                : g === "banking"
                  ? (isRTL ? "البنوك" : "Banking")
                  : (isRTL ? "الشركات الخاصة" : "Private Companies");
              return (
                <button key={g} onClick={() => setActiveGroup(g)}
                  className={`text-xs font-bold rounded-full px-4 py-2 transition ${activeGroup === g ? "bg-primary text-white" : "bg-surface border border-border text-muted hover:text-gray-900"}`}>
                  {label}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-muted">{tx(t.plans.chooseplan, lang)}</p>

          {/* Banking group */}
          {(activeGroup === "all" || activeGroup === "banking") && (
            <div className="space-y-3">
              {activeGroup === "all" && (
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                  {isRTL ? "المصارف والمؤسسات المالية" : "Banks & Financial Institutions"}
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedPlans.filter((p) => p.group === "banking").map((plan) => (
                  <button key={plan.id} className="bg-surface rounded-2xl border border-border px-5 py-4 flex items-center gap-4 text-start hover:border-primary transition group w-full active:scale-[0.98]">
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

          {/* Private companies group */}
          {(activeGroup === "all" || activeGroup === "private") && (
            <div className="space-y-3">
              {activeGroup === "all" && (
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                  {isRTL ? "الشركات الخاصة" : "Private Companies"}
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedPlans.filter((p) => p.group === "private").map((plan) => (
                  <button key={plan.id} className="bg-surface rounded-2xl border border-border px-5 py-4 flex items-center gap-4 text-start hover:border-primary transition group w-full active:scale-[0.98]">
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
