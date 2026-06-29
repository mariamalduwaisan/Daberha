"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Upload = { id: string; file_name: string; public_url: string; upload_type: string };

type Props = {
  onClose: () => void;
  onSuccess: (upload: Upload) => void;
};

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 10 * 1024 * 1024;

export default function DocumentUpload({ onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) { setError("يُسمح فقط بـ PDF و DOCX"); return; }
    if (f.size > MAX_SIZE) { setError("الحجم الأقصى 10 ميغابايت"); return; }
    setError("");
    setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setProgress(10);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { setError("يجب تسجيل الدخول أولاً"); setUploading(false); return; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    setProgress(40);
    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, { upsert: false });

    if (uploadError) { setError("فشل الرفع: " + uploadError.message); setUploading(false); return; }

    setProgress(75);
    // A02: 1-hour expiry — minimise exposure if a signed URL is leaked
    const { data: signedData } = await supabase.storage.from("documents").createSignedUrl(path, 60 * 60);
    const publicUrl = signedData?.signedUrl ?? "";

    const { data: record, error: dbError } = await supabase
      .from("uploads")
      .insert({ user_id: user.id, file_name: file.name, file_type: file.type, file_size: file.size, storage_path: path, public_url: publicUrl, upload_type: "document" })
      .select()
      .single();

    setProgress(100);
    if (dbError || !record) { setError("فشل حفظ السجل"); setUploading(false); return; }
    onSuccess(record as Upload);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-surface rounded-t-3xl w-full max-w-[430px] p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-gray-900 text-lg">رفع مستند</h2>
          <button onClick={onClose} className="text-muted text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition mb-4"
        >
          {file ? (
            <div>
              <p className="text-2xl mb-1">📄</p>
              <p className="text-gray-900 font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <p className="text-3xl mb-2">📄</p>
              <p className="text-muted text-sm font-medium">انقر لاختيار ملف</p>
              <p className="text-xs text-muted mt-1">PDF أو DOCX • حتى 10 MB</p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} className="hidden" />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {uploading && (
          <div className="mb-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted mt-1 text-center">{progress}%</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 transition active:scale-95"
        >
          {uploading ? "جاري الرفع..." : "رفع المستند"}
        </button>
      </div>
    </div>
  );
}
