"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import { Bot, Sparkles, SendHorizonal } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const STARTER_QUESTIONS = [
  "ساعدني في التحضير لمقابلة NBK",
  "اسألني أسئلة سلوكية شائعة",
  "ما هي أساسيات الخدمات المصرفية الإسلامية؟",
  "كيف أجيب بأسلوب STAR؟",
];

export default function TrainingPage() {
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [sessionId,  setSessionId]  = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

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

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    if (sessionId) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("chat_messages").insert({ session_id: sessionId, user_id: user.id, role: "user", content });
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "خطأ غير معروف" }));
        throw new Error(error);
      }
      if (!response.body) throw new Error("No response body");

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
          await supabase.from("chat_messages").insert({ session_id: sessionId, user_id: user.id, role: "assistant", content: assistantContent });
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "عذراً، حدث خطأ. يرجى المحاولة مجدداً." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh)] bg-neutral">
      {/* Top bar */}
      <div className="px-5 md:px-8 pt-10 pb-4 bg-surface border-b border-border shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">التدريب</h1>
            <p className="text-muted text-xs">مقابلات تجريبية بالذكاء الاصطناعي</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary rounded-full px-3 py-1.5">
            <Sparkles size={11} />ذكاء اصطناعي
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5 no-scrollbar">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Bot size={30} className="text-primary" />
              </div>
              <p className="font-extrabold text-gray-900 text-lg">مرحباً! أنا مساعدك الذكي</p>
              <p className="text-muted text-sm mt-2 leading-relaxed max-w-sm mx-auto">
                يمكنني مساعدتك في التحضير للمقابلات المصرفية. ابدأ بسؤال أو اختر من الأسئلة أدناه.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {STARTER_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-right text-sm text-primary font-medium bg-primary/5 rounded-xl px-4 py-3 border border-primary/15 transition active:scale-95 hover:bg-primary/10">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}

          {loading && messages[messages.length - 1]?.role === "user" && (
            <ChatMessage role="assistant" content="" loading />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-5 md:px-8 py-4 bg-surface border-t border-border shrink-0 mb-16 md:mb-0">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="max-w-3xl mx-auto flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-neutral text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition"
          />
          <button type="submit" disabled={!input.trim() || loading} aria-label="إرسال"
            className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 transition active:scale-95 shrink-0">
            <SendHorizonal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
