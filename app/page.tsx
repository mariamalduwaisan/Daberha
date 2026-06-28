"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError("حدث خطأ. يرجى المحاولة مجدداً.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <Image
          src="/logo.svg"
          alt="دبرها"
          width={80}
          height={80}
          className="mx-auto mb-4"
          priority
        />
        <h1 className="text-3xl font-extrabold text-gray-900">دبرها</h1>
        <p className="text-muted mt-2 text-sm">مساعدك الذكي للتحضير للمقابلات الوظيفية</p>
      </div>

      {sent ? (
        <div className="bg-surface rounded-2xl p-8 w-full shadow-sm text-center border border-border">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">تحقق من بريدك</h2>
          <p className="text-muted text-sm leading-relaxed">
            أرسلنا رابط الدخول إلى{" "}
            <strong className="text-gray-900">{email}</strong>.
            <br />
            الرابط صالح لمدة ٣٠ دقيقة.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="mt-6 text-primary text-sm font-semibold"
          >
            إرسال إلى بريد آخر
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-8 w-full shadow-sm border border-border">
          <h2 className="text-xl font-bold text-gray-900 mb-1">تسجيل الدخول</h2>
          <p className="text-muted text-sm mb-6">أدخل بريدك وسنرسل لك رابط الدخول فوراً</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-border bg-neutral text-gray-900 placeholder-muted text-left focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-secondary text-white font-bold text-base shadow hover:bg-secondary-dark transition disabled:opacity-50"
          >
            {loading ? "جاري الإرسال..." : "أرسل رابط الدخول"}
          </button>

          <p className="text-center text-xs text-muted mt-4">
            لا يلزمك تذكر كلمة مرور · رابط واحد للدخول
          </p>
        </form>
      )}
    </div>
  );
}
