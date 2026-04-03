import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchSupportMessages, fetchSupportTicketForUser } from "@/lib/supabase/support";
import { addUserSupportMessage, closeMySupportTicket } from "../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> };

function fmt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function DashboardSuporteTicketPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(`/dashboard/suporte/${id}`)}`);

  const ticket = await fetchSupportTicketForUser(id, user.id);
  if (!ticket) notFound();

  const messages = await fetchSupportMessages(id);
  const open = ticket.status === "open";

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard/suporte" backLabel="← Suporte" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 720 }}>
          <div className="dc-head" style={{ marginBottom: 12 }}>
            {ticket.subject}
            <Link href="/dashboard/suporte" className="dc-link">
              ← Lista
            </Link>
          </div>
          <p className="sec-sub" style={{ margin: "0 0 16px" }}>
            {open ? "Chamado aberto — a equipe pode responder a qualquer momento." : "Este chamado está encerrado."}
          </p>

          {sp.erro ? (
            <p className="auth-banner auth-banner--err" style={{ marginBottom: 16 }}>
              Não foi possível enviar. Tente de novo.
            </p>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: m.author_role === "admin" ? "var(--cream)" : "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="sec-sub" style={{ margin: "0 0 6px", fontSize: 12 }}>
                  {m.author_role === "admin" ? "Equipe Kazaro" : "Você"} · {fmt(m.created_at)}
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{m.body}</div>
              </div>
            ))}
          </div>

          {open ? (
            <>
              <form action={addUserSupportMessage} className="auth-form" style={{ marginBottom: 16 }}>
                <input type="hidden" name="ticket_id" value={id} />
                <label className="auth-field">
                  <span className="auth-label">Nova mensagem</span>
                  <textarea
                    className="auth-input"
                    name="body"
                    required
                    maxLength={8000}
                    rows={4}
                    placeholder="Escreva sua mensagem…"
                    style={{ resize: "vertical", minHeight: 100 }}
                  />
                </label>
                <button type="submit" className="btn-cta">
                  Enviar
                </button>
              </form>
              <form action={closeMySupportTicket}>
                <input type="hidden" name="ticket_id" value={id} />
                <button type="submit" className="btn-ghost" style={{ fontSize: 14 }}>
                  Encerrar chamado
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
