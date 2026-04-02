import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchEarningsThisMonth(professionalId: string): Promise<{
  totalCents: number;
  completedCount: number;
}> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const startIso = start.toISOString();

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("final_price_cents, service_price_cents_snapshot, status, scheduled_at")
      .eq("professional_id", professionalId)
      .eq("status", "completed")
      .gte("scheduled_at", startIso)
      .limit(500);

    if (error || !data) return { totalCents: 0, completedCount: 0 };
    let total = 0;
    let count = 0;
    for (const r of data as any[]) {
      const v = (r.final_price_cents ?? r.service_price_cents_snapshot) as number | null | undefined;
      if (typeof v === "number" && v > 0) total += v;
      count += 1;
    }
    return { totalCents: total, completedCount: count };
  } catch {
    return { totalCents: 0, completedCount: 0 };
  }
}

