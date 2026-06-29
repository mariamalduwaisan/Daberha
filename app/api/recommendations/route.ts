import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/openrouter";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // LLM10: 10 recommendation refreshes per hour
  const allowed = await checkRateLimit(supabase, user.id, "recommendations", 10);
  if (!allowed) return NextResponse.json({ error: "تجاوزت الحد المسموح. حاول مجدداً بعد ساعة." }, { status: 429 });

  const { data: activity } = await supabase
    .from("user_activity")
    .select("activity_type, resource_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: dismissed } = await supabase
    .from("dismissed_recommendations")
    .select("recommendation_key")
    .eq("user_id", user.id);

  const dismissedKeys = (dismissed ?? []).map((d) => d.recommendation_key);

  // LLM01: sanitize DB values before injecting into prompt
  const activitySummary = (activity ?? [])
    .map((a) => {
      const type = String(a.activity_type ?? "").replace(/["\n\r<>]/g, "").slice(0, 30);
      const rid  = String(a.resource_id  ?? "").replace(/["\n\r<>]/g, "").slice(0, 30);
      return `${type}: ${rid}`;
    })
    .join(", ")
    .slice(0, 300) || "لا يوجد نشاط سابق";

  const prompt = `بناءً على نشاط المستخدم: <activity>${activitySummary}</activity>
اقترح 3 توصيات تعليمية محددة لمساعدته في التحضير لمقابلات القطاع المصرفي في الكويت.
أعطِ الإجابة كـ JSON فقط بهذا الشكل بدون أي نص إضافي:
[{"key": "unique_key", "title": "عنوان", "description": "وصف", "type": "plan|material|practice"}]`;

  try {
    const raw = await generateContent(prompt);
    const match = raw.match(/\[[\s\S]*?\]/);

    // A03: validate structure — only string fields, no nested objects
    let all: { key: string; title: string; description: string; type: string }[] = [];
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          all = parsed.filter(
            (r) =>
              r &&
              typeof r.key === "string" &&
              typeof r.title === "string" &&
              typeof r.description === "string" &&
              ["plan", "material", "practice"].includes(r.type)
          );
        }
      } catch {
        // ignore malformed LLM output
      }
    }

    const filtered = all.filter((r) => !dismissedKeys.includes(r.key));
    return NextResponse.json({ recommendations: filtered });
  } catch {
    return NextResponse.json({ recommendations: [] });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { key } = body;

  // A01: validate key is a plain string — reject objects, arrays, missing values
  if (!key || typeof key !== "string" || key.length > 100) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  await supabase.from("dismissed_recommendations").upsert(
    { user_id: user.id, recommendation_key: key },
    { onConflict: "user_id,recommendation_key", ignoreDuplicates: true }
  );

  return NextResponse.json({ success: true });
}
