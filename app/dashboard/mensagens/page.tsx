import Link from "next/link";
import { redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyConversations } from "@/lib/supabase/messages";

function timeShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d);
}

export default async function DashboardMensagensPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/mensagens");

  const conv = await fetchMyConversations(user.id);

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 980 }}>
          <div className="dc-head" style={{ marginBottom: 12 }}>
            Caixa de mensagens
            <Link href="/dashboard" className="dc-link">
              ← Dashboard
            </Link>
          </div>

          {conv.length === 0 ? (
            <p className="sec-sub" style={{ margin: 0 }}>
              Você ainda não tem conversas. Abra um perfil e clique em “Mensagem” para iniciar.
            </p>
          ) : (
            <div className="kz-msg-shell">
              <aside className="kz-msg-list" aria-label="Conversas">
                {conv.map((c) => (
                  <Link key={c.id} href={`/dashboard/mensagens/${c.id}`} className="kz-msg-row">
                    <div className="kz-msg-ava" aria-hidden>
                      {(c.other_name?.trim()?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="kz-msg-name">{c.other_name ?? "Conversa"}</div>
                      <div className="kz-msg-preview">{c.last_preview ?? "—"}</div>
                    </div>
                    <span className="kz-msg-time">{timeShort(c.last_message_at)}</span>
                  </Link>
                ))}
              </aside>

              <div className="kz-msg-empty" aria-label="Selecione uma conversa">
                <div className="kz-msg-empty-title">Escolha uma conversa</div>
                <div className="sec-sub" style={{ margin: 0 }}>
                  Clique à esquerda para abrir o chat.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
