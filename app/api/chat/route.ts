import { createClient } from "@/lib/supabase/server";
import { streamChat } from "@/lib/openrouter";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // LLM10: rate limit — 20 chat messages per hour
  const allowed = await checkRateLimit(supabase, user.id, "chat_message", 20);
  if (!allowed) return NextResponse.json({ error: "تجاوزت الحد المسموح. حاول مجدداً بعد ساعة." }, { status: 429 });

  const body = await req.json();
  const { messages, sessionId } = body;
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  // A01: verify session ownership before trusting sessionId
  if (sessionId) {
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Track usage for rate limiting
  await supabase.from("user_activity").insert({
    user_id: user.id,
    activity_type: "chat_message",
    resource_id: sessionId ?? null,
  });

  try {
    const stream = await streamChat(messages);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Service unavailable";
    console.error("[chat] streamChat error:", msg);
    // Return the real error so the UI can display what's actually wrong
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
