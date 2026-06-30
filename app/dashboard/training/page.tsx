"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import DocumentUpload from "@/components/DocumentUpload";
import ImageUpload from "@/components/ImageUpload";
import { Bot, SendHorizonal, Mic, MicOff, Volume2, Paperclip, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tx } from "@/lib/translations";
import { useSpeechRecognition, type SpeechMeta } from "@/hooks/useSpeechRecognition";

type Message = {
  role: "user" | "assistant";
  content: string;
  meta?: SpeechMeta;
  isVoice?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileKind?: "document" | "image";
};

function ConfidenceBadge({ meta, isRTL }: { meta: SpeechMeta; isRTL: boolean }) {
  const score = Math.min(
    100,
    Math.round(
      meta.confidence * 0.5 +
      Math.max(0, 100 - meta.fillerCount * 15) * 0.3 +
      (meta.wpm >= 100 && meta.wpm <= 160 ? 20 : meta.wpm < 100 ? 10 : 15)
    )
  );
  const color = score >= 70 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
              : score >= 45 ? "text-amber-500  bg-amber-500/10  border-amber-500/20"
              :               "text-red-500    bg-red-500/10    border-red-500/20";
  const label = isRTL
    ? score >= 70 ? "ثقة عالية" : score >= 45 ? "ثقة متوسطة" : "تحتاج تدريب"
    : score >= 70 ? "Confident"  : score >= 45 ? "Getting there" : "Needs work";

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold ${color}`}>
      <Mic size={11} />
      <span>{label}</span>
      <span className="opacity-60">·</span>
      <span>{score}%</span>
      {meta.fillerCount > 0 && (
        <>
          <span className="opacity-60">·</span>
          <span>{meta.fillerCount} {isRTL ? "كلمة تردد" : "filler words"}</span>
        </>
      )}
      <span className="opacity-60">·</span>
      <span>{meta.wpm} {isRTL ? "كلمة/د" : "wpm"}</span>
    </div>
  );
}

function FileCard({ msg, isRTL }: { msg: Message; isRTL: boolean }) {
  const isImage = msg.fileKind === "image";
  return (
    <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
      <div className="bg-surface border border-border rounded-2xl px-4 py-3 flex items-center gap-3 max-w-[260px] shadow-sm">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isImage ? "bg-secondary/10" : "bg-primary/10"}`}>
          {isImage
            ? <ImageIcon size={15} className="text-secondary" />
            : <FileText  size={15} className="text-primary"   />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 truncate">{msg.fileName}</p>
          <p className="text-[10px] text-muted mt-0.5">
            {isImage
              ? (isRTL ? "صورة مرفوعة" : "Image uploaded")
              : (isRTL ? "مستند مرفوع" : "Document uploaded")}
          </p>
        </div>
        {msg.fileUrl && (
          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition shrink-0">
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function TrainingPage() {
  const { lang, isRTL } = useLanguage();
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [sessionId,      setSessionId]      = useState<string | null>(null);
  const [voiceMode,      setVoiceMode]      = useState(false);
  const [showDocUpload,  setShowDocUpload]  = useState(false);
  const [showImgUpload,  setShowImgUpload]  = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const STARTERS = [
    tx(t.training.starters.s1, lang),
    tx(t.training.starters.s2, lang),
    tx(t.training.starters.s3, lang),
    tx(t.training.starters.s4, lang),
  ];

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title: "جلسة تدريبية" })
        .select().single();
      if (data) setSessionId(data.id);
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Voice recognition ──
  const handleVoiceResult = useCallback((transcript: string, meta: SpeechMeta) => {
    sendMessage(transcript, meta);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { isListening, interimText, supported, startListening, stopListening } =
    useSpeechRecognition(lang, handleVoiceResult);

  // Show live interim in the input while listening
  useEffect(() => {
    if (isListening && interimText) setInput(interimText);
    if (!isListening) setInput("");
  }, [isListening, interimText]);

  async function sendMessage(text?: string, meta?: SpeechMeta) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const isVoice = !!meta;
    // Prefix voice messages so AI knows to give tone feedback
    const aiContent = isVoice ? `[🎤] ${content}` : content;

    const userMsg: Message = { role: "user", content, isVoice, meta };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    if (sessionId) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId, user_id: user.id, role: "user", content,
        });
      }
    }

    try {
      const apiMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.isVoice ? `[🎤] ${m.content}` : m.content })),
        { role: "user" as const, content: aiContent },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "خطأ" }));
        throw new Error(error);
      }
      if (!response.body) throw new Error("No body");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n").filter((l) => l.startsWith("data: "))) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
            assistantContent += delta;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantContent };
              return updated;
            });
          } catch {}
        }
      }

      if (sessionId && assistantContent) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("chat_messages").insert({
            session_id: sessionId, user_id: user.id, role: "assistant", content: assistantContent,
          });
        }
      }
    } catch (err) {
      const errText = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${errText}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleFileUploaded(upload: { file_name: string; public_url: string; upload_type: string }) {
    setShowDocUpload(false);
    setShowImgUpload(false);
    setShowFilePicker(false);

    const fileKind: "document" | "image" = upload.upload_type === "image" ? "image" : "document";
    const aiPrompt = fileKind === "image"
      ? `[صورة مرفوعة: ${upload.file_name}]\nرفعت صورة كجزء من التحضير للمقابلة. اسألني أسئلة مقابلة مناسبة لوظيفة في القطاع المصرفي.`
      : `[مستند مرفوع: ${upload.file_name}]\nرفعت سيرتي الذاتية أو مستنداً مهنياً. أجرِ معي مقابلة تجريبية كاملة كأنك موظف الموارد البشرية في بنك كويتي. ابدأ بالسؤال الأول مباشرةً.`;

    // Add a visible file card to the chat (content = aiPrompt so the API sees context)
    const fileMsg: Message = {
      role: "user",
      content: aiPrompt,
      fileUrl: upload.public_url,
      fileName: upload.file_name,
      fileKind,
    };

    setMessages((prev) => {
      const updated = [...prev, fileMsg];
      // Kick off AI response asynchronously with the updated history
      triggerAiResponse(updated);
      return updated;
    });
  }

  async function triggerAiResponse(history: Message[]) {
    if (loading) return;
    setLoading(true);
    try {
      const apiMessages = history.map((m) => ({
        role: m.role,
        content: m.isVoice ? `[🎤] ${m.content}` : m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "خطأ" }));
        throw new Error(error);
      }
      if (!response.body) throw new Error("No body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n").filter((l) => l.startsWith("data: "))) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
            assistantContent += delta;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantContent };
              return updated;
            });
          } catch {}
        }
      }
    } catch (err) {
      const errText = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${errText}` }]);
    } finally {
      setLoading(false);
    }
  }

  function toggleMic() {
    if (isListening) stopListening();
    else startListening();
  }

  return (
    <div className="flex flex-col bg-neutral" style={{ height: "calc(100vh - 64px)" }} dir={isRTL ? "rtl" : "ltr"}>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 no-scrollbar">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Bot size={30} className="text-primary" />
              </div>
              <p className="font-extrabold text-gray-900 text-lg">{tx(t.training.welcome, lang)}</p>
              <p className="text-muted text-sm mt-2 leading-relaxed max-w-sm mx-auto">
                {tx(t.training.welcomeSub, lang)}
              </p>

              {/* Hint chips */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {supported && (
                  <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-xl px-4 py-2.5 text-xs text-primary font-semibold">
                    <Mic size={13} />
                    {isRTL ? "جرّب وضع الصوت — تحدّث بصوت عالٍ" : "Try voice mode — speak aloud"}
                  </div>
                )}
                <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-muted font-semibold">
                  <Paperclip size={13} />
                  {isRTL ? "ارفع سيرتك الذاتية للتدريب عليها" : "Upload your CV to practise with it"}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {STARTERS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className={`text-sm text-primary font-medium bg-primary/5 rounded-xl px-4 py-3 border border-primary/15 transition active:scale-95 hover:bg-primary/10 ${isRTL ? "text-right" : "text-left"}`}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className="space-y-2">
              {msg.fileUrl ? (
                <FileCard msg={msg} isRTL={isRTL} />
              ) : (
                <ChatMessage role={msg.role} content={msg.content} />
              )}
              {msg.role === "user" && msg.isVoice && msg.meta && (
                <div className={`flex ${isRTL ? "justify-end" : "justify-start"} ${isRTL ? "pr-2" : "pl-2"}`}>
                  <ConfidenceBadge meta={msg.meta} isRTL={isRTL} />
                </div>
              )}
            </div>
          ))}

          {loading && messages[messages.length - 1]?.role === "user" && (
            <ChatMessage role="assistant" content="" loading />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="px-5 md:px-8 py-4 bg-surface border-t border-border shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">

          {/* Voice mode toggle */}
          {supported && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setVoiceMode((v) => !v); if (isListening) stopListening(); }}
                className={`flex items-center gap-2 text-xs font-bold rounded-full px-3 py-1.5 border transition ${
                  voiceMode
                    ? "bg-primary text-white border-primary"
                    : "bg-neutral border-border text-muted hover:border-primary hover:text-primary"
                }`}>
                {voiceMode ? <Volume2 size={12} /> : <Mic size={12} />}
                {voiceMode
                  ? (isRTL ? "وضع الصوت مفعّل" : "Voice mode ON")
                  : (isRTL ? "تفعيل وضع الصوت" : "Enable voice mode")}
              </button>
              {voiceMode && (
                <p className="text-[11px] text-muted">
                  {isRTL ? "اضغط على الميكروفون وتحدث، سيرسل تلقائياً عند توقفك" : "Press mic and speak — auto-sends when you pause"}
                </p>
              )}
            </div>
          )}

          {/* Input row */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2 items-center">

            {/* Mic button — shown in voice mode */}
            {voiceMode && supported && (
              <button
                type="button"
                onClick={toggleMic}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isListening
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                    : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                }`}>
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-xl bg-red-500 animate-ping opacity-30" />
                    <span className="absolute inset-[-4px] rounded-xl border-2 border-red-400 animate-pulse opacity-60" />
                  </>
                )}
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}

            {/* Paperclip — file upload */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowFilePicker((v) => !v)}
                disabled={loading}
                className="w-11 h-11 rounded-xl border border-border bg-surface text-muted flex items-center justify-center hover:text-primary hover:border-primary transition disabled:opacity-40">
                <Paperclip size={18} />
              </button>

              {showFilePicker && (
                <div className={`absolute bottom-14 ${isRTL ? "right-0" : "left-0"} bg-surface border border-border rounded-2xl shadow-lg p-2 w-44 z-20`}>
                  <button
                    type="button"
                    onClick={() => { setShowDocUpload(true); setShowFilePicker(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral text-sm font-medium text-gray-900 transition">
                    <FileText size={15} className="text-primary shrink-0" />
                    {isRTL ? "PDF / مستند" : "PDF / Doc"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowImgUpload(true); setShowFilePicker(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral text-sm font-medium text-gray-900 transition">
                    <ImageIcon size={15} className="text-secondary shrink-0" />
                    {isRTL ? "صورة" : "Image"}
                  </button>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? (isRTL ? "جاري الاستماع..." : "Listening...")
                  : tx(t.training.placeholder, lang)
              }
              disabled={loading || isListening}
              dir={isRTL ? "rtl" : "ltr"}
              className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 transition ${
                isListening
                  ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "border-border bg-neutral text-gray-900"
              }`}
            />

            <button type="submit" disabled={!input.trim() || loading || isListening}
              className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 transition active:scale-95 shrink-0">
              <SendHorizonal size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* File upload modals */}
      {showDocUpload && (
        <DocumentUpload
          onClose={() => setShowDocUpload(false)}
          onSuccess={handleFileUploaded}
        />
      )}
      {showImgUpload && (
        <ImageUpload
          onClose={() => setShowImgUpload(false)}
          onSuccess={handleFileUploaded}
        />
      )}

      {/* Close picker on outside click */}
      {showFilePicker && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilePicker(false)} />
      )}
    </div>
  );
}
