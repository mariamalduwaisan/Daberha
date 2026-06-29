import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-backed rate limiter — counts activity rows in the last hour.
 * Returns false (blocked) when the user exceeds maxPerHour.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  activityType: string,
  maxPerHour: number
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("user_activity")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("activity_type", activityType)
    .gte("created_at", oneHourAgo);
  return (count ?? 0) < maxPerHour;
}
