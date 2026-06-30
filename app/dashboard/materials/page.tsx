"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import DocumentUpload from "@/components/DocumentUpload";
import {
  FileText, PlayCircle, BookOpen, BarChart2,
  Download, ExternalLink, Plus, Search, Image as ImageIcon,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";

type Upload   = { id: string; file_name: string; public_url: string; upload_type: string };
type Resource = {
  id: string; title_ar: string; title_en: string;
  desc_ar: string; desc_en: string;
  type: "pdf" | "video" | "article" | "data";
  url: string; meta_ar: string; meta_en: string;
  category: string; source: string;
};

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  "all":            { ar: "الكل",          en: "All"          },
  "islamic-banking":{ ar: "المصرفية الإسلامية", en: "Islamic Banking" },
  "kuwait-banking": { ar: "الكويت",        en: "Kuwait"       },
  "interview":      { ar: "المقابلات",     en: "Interviews"   },
  "skills":         { ar: "مهارات",        en: "Skills"       },
  "company":        { ar: "شركات",         en: "Companies"    },
};

const TYPE_STYLE: Record<string, { bg: string; icon: React.ReactNode }> = {
  pdf:     { bg: "bg-rose-100",   icon: <FileText   size={16} className="text-rose-500"  /> },
  video:   { bg: "bg-primary/15", icon: <PlayCircle size={16} className="text-primary"   /> },
  article: { bg: "bg-amber-100",  icon: <BookOpen   size={16} className="text-amber-600" /> },
  data:    { bg: "bg-[#0F1E3C]",  icon: <BarChart2  size={16} className="text-white"     /> },
};

const FEATURED_ITEMS = [
  {
    id: "kdipa-report",
    title: "Kuwait Financial Sector Report",
    titleAr: "تقرير القطاع المالي الكويتي",
    descAr: "تقرير KDIPA الرسمي حول القطاع المالي والمصرفي في الكويت — مرجع لا غنى عنه لكل متقدم لوظيفة في القطاع المصرفي.",
    descEn: "Official KDIPA report on Kuwait's financial and banking sector — an essential reference for any banking job applicant.",
    url: "https://kdipa.gov.kw/wp-content/uploads/2023/01/Financial-Services-Banking-Sector.pdf",
    badge: "PDF رسمي",
    badgeEn: "Official PDF",
    bg: "bg-[#0F1E3C]",
  },
  {
    id: "imf-islamic",
    title: "IMF Islamic Finance Paper",
    titleAr: "ورقة صندوق النقد الدولي — التمويل الإسلامي",
    descAr: "ورقة بحثية من صندوق النقد الدولي تشرح مبادئ التمويل الإسلامي وكيف تختلف البنوك الإسلامية عن التقليدية.",
    descEn: "IMF research paper explaining Islamic finance principles and how Islamic banks differ from conventional ones.",
    url: "https://www.imf.org/external/pubs/ft/fandd/1997/06/pdf/iqbal.pdf",
    badge: "IMF PDF",
    badgeEn: "IMF PDF",
    bg: "bg-primary",
  },
];

export default function MaterialsPage() {
  const { lang, isRTL } = useLanguage();
  const [activeCategory,   setActiveCategory]   = useState("all");
  const [search,            setSearch]            = useState("");
  const [showImageUpload,   setShowImageUpload]   = useState(false);
  const [showDocUpload,     setShowDocUpload]     = useState(false);
  const [uploads,           setUploads]           = useState<Upload[]>([]);
  const [resources,         setResources]         = useState<Resource[]>([]);
  const [loading,           setLoading]           = useState(true);

  useEffect(() => {
    const sb = createClient();
    // Fetch resources from Supabase
    sb.from("resources")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setResources((data as Resource[]) ?? []);
        setLoading(false);
      });

    // Fetch user uploads
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      sb.from("uploads")
        .select("id,file_name,public_url,upload_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => setUploads(data ?? []));
    });
  }, []);

  const categories = ["all", ...Array.from(new Set(resources.map((r) => r.category)))];

  const filtered = resources.filter((r) => {
    const matchCat = activeCategory === "all" || r.category === activeCategory;
    const title = isRTL ? r.title_ar : r.title_en;
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-8" dir={isRTL ? "rtl" : "ltr"}>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const label = CATEGORY_LABELS[cat]?.[lang === "ar" ? "ar" : "en"] ?? cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`shrink-0 text-xs font-bold rounded-full px-4 py-2 transition active:scale-95 ${
                  activeCategory === cat ? "bg-primary text-white" : "bg-surface border border-border text-muted hover:text-gray-900"
                }`}>
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search size={13} className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted pointer-events-none`} />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={tx(t.materials.search, lang)}
              dir={isRTL ? "rtl" : "ltr"}
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

      {/* Featured PDFs (show when not searching) */}
      {!search && activeCategory === "all" && (
        <div>
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-4">{tx(t.materials.featured, lang)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED_ITEMS.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className={`${item.bg} rounded-2xl p-6 min-h-[140px] flex flex-col justify-between overflow-hidden relative group transition hover:opacity-90 active:scale-[0.98]`}>
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.25) 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
                <span className="self-end text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1 z-10">
                  {isRTL ? item.badge : item.badgeEn}
                </span>
                <div className="z-10">
                  <h3 className="font-extrabold text-white text-base">{isRTL ? item.titleAr : item.title}</h3>
                  <p className="text-xs text-white/65 mt-1 leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-white/60 text-xs font-medium group-hover:text-white transition">
                    <ExternalLink size={11} />
                    <span>{isRTL ? "فتح PDF" : "Open PDF"}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Resources table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-extrabold text-gray-900">
            {tx(t.materials.latest, lang)}
            {filtered.length > 0 && (
              <span className="ml-2 text-xs text-muted font-normal">({filtered.length})</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen size={30} className="text-gray-200 mx-auto mb-3" />
            <p className="text-muted text-sm">{tx(t.materials.noResults, lang)}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => {
              const { bg, icon } = TYPE_STYLE[r.type] ?? TYPE_STYLE.article;
              const title  = isRTL ? r.title_ar : r.title_en;
              const meta   = isRTL ? r.meta_ar  : r.meta_en;
              const source = r.source;
              return (
                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-neutral transition group cursor-pointer">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {source && (
                        <span className="text-[11px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                          {source}
                        </span>
                      )}
                      <p className="text-xs text-muted">{meta}</p>
                    </div>
                  </div>
                  <div className="text-muted group-hover:text-primary transition shrink-0">
                    {r.type === "pdf" ? <Download size={15} /> : <ExternalLink size={15} />}
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
