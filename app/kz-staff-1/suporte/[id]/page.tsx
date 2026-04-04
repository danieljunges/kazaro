import Link from "next/link";
import { notFound } from "next/navigation";
import { adminPath } from "@/lib/admin/panel-path";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchSupportMessages, fetchSupportTicketByIdAdmin } from "@/lib/supabase/support";
import { adminCloseSupportTicket, adminReplySupportTicket } from "../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> };

function fmt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function AdminSuporteTicketPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const ticket = await fetchSupportTicketByIdAdmin(id);
  if (!ticket) notFound();

  const supabase = await getSupabaseServerClient();
  const { data: owner } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", ticket.user_id)
    .maybeSingle();

  const messages = await fetchSupportMessages(id);
  const ownerRow = owner as { email: string | null; full_name: string | null } | null;

  return (
    <div className="dash-content" style={{ padding: "24px 28px 48px" }}>
      <div style={{ marginBottom: 16 }}>
        <Link href={adminPath("/suporte")} className="dc-link">
          ← Todos os chamados
        </Link>
      </div>
      <div className="dt-title" style={{ marginBottom: 6 }}>
        {ticket.subject}
      </div>
      <p className="sec-sub" style={{ margin: "0 0 20px" }}>
        {ownerRow?.full_name ?? "-"} · {ownerRow?.email ?? "sem e-mail no perfil"} ·{" "}
        {ticket.status === "open" ? "Aberto" : "Encerrado"}
      </p>

      {sp.erro ? (
        <p className="auth-banner auth-banner--err" style={{ marginBottom: 16 }}>
          Verifique a mensagem e tente de novo.
        </p>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24, maxWidth: 720 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: 14,
              borderRadius: 12,
              background: m.author_role === "admin" ? "rgba(163, 230, 53, 0.12)" : "var(--cream)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="sec-sub" style={{ margin: "0 0 6px", fontSize: 12 }}>
              {m.author_role === "admin" ? "Admin" : "Usuário"} · {fmt(m.created_at)}
            </div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{m.body}</div>
          </div>
        ))}
      </div>

      <form action={adminReplySupportTicket} className="auth-form" style={{ maxWidth: 720, marginBottom: 16 }}>
        <input type="hidden" name="ticket_id" value={id} />
        <label className="auth-field">
          <span className="auth-label">Resposta (vai para o usuário e dispara e-mail se configurado)</span>
          <textarea
            className="auth-input"
            name="body"
            required
            maxLength={8000}
            rows={5}
            style={{ resize: "vertical", minHeight: 120 }}
          />
        </label>
        <button type="submit" className="btn-cta">
          Enviar resposta
        </button>
      </form>

      {ticket.status === "open" ? (
        <form action={adminCloseSupportTicket}>
          <input type="hidden" name="ticket_id" value={id} />
          <button type="submit" className="btn-ghost">
            Encerrar chamado
          </button>
        </form>
      ) : null}
    </div>
  );
}
