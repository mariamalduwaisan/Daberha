"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Sparkles } from "lucide-react";
import { t, tx } from "@/lib/translations";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

function SignInInner() {
  const { lang } = useLanguage();
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Redirect already-logged-in users straight to the dashboard
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.replace("/dashboard");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(tx(t.signIn.error, lang));
    else setSent(true);
  }

  const features = [
    tx(t.signIn.features.f1, lang),
    tx(t.signIn.features.f2, lang),
    tx(t.signIn.features.f3, lang),
    tx(t.signIn.features.f4, lang),
  ];

  const isRTL = lang === "ar";

  return (
    <div className={`min-h-screen flex ${isRTL ? "flex-col md:flex-row" : "flex-col md:flex-row-reverse"}`} dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Brand panel ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#0A0E1A] flex-col justify-between p-12 relative overflow-hidden">
        {/* star-dot pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(124,58,237,.15) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* glowing orbs */}
        <div className="absolute top-[-120px] right-[-120px] w-96 h-96 rounded-full bg-primary/10 animate-spin-slow pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full bg-secondary/10 pointer-events-none" />

        <div className="relative z-10">
          <div className={`flex items-center gap-3 mb-16 ${isRTL ? "" : "flex-row-reverse"}`}>
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-extrabold text-lg">دب</span>
            </div>
            <span className="text-white font-extrabold text-2xl">{tx(t.nav.appName, lang)}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 whitespace-pre-line">
            {tx(t.signIn.heroTitle, lang)}
          </h1>
          {/* gradient underline accent */}
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary to-secondary mb-5" />
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">{tx(t.signIn.heroSub, lang)}</p>
        </div>

        <div className="relative z-10 space-y-3">
          {features.map((f) => (
            <div key={f} className={`flex items-center gap-3 ${isRTL ? "" : "flex-row-reverse"}`}>
              <CheckCircle2 size={17} className="text-primary shrink-0" />
              <span className="text-white/70 text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-neutral relative">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-extrabold text-xs">دب</span>
            </div>
            <span className="font-extrabold text-gray-900">{tx(t.nav.appName, lang)}</span>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>

        <div className="absolute top-4 left-4 hidden md:flex gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>

        <div className="w-full max-w-sm mt-12 md:mt-0">
          {sent ? (
            <div className="bg-surface rounded-2xl p-8 text-center shadow-sm border border-border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">{tx(t.signIn.checkEmail, lang)}</h2>
              <p className="text-muted text-sm leading-relaxed">
                {tx(t.signIn.sentTo, lang)}{" "}
                <strong className="text-gray-900">{email}</strong>.
                <br />{tx(t.signIn.linkExpiry, lang)}
              </p>
              <button onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-primary text-sm font-semibold underline underline-offset-2">
                {tx(t.signIn.tryAnother, lang)}
              </button>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border">
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">{tx(t.signIn.title, lang)}</h2>
              <p className="text-muted text-sm mb-6">{tx(t.signIn.subtitle, lang)}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{tx(t.signIn.emailLabel, lang)}</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com" dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-neutral text-gray-900 placeholder-muted text-left focus:outline-none focus:ring-2 focus:ring-primary transition" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition disabled:opacity-50 active:scale-95">
                  {loading ? tx(t.signIn.sending, lang) : tx(t.signIn.cta, lang)}
                </button>
              </form>

              <p className="text-center text-xs text-muted mt-5">{tx(t.signIn.noPassword, lang)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <LanguageProvider>
      <SignInInner />
    </LanguageProvider>
  );
}
