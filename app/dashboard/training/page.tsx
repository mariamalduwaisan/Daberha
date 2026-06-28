"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ChatMessage from "@/components/ChatMessage";

type Message = { role: "user" | "assistant"; content: string };

const STARTER_QUESTIONS = [
  "ساعدني في التحضير لمقابلة NBK",
  "اسألني أسئلة سلوكية شائعة",
  "ما هي أساسيات الخدمات المصرفية الإسلامية؟",
];

export default function TrainingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function initSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title: "جلسة تدريبية" })
        .select()
        .single();
      if (data) setSessionId(data.id);
    }
    initSession();
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          user_id: user.id,
          role: "user",
          content,
        });
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? "";
            assistantContent += delta;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantContent,
              };
              return updated;
            });
          } catch {}
        }
      }

      if (sessionId && assistantContent) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            user_id: user.id,
            role: "assistant",
            content: assistantContent,
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "عذراً، حدث خطأ. يرجى المحاولة مجدداً." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage();
  }

  return (
    <div className="flex flex-col h-screen bg-neutral">
      {/* Top bar */}
      <div className="px-5 pt-12 pb-4 bg-surface shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">التدريب</h1>
            <p className="text-muted text-xs">مقابلات تجريبية بالذكاء الاصطناعي</p>
          </div>
          <span className="text-xs font-semibold bg-secondary/10 text-secondary rounded-full px-2 py-1">
            ذكاء اصطناعي
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center pt-8">
            <p className="text-4xl mb-3">🤖</p>
            <p className="font-bold text-gray-900">مرحباً! أنا مساعدك الذكي</p>
            <p className="text-muted text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              يمكنني مساعدتك في التحضير للمقابلات المصرفية.
              <br />
              ابدأ بإخباري عن الوظيفة التي تتقدم لها.
            </p>
            <div className="mt-5 space-y-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="block w-full text-right text-sm text-primary font-medium bg-primary/5 rounded-xl px-4 py-2.5 border border-primary/20 transition hover:bg-primary/10"
                >
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

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-5 py-4 bg-surface border-t border-border shrink-0 mb-20"
      >
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-neutral text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl bg-secondary text-white flex items-center justify-center text-xl disabled:opacity-40 transition active:scale-95"
          >
            ←
          </button>
        </div>
      </form>
    </div>
  );
}
