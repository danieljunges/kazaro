import Link from "next/link";
import { fetchAllSupportTicketsForAdmin } from "@/lib/supabase/support";

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

export default async function AdminSuportePage() {
  const tickets = await fetchAllSupportTicketsForAdmin();

  return (
    <div className="dash-content" style={{ padding: "24px 28px 48px" }}>
      <div className="dt-title" style={{ marginBottom: 8 }}>
        Suporte
      </div>
      <p className="sec-sub" style={{ margin: "0 0 20px", maxWidth: 640 }}>
        Chamados abertos pelos usuários. Respostas aparecem no painel deles e disparam e-mail quando o Resend está
        configurado.
      </p>

      {tickets.length === 0 ? (
        <p className="sec-sub" style={{ margin: 0 }}>
          Nenhum chamado ainda.
        </p>
      ) : (
        <div className="kz-table-scroll" style={{ maxWidth: 1100 }}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Assunto</th>
                <th>Usuário</th>
                <th>Status</th>
                <th>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/admin/suporte/${t.id}`} style={{ fontWeight: 600 }}>
                      {t.subject}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{t.owner_name ?? "—"}</div>
                    <div className="sec-sub" style={{ margin: 0, fontSize: 12 }}>
                      {t.owner_email ?? "—"}
                    </div>
                  </td>
                  <td>{t.status === "open" ? "Aberto" : "Encerrado"}</td>
                  <td className="sec-sub" style={{ fontSize: 13 }}>
                    {fmt(t.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
