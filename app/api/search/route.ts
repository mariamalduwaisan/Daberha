import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/openrouter";
import { NextRequest, NextResponse } from "next/server";

const MATERIALS = [
  { id: "nbk-guide", title: "NBK Interview Guide", tags: ["nbk", "مقابلة", "بنك الكويت الوطني", "تحضير"], type: "pdf" },
  { id: "boubyan-culture", title: "ثقافة Boubyan", tags: ["بوبيان", "ثقافة", "فيديو", "إسلامي"], type: "video" },
  { id: "islamic-banking", title: "أساسيات الخدمات المصرفية الإسلامية", tags: ["إسلامي", "مصرفية", "أساسيات"], type: "pdf" },
  { id: "hard-questions", title: "التعامل مع الأسئلة الصعبة", tags: ["أسئلة", "صعبة", "سلوكية"], type: "video" },
  { id: "body-language", title: "أسرار لغة الجسد في المقابلات", tags: ["لغة الجسد", "مهارات", "مقابلة"], type: "article" },
  { id: "kfh-tests", title: "نماذج الاختبارات الفنية لـ KFH", tags: ["كفه", "بيت التمويل", "اختبار", "فني"], type: "pdf" },
];

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q") ?? "";
  if (!query) return NextResponse.json({ results: [] });

  await supabase.from("user_activity").insert({
    user_id: user.id,
    activity_type: "search",
    resource_id: query,
  });

  try {
    const prompt = `المستخدم بحث عن: "${query}"
من هذه المواد، أي منها يطابق أكثر؟ أعطِ IDs فقط كـ JSON array بدون نص إضافي:
${MATERIALS.map((m) => `- ${m.id}: ${m.title} (${m.tags.join(", ")})`).join("\n")}
مثال الإجابة: ["id1", "id2"]`;

    const raw = await generateContent(prompt);
    const match = raw.match(/\[[\s\S]*?\]/);
    const matchedIds: string[] = match ? JSON.parse(match[0]) : [];
    const results = MATERIALS.filter((m) => matchedIds.includes(m.id));

    if (!results.length) {
      const fallback = MATERIALS.filter((m) =>
        m.tags.some((t) => query.includes(t) || t.includes(query))
      );
      return NextResponse.json({
        results: fallback,
        suggestion: fallback.length
          ? undefined
          : "لم نجد نتائج مطابقة. جرّب: NBK، بوبيان، أسئلة سلوكية",
      });
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "search_error" });
  }
}
