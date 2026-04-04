import { startEndExclusiveUtcForSaoPauloDay } from "@/lib/datetime/sao-paulo-calendar";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type BookingServiceOption = { id: string; name: string };

export type BookingPageContext = {
  professionalId: string | null;
  slug: string;
  displayName: string;
  services: BookingServiceOption[];
  isBookable: boolean;
  unavailableReason?: string;
};

export async function fetchServicePriceCents(serviceId: string): Promise<number | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.from("pro_services").select("price_cents").eq("id", serviceId).maybeSingle();
    if (error) return null;
    const v = data?.price_cents as number | null | undefined;
    return typeof v === "number" ? v : null;
  } catch {
    return null;
  }
}

export async function fetchBookingPageContext(slug: string): Promise<BookingPageContext | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: pro, error: pErr } = await supabase
      .from("professionals")
      .select("id, slug, display_name")
      .eq("slug", slug)
      .maybeSingle();

    if (pErr || !pro?.id) return null;

    const { data: svc } = await supabase
      .from("pro_services")
      .select("id, name")
      .eq("professional_id", pro.id)
      .order("sort_order", { ascending: true });

    return {
      professionalId: pro.id as string,
      slug: pro.slug as string,
      displayName: pro.display_name as string,
      services: ((svc ?? []) as { id: string; name: string }[]).map((s) => ({ id: s.id, name: s.name })),
      isBookable: true,
    };
  } catch {
    return null;
  }
}

export type IncomingBookingRow = {
  id: string;
  scheduled_at: string;
  created_at?: string;
  status: string;
  client_name_snapshot: string;
  client_email_snapshot: string | null;
  service_name_snapshot: string | null;
  client_note: string | null;
  client_location_snapshot?: string | null;
  client_id: string;
  service_started_at?: string | null;
  service_price_cents_snapshot?: number | null;
  final_price_cents?: number | null;
  confirmed_at?: string | null;
  completed_at?: string | null;
  completion_photo_url?: string | null;
  archived_at?: string | null;
};

export async function fetchIncomingBookingsForPro(
  professionalId: string,
  limit = 20,
): Promise<IncomingBookingRow[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, scheduled_at, created_at, status, client_id, client_name_snapshot, client_email_snapshot, service_name_snapshot, client_note, client_location_snapshot, service_started_at, service_price_cents_snapshot, final_price_cents, confirmed_at, completed_at, completion_photo_url",
      )
      .eq("professional_id", professionalId)
      .order("scheduled_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as IncomingBookingRow[];
  } catch {
    return [];
  }
}

/** Agendamentos do prestador cujo horário combinado cai em um dia civil (America/Sao_Paulo), do mais cedo ao mais tarde. */
export async function fetchIncomingBookingsForProOnCalendarDay(
  professionalId: string,
  yyyyMmDd: string,
): Promise<IncomingBookingRow[]> {
  const { startIso, endExclusiveIso } = startEndExclusiveUtcForSaoPauloDay(yyyyMmDd);
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, scheduled_at, created_at, status, client_id, client_name_snapshot, client_email_snapshot, service_name_snapshot, client_note, client_location_snapshot, service_started_at, service_price_cents_snapshot, final_price_cents, confirmed_at, completed_at, completion_photo_url",
      )
      .eq("professional_id", professionalId)
      .gte("scheduled_at", startIso)
      .lt("scheduled_at", endExclusiveIso)
      .order("scheduled_at", { ascending: true });

    if (error || !data) return [];
    return data as IncomingBookingRow[];
  } catch {
    return [];
  }
}

export type MyBookingRow = {
  id: string;
  scheduled_at: string;
  status: string;
  service_name_snapshot: string | null;
  client_note: string | null;
  service_started_at: string | null;
  completion_photo_url?: string | null;
  service_price_cents_snapshot?: number | null;
  payment_status?: string | null;
  professionals: { id: string; display_name: string; slug: string } | null;
};

export async function fetchMyBookingsAsClient(userId: string, limit = 15): Promise<MyBookingRow[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        scheduled_at,
        status,
        service_name_snapshot,
        client_note,
        service_started_at,
        completion_photo_url,
        service_price_cents_snapshot,
        payment_status,
        professionals (
          id,
          display_name,
          slug
        )
      `,
      )
      .eq("client_id", userId)
      .order("scheduled_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as unknown as MyBookingRow[];
  } catch {
    return [];
  }
}

export async function countPendingIncomingBookings(professionalId: string): Promise<number> {
  try {
    const supabase = await getSupabaseServerClient();
    const { count, error } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("professional_id", professionalId)
      .eq("status", "pending");

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Pedidos que ainda exigem ação ou estão em andamento (visão KPI). */
export async function countActiveIncomingBookings(professionalId: string): Promise<number> {
  try {
    const supabase = await getSupabaseServerClient();
    const { count, error } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("professional_id", professionalId)
      .in("status", ["pending", "confirmed", "in_progress"]);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function fetchIncomingBookingDetailForPro(
  professionalId: string,
  bookingId: string,
): Promise<IncomingBookingRow | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, scheduled_at, created_at, status, client_id, client_name_snapshot, client_email_snapshot, service_name_snapshot, client_note, client_location_snapshot, service_started_at, service_price_cents_snapshot, final_price_cents, confirmed_at, completed_at, completion_photo_url, archived_at",
      )
      .eq("id", bookingId)
      .eq("professional_id", professionalId)
      .maybeSingle();

    if (error || !data) return null;
    return data as IncomingBookingRow;
  } catch {
    return null;
  }
}
