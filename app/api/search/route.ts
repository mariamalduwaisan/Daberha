import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/openrouter";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

const MATERIALS = [
  { id: "nbk-guide",       title: "NBK Interview Guide",                    tags: ["nbk", "مقابلة", "بنك الكويت الوطني", "تحضير"], type: "pdf" },
  { id: "boubyan-culture", title: "ثقافة Boubyan",                          tags: ["بوبيان", "ثقافة", "فيديو", "إسلامي"],          type: "video" },
  { id: "islamic-banking", title: "أساسيات الخدمات المصرفية الإسلامية",    tags: ["إسلامي", "مصرفية", "أساسيات"],                 type: "pdf" },
  { id: "hard-questions",  title: "التعامل مع الأسئلة الصعبة",              tags: ["أسئلة", "صعبة", "سلوكية"],                     type: "video" },
  { id: "body-language",   title: "أسرار لغة الجسد في المقابلات",           tags: ["لغة الجسد", "مهارات", "مقابلة"],               type: "article" },
  { id: "kfh-tests",       title: "نماذج الاختبارات الفنية لـ KFH",         tags: ["كفه", "بيت التمويل", "اختبار", "فني"],          type: "pdf" },
];

const VALID_MATERIAL_IDS = new Set(MATERIALS.map((m) => m.id));

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // LLM10: 30 searches per hour per user
  const allowed = await checkRateLimit(supabase, user.id, "search", 30);
  if (!allowed) return NextResponse.json({ error: "تجاوزت الحد المسموح. حاول مجدداً بعد ساعة." }, { status: 429 });

  const rawQuery = req.nextUrl.searchParams.get("q") ?? "";
  if (!rawQuery) return NextResponse.json({ results: [] });

  // LLM01: sanitize before injecting into prompt — strip quotes, newlines, limit length
  const query = rawQuery.replace(/["\n\r\\]/g, " ").trim().slice(0, 100);
  if (!query) return NextResponse.json({ results: [] });

  await supabase.from("user_activity").insert({
    user_id: user.id,
    activity_type: "search",
    resource_id: query.slice(0, 50),
  });

  try {
    const prompt = `المستخدم بحث عن: <query>${query}</query>
من هذه المواد، أي منها يطابق أكثر؟ أعطِ IDs فقط كـ JSON array بدون نص إضافي:
${MATERIALS.map((m) => `- ${m.id}: ${m.title} (${m.tags.join(", ")})`).join("\n")}
مثال الإجابة: ["id1", "id2"]`;

    const raw = await generateContent(prompt);
    const match = raw.match(/\[[\s\S]*?\]/);

    // A03: only accept known IDs — reject any LLM hallucination or injection attempt
    let matchedIds: string[] = [];
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          matchedIds = parsed.filter(
            (id): id is string => typeof id === "string" && VALID_MATERIAL_IDS.has(id)
          );
        }
      } catch {
        // malformed JSON — fall through to keyword fallback
      }
    }

    const results = MATERIALS.filter((m) => matchedIds.includes(m.id));
    if (!results.length) {
      const fallback = MATERIALS.filter((m) =>
        m.tags.some((t) => query.includes(t) || t.includes(query))
      );
      return NextResponse.json({
        results: fallback,
        suggestion: fallback.length ? undefined : "لم نجد نتائج مطابقة. جرّب: NBK، بوبيان، أسئلة سلوكية",
      });
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "search_error" });
  }
}
