"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import DocumentUpload from "@/components/DocumentUpload";
import { FileText, PlayCircle, BookOpen, Download, Image as ImageIcon, Plus } from "lucide-react";

type Upload = { id: string; file_name: string; public_url: string; upload_type: string };

const FEATURED = [
  {
    id: "nbk-guide",
    title: "NBK Interview Guide",
    description: "دليل شامل للتحضير لمقابلات بنك الكويت الوطني، يغطي القيم والثقافة والأسئلة الشائعة.",
    type: "pdf",
    badge: "دليل مميز",
    gradient: "from-blue-800 to-blue-600",
  },
  {
    id: "boubyan-culture",
    title: "ثقافة Boubyan",
    description: "فيديو: كيف يختلف بنك بوبيان؟",
    type: "video",
    badge: "موصى به",
    gradient: "from-primary to-primary-dark",
  },
];

const RESOURCES = [
  { id: "1", title: "أساسيات الخدمات المصرفية الإسلامية", type: "pdf",     meta: "PDF • 2.4 MB • 15 صفحة" },
  { id: "2", title: "التعامل مع الأسئلة الصعبة",           type: "video",   meta: "فيديو • 12 دقيقة • HD"  },
  { id: "3", title: "أسرار لغة الجسد في المقابلات",        type: "article", meta: "مقال • قراءة 5 دقائق"   },
  { id: "4", title: "نماذج الاختبارات الفنية لـ KFH",       type: "pdf",     meta: "PDF • 1.1 MB • 8 صفحات" },
];

const FILTERS = ["الكل", "أساسيات البنوك", "الأسئلة السلوكية"];

function TypeIcon({ type }: { type: string }) {
  if (type === "pdf")     return <FileText  size={20} className="text-red-400"     />;
  if (type === "video")   return <PlayCircle size={20} className="text-secondary"  />;
  return                         <BookOpen  size={20} className="text-primary"     />;
}

export default function MaterialsPage() {
  const [filter, setFilter]           = useState("الكل");
  const [search, setSearch]           = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDocUpload, setShowDocUpload]     = useState(false);
  const [uploads, setUploads]         = useState<Upload[]>([]);

  useEffect(() => {
    const supabase = createClient();
    // A01: filter by user_id — never expose other users' uploads
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
    <div className="flex flex-col min-h-screen bg-neutral pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-surface border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-extrabold text-gray-900">المصادر</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImageUpload(true)}
              aria-label="رفع صورة"
              className="flex items-center gap-1.5 text-xs font-semibold bg-secondary/10 text-secondary rounded-full px-3 py-2 transition active:scale-95"
            >
              <ImageIcon size={13} />
              صورة
            </button>
            <button
              onClick={() => setShowDocUpload(true)}
              aria-label="رفع مستند"
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-full px-3 py-2 transition active:scale-95"
            >
              <Plus size={13} />
              مستند
            </button>
          </div>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في المصادر"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-neutral text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
        />
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 text-xs font-semibold rounded-full px-3 py-1.5 transition active:scale-95 ${
                filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Featured cards */}
        {!search && (
          <div className="space-y-3">
            {FEATURED.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl bg-gradient-to-br ${item.gradient} text-white p-5 min-h-[110px] flex flex-col justify-between`}
              >
                <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5 self-end">
                  {item.badge}
                </span>
                <div>
                  <h3 className="font-extrabold text-base">{item.title}</h3>
                  <p className="text-xs text-white/80 mt-0.5">{item.description}</p>
                  {item.type === "video" && (
                    <button className="mt-3 flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold rounded-lg px-4 py-1.5 transition active:scale-95">
                      <PlayCircle size={14} />
                      شاهد الآن
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resource list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">أحدث المصادر</h2>
            <button className="text-xs text-primary font-semibold transition active:scale-95">عرض الكل</button>
          </div>
          <div className="space-y-2">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3 transition hover:border-primary/30"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-border flex items-center justify-center shrink-0">
                  <TypeIcon type={r.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{r.title}</p>
                  <p className="text-xs text-muted mt-0.5">{r.meta}</p>
                </div>
                <button
                  aria-label="تحميل"
                  className="w-9 h-9 rounded-full bg-gray-50 border border-border flex items-center justify-center text-muted transition active:scale-95 hover:text-primary"
                >
                  <Download size={15} />
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10">
                <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-muted text-sm">لا توجد نتائج لـ &quot;{search}&quot;</p>
                <p className="text-xs text-muted mt-1">جرّب كلمات أخرى</p>
              </div>
            )}
          </div>
        </div>

        {/* User uploads */}
        {uploads.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-3">رفوعاتك</h2>
            <div className="space-y-2">
              {uploads.map((u) => (
                <div
                  key={u.id}
                  className="bg-surface rounded-2xl border border-border p-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-border flex items-center justify-center shrink-0">
                    {u.upload_type === "image"
                      ? <ImageIcon size={16} className="text-secondary" />
                      : <FileText  size={16} className="text-primary"   />
                    }
                  </div>
                  <p className="text-sm text-gray-900 flex-1 truncate">{u.file_name}</p>
                  <a
                    href={u.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs font-semibold shrink-0 transition active:scale-95"
                  >
                    فتح
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showImageUpload && (
        <ImageUpload
          onClose={() => setShowImageUpload(false)}
          onSuccess={(upload) => { setUploads((prev) => [upload, ...prev]); setShowImageUpload(false); }}
        />
      )}
      {showDocUpload && (
        <DocumentUpload
          onClose={() => setShowDocUpload(false)}
          onSuccess={(upload) => { setUploads((prev) => [upload, ...prev]); setShowDocUpload(false); }}
        />
      )}
    </div>
  );
}
