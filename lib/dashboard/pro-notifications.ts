import { formatBookingWhenPtBR } from "@/lib/booking/format-scheduled";
import type { ConversationDashboardRow } from "@/lib/supabase/messages";
import { fetchConversationsForDashboard } from "@/lib/supabase/messages";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { IncomingBookingRow } from "@/lib/supabase/bookings";

export type DashboardNotifItem = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  /** Ordenação (mais recente primeiro). */
  atMs: number;
};

function atFromBooking(b: Pick<IncomingBookingRow, "created_at" | "scheduled_at">): number {
  const raw = b.created_at ?? b.scheduled_at;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Monta a lista a partir dos dados já carregados na visão geral (sem queries extras). */
export function buildDashboardNotificationsFromOverview(
  incomingBookings: IncomingBookingRow[],
  conversations: ConversationDashboardRow[],
  pendingServiceCount: number,
): DashboardNotifItem[] {
  const items: DashboardNotifItem[] = [];

  for (const b of incomingBookings) {
    if (b.status !== "pending") continue;
    const when = formatBookingWhenPtBR(b.scheduled_at);
    const svc = b.service_name_snapshot?.trim() || "Serviço a combinar";
    items.push({
      key: `booking-${b.id}`,
      title: "Novo pedido de agendamento",
      subtitle: `${b.client_name_snapshot} · ${svc} · ${when}`,
      href: `/dashboard/pedidos/${b.id}`,
      atMs: atFromBooking(b),
    });
  }

  for (const c of conversations) {
    if (!c.awaitingMyReply) continue;
    const name = c.other_name?.trim() || "Cliente";
    const prev = c.last_preview?.trim() || "Nova mensagem na conversa";
    items.push({
      key: `msg-${c.id}`,
      title: `Responder ${name}`,
      subtitle: prev.length > 120 ? `${prev.slice(0, 120)}…` : prev,
      href: `/dashboard/mensagens/${c.id}`,
      atMs: new Date(c.last_message_at).getTime() || 0,
    });
  }

  if (pendingServiceCount > 0) {
    items.push({
      key: "services-pending",
      title:
        pendingServiceCount === 1
          ? "1 serviço em análise"
          : `${pendingServiceCount} serviços em análise`,
      subtitle: "Aguardando moderação para aparecer na busca",
      href: "/dashboard/servicos",
      atMs: 0,
    });
  }

  items.sort((a, b) => b.atMs - a.atMs);
  return items.slice(0, 30);
}

/** Para páginas que não carregam a visão geral inteira (ex.: detalhe do pedido). */
export async function fetchProDashboardNotificationSlices(
  professionalId: string,
): Promise<{
  pendingBookings: IncomingBookingRow[];
  conversations: ConversationDashboardRow[];
  pendingServiceCount: number;
}> {
  const supabase = await getSupabaseServerClient();
  const [bookRes, conversations, svcRes] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, scheduled_at, status, client_id, client_name_snapshot, client_email_snapshot, service_name_snapshot, client_note, client_location_snapshot, service_started_at, service_price_cents_snapshot, final_price_cents, created_at, confirmed_at, completed_at, completion_photo_url, archived_at",
      )
      .eq("professional_id", professionalId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(25),
    fetchConversationsForDashboard(professionalId, 30),
    supabase
      .from("pro_services")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", professionalId)
      .eq("status", "pending"),
  ]);

  const pendingBookings = (bookRes.data ?? []) as IncomingBookingRow[];
  const pendingServiceCount = svcRes.count ?? 0;

  return { pendingBookings, conversations, pendingServiceCount };
}

export async function fetchProDashboardNotifications(
  professionalId: string,
): Promise<DashboardNotifItem[]> {
  const slice = await fetchProDashboardNotificationSlices(professionalId);
  return buildDashboardNotificationsFromOverview(
    slice.pendingBookings,
    slice.conversations,
    slice.pendingServiceCount,
  );
}
