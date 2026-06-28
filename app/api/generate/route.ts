import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/openrouter";
import { NextRequest, NextResponse } from "next/server";

const TYPE_PROMPTS: Record<string, string> = {
  cover_letter: "اكتب خطاب تقديم احترافي باللغة العربية للقطاع المصرفي الكويتي.",
  interview_answer: "صِغ إجابة مقابلة وظيفية احترافية باستخدام أسلوب STAR (الموقف، المهمة، الإجراء، النتيجة).",
  self_intro: "اكتب تعريفاً ذاتياً قصيراً ومؤثراً للمقابلة المصرفية.",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, type } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  const prefix = type && TYPE_PROMPTS[type] ? `${TYPE_PROMPTS[type]}\n\nتفاصيل المستخدم: ` : "";
  const fullPrompt = `${prefix}${prompt}`;

  try {
    const content = await generateContent(fullPrompt);

    await supabase.from("user_activity").insert({
      user_id: user.id,
      activity_type: "generate_content",
      metadata: { type: type ?? "general", prompt_length: prompt.length },
    });

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
