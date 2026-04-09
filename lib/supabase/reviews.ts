import { getSupabaseServerClient } from "@/lib/supabase/server";

export type BookingReviewPublic = {
  id: string;
  stars: number;
  comment: string | null;
  author_public_name: string;
  created_at: string;
};

export async function fetchPublicReviewsForProfessional(professionalId: string): Promise<BookingReviewPublic[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("booking_reviews")
      .select("id, stars, comment, author_public_name, created_at")
      .eq("professional_id", professionalId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return data as BookingReviewPublic[];
  } catch {
    return [];
  }
}

export async function fetchReviewedBookingIdsForClient(clientId: string): Promise<Set<string>> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.from("booking_reviews").select("booking_id").eq("client_id", clientId);
    return new Set((data ?? []).map((r: { booking_id: string }) => r.booking_id));
  } catch {
    return new Set();
  }
}
