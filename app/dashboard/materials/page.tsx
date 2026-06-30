"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import DocumentUpload from "@/components/DocumentUpload";
import {
  FileText, PlayCircle, BookOpen, BarChart2,
  Download, ExternalLink, Plus, Search, Image as ImageIcon,
} from "lucide-react";

type Upload = { id: string; file_name: string; public_url: string; upload_type: string };

const FEATURED = [
  {
    id: "nbk-guide",
    title: "NBK Interview Guide",
    description: "دليل شامل للتحضير لمقابلات بنك الكويت الوطني، يغطي القيم والثقافة والأسئلة الشائعة.",
    type: "pdf",
    badge: "دليل مميز",
    bg: "bg-[#0F1E3C]",
  },
  {
    id: "boubyan-culture",
    title: "ثقافة Boubyan",
    description: "فيديو: كيف يختلف بنك بوبيان؟",
    type: "video",
    badge: "موصى به",
    bg: "bg-primary",
  },
];

type Resource = {
  id: string;
  title: string;
  type: "pdf" | "video" | "article" | "data";
  meta: string;
  action: "download" | "external";
};

const RESOURCES: Resource[] = [
  { id: "1", title: "أساسيات الخدمات المصرفية الإسلامية", type: "pdf",     meta: "PDF • 2.4 MB • 15 صفحة",   action: "download" },
  { id: "2", title: "التعامل مع الأسئلة الصعبة",           type: "video",   meta: "فيديو • 12 دقيقة • HD",    action: "external" },
  { id: "3", title: "أسرار لغة الجسد في المقابلات",        type: "article", meta: "مقال • قراءة 5 دقائق",      action: "external" },
  { id: "4", title: "نماذج الاختبارات الفنية لـ KFH",       type: "data",    meta: "PDF • 1.1 MB • 8 صفحات",   action: "download" },
  { id: "5", title: "مصطلحات الخدمات المصرفية الأساسية",   type: "article", meta: "مقال • قراءة 7 دقائق",      action: "external" },
  { id: "6", title: "دليل مقابلات بنك الخليج",             type: "pdf",     meta: "PDF • 1.8 MB • 12 صفحة",   action: "download" },
];

const FILTERS = ["الكل", "أساسيات البنوك", "الأسئلة السلوكية"];

const TYPE_STYLE: Record<string, { bg: string; icon: React.ReactNode }> = {
  pdf:     { bg: "bg-rose-100",   icon: <FileText   size={18} className="text-rose-500"  /> },
  video:   { bg: "bg-primary/15", icon: <PlayCircle size={18} className="text-primary"   /> },
  article: { bg: "bg-amber-100",  icon: <BookOpen   size={18} className="text-amber-600" /> },
  data:    { bg: "bg-[#0F1E3C]",  icon: <BarChart2  size={18} className="text-white"     /> },
};

export default function MaterialsPage() {
  const [filter,          setFilter]          = useState("الكل");
  const [search,          setSearch]          = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDocUpload,   setShowDocUpload]   = useState(false);
  const [uploads,         setUploads]         = useState<Upload[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("uploads")
        .select("id, file_name, public_url, upload_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => setUploads(data ?? []));
    });
  }, []);

  const filtered = RESOURCES.filter((r) => !search || r.title.includes(search));

  return (
    <div className="flex flex-col min-h-screen bg-neutral pb-24 md:pb-8">
      {/* Page header */}
      <div className="px-5 md:px-8 pt-10 md:pt-10 pb-5 bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">المصادر</h1>
              <p className="text-muted text-sm mt-0.5">أدلة وفيديوهات ومقالات للتحضير</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowImageUpload(true)} aria-label="رفع صورة"
                className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center transition active:scale-95 hover:bg-secondary/20">
                <ImageIcon size={16} />
              </button>
              <button onClick={() => setShowDocUpload(true)} aria-label="رفع مستند"
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold rounded-full px-4 py-2 transition active:scale-95 hover:bg-primary-dark">
                <Plus size={14} />
                رفع ملف
              </button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث في المصادر"
                className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-border bg-neutral text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`shrink-0 text-xs font-bold rounded-full px-4 py-2 transition active:scale-95 ${
                    filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Featured cards — 2-col grid on desktop */}
          {!search && (
            <div>
              <h2 className="font-extrabold text-gray-900 mb-4">مميز</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURED.map((item) => (
                  <div key={item.id}
                    className={`${item.bg} rounded-2xl p-5 min-h-[140px] flex flex-col justify-between overflow-hidden relative`}>
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                      style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                    <span className="self-end text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1 z-10">
                      {item.badge}
                    </span>
                    <div className="z-10">
                      <h3 className="font-extrabold text-white text-base leading-snug">{item.title}</h3>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">{item.description}</p>
                      {item.type === "video" && (
                        <button className="mt-3 flex items-center gap-1.5 bg-white text-primary text-xs font-bold rounded-xl px-4 py-2 transition active:scale-95">
                          <PlayCircle size={13} />شاهد الآن
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resource list — 2-col grid on desktop */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-gray-900">أحدث المصادر</h2>
              <button className="text-xs text-primary font-bold transition active:scale-95">عرض الكل</button>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen size={34} className="text-gray-200 mx-auto mb-3" />
                <p className="text-muted text-sm font-medium">لا توجد نتائج لـ &quot;{search}&quot;</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filtered.map((r) => {
                  const { bg, icon } = TYPE_STYLE[r.type] ?? TYPE_STYLE.article;
                  return (
                    <div key={r.id} className="bg-surface rounded-2xl px-4 py-3.5 flex items-center gap-3.5">
                      <button aria-label={r.action === "download" ? "تحميل" : "فتح"}
                        className="w-8 h-8 rounded-full bg-gray-50 border border-border flex items-center justify-center text-muted shrink-0 transition active:scale-95 hover:text-primary">
                        {r.action === "download" ? <Download size={14} /> : <ExternalLink size={14} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-snug">{r.title}</p>
                        <p className="text-xs text-muted mt-0.5">{r.meta}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        {icon}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User uploads */}
          {uploads.length > 0 && (
            <div>
              <h2 className="font-extrabold text-gray-900 mb-4">رفوعاتك</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {uploads.map((u) => {
                  const isImage = u.upload_type === "image";
                  return (
                    <div key={u.id} className="bg-surface rounded-2xl px-4 py-3.5 flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isImage ? "bg-secondary/10" : "bg-primary/10"}`}>
                        {isImage ? <ImageIcon size={18} className="text-secondary" /> : <FileText size={18} className="text-primary" />}
                      </div>
                      <p className="text-sm font-medium text-gray-900 flex-1 truncate">{u.file_name}</p>
                      <a href={u.public_url} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-gray-50 border border-border flex items-center justify-center text-muted shrink-0 hover:text-primary">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

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
