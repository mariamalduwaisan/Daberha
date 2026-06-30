"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import DocumentUpload from "@/components/DocumentUpload";
import {
  FileText, PlayCircle, BookOpen, BarChart2,
  Download, ExternalLink, Plus, Search, Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

type Upload = { id: string; file_name: string; public_url: string; upload_type: string };

const FEATURED = [
  { id: "nbk-guide",       title: "NBK Interview Guide",  descAr: "دليل شامل للتحضير لمقابلات بنك الكويت الوطني، يغطي القيم والثقافة والأسئلة الشائعة.", descEn: "Comprehensive NBK interview prep guide covering values, culture and common questions.", type: "pdf",   bg: "bg-[#0F1E3C]" },
  { id: "boubyan-culture", title: "Boubyan Bank Culture", descAr: "فيديو: كيف يختلف بنك بوبيان؟",                                                         descEn: "Video: What makes Boubyan Bank different?",                                               type: "video", bg: "bg-primary"    },
];

type Resource = {
  id: string; titleAr: string; titleEn: string;
  type: "pdf" | "video" | "article" | "data";
  metaAr: string; metaEn: string; action: "download" | "external"; url: string;
};

const RESOURCES: Resource[] = [
  { id: "1", titleAr: "أساسيات الخدمات المصرفية الإسلامية", titleEn: "Islamic Banking Basics",         type: "pdf",     metaAr: "PDF • 2.4 MB • 15 صفحة",  metaEn: "PDF • 2.4 MB • 15 pages",  action: "external", url: "https://en.wikipedia.org/wiki/Islamic_banking_and_finance" },
  { id: "2", titleAr: "التعامل مع الأسئلة الصعبة",           titleEn: "Handling Tough Questions",      type: "video",   metaAr: "فيديو • 12 دقيقة",        metaEn: "Video • 12 min",            action: "external", url: "https://www.youtube.com/results?search_query=tough+interview+questions+banking" },
  { id: "3", titleAr: "أسرار لغة الجسد في المقابلات",        titleEn: "Body Language in Interviews",   type: "article", metaAr: "مقال • 5 دقائق",          metaEn: "Article • 5 min",           action: "external", url: "https://www.indeed.com/career-advice/interviewing/body-language-tips-for-your-next-interview" },
  { id: "4", titleAr: "نماذج الاختبارات الفنية لـ KFH",       titleEn: "KFH Technical Test Samples",   type: "data",    metaAr: "PDF • 1.1 MB • 8 صفحات",  metaEn: "PDF • 1.1 MB • 8 pages",   action: "external", url: "https://www.kfh.com/en/home/about/careers.html" },
  { id: "5", titleAr: "مصطلحات الخدمات المصرفية الأساسية",   titleEn: "Essential Banking Terminology", type: "article", metaAr: "مقال • 7 دقائق",          metaEn: "Article • 7 min",           action: "external", url: "https://www.investopedia.com/financial-term-dictionary-4769738" },
  { id: "6", titleAr: "دليل مقابلات بنك الخليج",             titleEn: "Gulf Bank Interview Guide",     type: "pdf",     metaAr: "PDF • 1.8 MB • 12 صفحة",  metaEn: "PDF • 1.8 MB • 12 pages",  action: "external", url: "https://www.gulfbank.com.kw/en/about-us/careers" },
];

const TYPE_STYLE: Record<string, { bg: string; icon: React.ReactNode }> = {
  pdf:     { bg: "bg-rose-100",   icon: <FileText   size={16} className="text-rose-500"  /> },
  video:   { bg: "bg-primary/15", icon: <PlayCircle size={16} className="text-primary"   /> },
  article: { bg: "bg-amber-100",  icon: <BookOpen   size={16} className="text-amber-600" /> },
  data:    { bg: "bg-[#0F1E3C]",  icon: <BarChart2  size={16} className="text-white"     /> },
};

export default function MaterialsPage() {
  const { lang, isRTL } = useLanguage();
  const [filter,          setFilter]          = useState(0);
  const [search,          setSearch]          = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDocUpload,   setShowDocUpload]   = useState(false);
  const [uploads,         setUploads]         = useState<Upload[]>([]);

  const FILTERS = [tx(t.materials.filters.all, lang), tx(t.materials.filters.banking, lang), tx(t.materials.filters.behavioural, lang)];

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      createClient().from("uploads")
        .select("id,file_name,public_url,upload_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => setUploads(data ?? []));
    });
  }, []);

  const filtered = RESOURCES.filter((r) => {
    const title = isRTL ? r.titleAr : r.titleEn;
    return !search || title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-6 md:p-8 space-y-8" dir={isRTL ? "rtl" : "ltr"}>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f, i) => (
            <button key={f} onClick={() => setFilter(i)}
              className={`shrink-0 text-xs font-bold rounded-full px-4 py-2 transition active:scale-95 ${
                filter === i ? "bg-primary text-white" : "bg-surface border border-border text-muted hover:text-gray-900"
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search size={13} className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted pointer-events-none`} />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={tx(t.materials.search, lang)}
              className={`${isRTL ? "pr-8 pl-3" : "pl-8 pr-3"} py-2 rounded-xl border border-border bg-surface text-gray-900 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-primary transition`} />
          </div>
          <button onClick={() => setShowImageUpload(true)}
            className="w-9 h-9 rounded-xl border border-border bg-surface text-muted flex items-center justify-center hover:text-secondary transition">
            <ImageIcon size={15} />
          </button>
          <button onClick={() => setShowDocUpload(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold rounded-xl px-3 py-2 transition hover:bg-primary-dark active:scale-95">
            <Plus size={13} />{tx(t.materials.uploadFile, lang)}
          </button>
        </div>
      </div>

      {/* Featured cards */}
      {!search && (
        <div>
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-4">{tx(t.materials.featured, lang)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED.map((item) => (
              <div key={item.id} className={`${item.bg} rounded-2xl p-6 min-h-[140px] flex flex-col justify-between overflow-hidden relative`}>
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.25) 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
                <span className="self-end text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1 z-10">
                  {isRTL ? "دليل مميز" : "Featured"}
                </span>
                <div className="z-10">
                  <h3 className="font-extrabold text-white text-base">{item.title}</h3>
                  <p className="text-xs text-white/65 mt-1 leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
                  {item.type === "video" && (
                    <button className="mt-3 flex items-center gap-1.5 bg-white text-primary text-xs font-bold rounded-xl px-4 py-2 transition active:scale-95">
                      <PlayCircle size={12} />{tx(t.materials.watchNow, lang)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-extrabold text-gray-900">{tx(t.materials.latest, lang)}</h2>
          <button className="text-xs text-primary font-bold hover:underline">{tx(t.materials.viewAll, lang)}</button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen size={30} className="text-gray-200 mx-auto mb-3" />
            <p className="text-muted text-sm">{tx(t.materials.noResults, lang)}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => {
              const { bg, icon } = TYPE_STYLE[r.type] ?? TYPE_STYLE.article;
              return (
                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-neutral transition group cursor-pointer">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{isRTL ? r.titleAr : r.titleEn}</p>
                    <p className="text-xs text-muted">{isRTL ? r.metaAr : r.metaEn}</p>
                  </div>
                  <div className="text-muted group-hover:text-primary transition shrink-0">
                    {r.action === "download" ? <Download size={15} /> : <ExternalLink size={15} />}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* User uploads */}
      {uploads.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-extrabold text-gray-900">{tx(t.materials.uploads, lang)}</h2>
          </div>
          <div className="divide-y divide-border">
            {uploads.map((u) => {
              const isImage = u.upload_type === "image";
              return (
                <div key={u.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isImage ? "bg-secondary/10" : "bg-primary/10"}`}>
                    {isImage ? <ImageIcon size={15} className="text-secondary" /> : <FileText size={15} className="text-primary" />}
                  </div>
                  <p className="text-sm font-medium text-gray-900 flex-1 truncate">{u.file_name}</p>
                  <a href={u.public_url} target="_blank" rel="noopener noreferrer"
                    className="text-muted hover:text-primary transition">
                    <ExternalLink size={15} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showImageUpload && (
        <ImageUpload onClose={() => setShowImageUpload(false)}
          onSuccess={(u) => { setUploads((p) => [u, ...p]); setShowImageUpload(false); }} />
      )}
      {showDocUpload && (
        <DocumentUpload onClose={() => setShowDocUpload(false)}
          onSuccess={(u) => { setUploads((p) => [u, ...p]); setShowDocUpload(false); }} />
      )}
    </div>
  );
}
