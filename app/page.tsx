"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, CheckCircle2 } from "lucide-react";

const FEATURES = [
  "مقابلات تجريبية بالذكاء الاصطناعي",
  "أسئلة مخصصة لكل بنك كويتي",
  "ملاحظات فورية على إجاباتك",
  "مصادر وأدلة تحضير شاملة",
];

export default function SignInPage() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError("حدث خطأ. يرجى المحاولة مجدداً.");
    else setSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Brand panel (desktop only) ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#0F1E3C] flex-col justify-between p-12 relative overflow-hidden">
        {/* grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)", backgroundSize: "32px 32px" }}
        />
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-white font-extrabold text-lg">دب</span>
            </div>
            <span className="text-white font-extrabold text-2xl">دبرها</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            استعد لمقابلتك<br />بذكاء اصطناعي
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm">
            منصة التحضير الأذكى للمقابلات الوظيفية في القطاع المصرفي الكويتي
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-primary shrink-0" />
              <span className="text-white/80 text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>

        {/* Decorative purple circle */}
        <div className="absolute bottom-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-primary/20 pointer-events-none" />
      </div>

      {/* ── Sign-in panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-neutral">
        {/* Mobile logo */}
        <div className="md:hidden mb-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-2xl">دبرها</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">دبرها</h1>
          <p className="text-muted mt-1 text-sm">مساعدك الذكي للمقابلات الوظيفية</p>
        </div>

        <div className="w-full max-w-sm">
          {sent ? (
            <div className="bg-surface rounded-2xl p-8 text-center shadow-sm border border-border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">تحقق من بريدك</h2>
              <p className="text-muted text-sm leading-relaxed">
                أرسلنا رابط الدخول إلى{" "}
                <strong className="text-gray-900">{email}</strong>.
                <br />الرابط صالح لمدة ٣٠ دقيقة.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-primary text-sm font-semibold underline underline-offset-2"
              >
                إرسال إلى بريد آخر
              </button>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border">
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">تسجيل الدخول</h2>
              <p className="text-muted text-sm mb-6">أدخل بريدك وسنرسل لك رابط الدخول فوراً</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
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
                    className="w-full px-4 py-3 rounded-xl border border-border bg-neutral text-gray-900 placeholder-muted text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition disabled:opacity-50 active:scale-95"
                >
                  {loading ? "جاري الإرسال..." : "أرسل رابط الدخول"}
                </button>
              </form>

              <p className="text-center text-xs text-muted mt-5">
                لا يلزمك تذكر كلمة مرور · رابط واحد للدخول
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
