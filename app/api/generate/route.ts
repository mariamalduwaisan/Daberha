import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/openrouter";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["cover_letter", "interview_answer", "self_intro"] as const;
type GenerateType = (typeof ALLOWED_TYPES)[number];

const TYPE_PROMPTS: Record<GenerateType, string> = {
  cover_letter:     "اكتب خطاب تقديم احترافي باللغة العربية للقطاع المصرفي الكويتي.",
  interview_answer: "صِغ إجابة مقابلة وظيفية احترافية باستخدام أسلوب STAR (الموقف، المهمة، الإجراء، النتيجة).",
  self_intro:       "اكتب تعريفاً ذاتياً قصيراً ومؤثراً للمقابلة المصرفية.",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // LLM10: 10 generations per hour
  const allowed = await checkRateLimit(supabase, user.id, "generate_content", 10);
  if (!allowed) return NextResponse.json({ error: "تجاوزت الحد المسموح. حاول مجدداً بعد ساعة." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const { prompt, type } = body;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  // A01: allowlist type — reject anything not in the known set
  const safeType: GenerateType | undefined =
    type && ALLOWED_TYPES.includes(type as GenerateType) ? (type as GenerateType) : undefined;

  // LLM06: cap prompt length to avoid runaway token consumption
  const trimmedPrompt = prompt.slice(0, 1000);

  const prefix = safeType ? `${TYPE_PROMPTS[safeType]}\n\nتفاصيل المستخدم: ` : "";
  const fullPrompt = `${prefix}${trimmedPrompt}`;

  try {
    const content = await generateContent(fullPrompt);

    await supabase.from("user_activity").insert({
      user_id: user.id,
      activity_type: "generate_content",
      // A09: never log the actual prompt content — only its length
      metadata: { type: safeType ?? "general", prompt_length: trimmedPrompt.length },
    });

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[generate] error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 500 });
  }
}
