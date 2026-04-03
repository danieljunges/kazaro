import Link from "next/link";
import { redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMySupportTickets } from "@/lib/supabase/support";
import { createSupportTicket } from "./actions";

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

export default async function DashboardSuportePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/suporte");

  const tickets = await fetchMySupportTickets(user.id);

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 720 }}>
          <div className="dc-head" style={{ marginBottom: 12 }}>
            Suporte
            <Link href="/dashboard" className="dc-link">
              ← Dashboard
            </Link>
          </div>
          <p className="sec-sub" style={{ margin: "0 0 20px" }}>
            Abra um chamado para falar com a equipe Kazaro. Você recebe resposta por aqui e, quando o time responder, também
            por e-mail (se o envio estiver configurado).
          </p>

          {sp.erro ? (
            <p className="auth-banner auth-banner--err" style={{ marginBottom: 16 }}>
              Não foi possível concluir a ação. Confira os campos e tente de novo.
            </p>
          ) : null}

          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Novo chamado</h2>
          <form action={createSupportTicket} className="auth-form" style={{ marginBottom: 28 }}>
            <label className="auth-field">
              <span className="auth-label">Assunto</span>
              <input className="auth-input" name="subject" required maxLength={200} placeholder="Ex.: problema com agendamento" />
            </label>
            <label className="auth-field">
              <span className="auth-label">Mensagem</span>
              <textarea
                className="auth-input"
                name="body"
                required
                maxLength={8000}
                rows={5}
                placeholder="Descreva o que aconteceu com o máximo de detalhes possível."
                style={{ resize: "vertical", minHeight: 120 }}
              />
            </label>
            <button type="submit" className="btn-cta">
              Enviar chamado
            </button>
          </form>

          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Seus chamados</h2>
          {tickets.length === 0 ? (
            <p className="sec-sub" style={{ margin: 0 }}>
              Você ainda não tem chamados.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {tickets.map((t) => (
                <li key={t.id} style={{ borderBottom: "1px solid var(--border)", padding: "12px 0" }}>
                  <Link href={`/dashboard/suporte/${t.id}`} style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {t.subject}
                  </Link>
                  <div className="sec-sub" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    {t.status === "open" ? "Aberto" : "Encerrado"} · {fmt(t.updated_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
