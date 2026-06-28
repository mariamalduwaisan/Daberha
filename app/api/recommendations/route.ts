import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/openrouter";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: activity } = await supabase
    .from("user_activity")
    .select("activity_type, resource_id, metadata")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: dismissed } = await supabase
    .from("dismissed_recommendations")
    .select("recommendation_key")
    .eq("user_id", user.id);

  const dismissedKeys = (dismissed ?? []).map((d) => d.recommendation_key);
  const activitySummary =
    (activity ?? [])
      .map((a) => `${a.activity_type}: ${a.resource_id ?? ""}`)
      .join(", ") || "لا يوجد نشاط سابق";

  const prompt = `بناءً على نشاط المستخدم: ${activitySummary}
المحتوى المُخفى: ${dismissedKeys.join(", ") || "لا شيء"}
اقترح 3 توصيات تعليمية محددة لمساعدته في التحضير لمقابلات القطاع المصرفي في الكويت.
أعطِ الإجابة كـ JSON فقط بهذا الشكل بدون أي نص إضافي:
[{"key": "unique_key", "title": "عنوان", "description": "وصف", "type": "plan|material|practice"}]`;

  try {
    const raw = await generateContent(prompt);
    const match = raw.match(/\[[\s\S]*?\]/);
    const all = match ? JSON.parse(match[0]) : [];
    const filtered = all.filter(
      (r: { key: string }) => !dismissedKeys.includes(r.key)
    );
    return NextResponse.json({ recommendations: filtered });
  } catch {
    return NextResponse.json({ recommendations: [] });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  await supabase.from("dismissed_recommendations").upsert(
    { user_id: user.id, recommendation_key: key },
    { onConflict: "user_id,recommendation_key", ignoreDuplicates: true }
  );

  return NextResponse.json({ success: true });
}
