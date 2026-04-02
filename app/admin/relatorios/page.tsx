import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminRelatoriosPage() {
  await requireAdmin("/admin/relatorios");
  const supabase = await getSupabaseServerClient();

  const [{ count: completed }, { count: pendingServices }] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("pro_services").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <>
      <div className="dash-topbar">
        <div>
          <div className="dt-title">Relatórios</div>
          <div className="dt-sub">KPIs e export virão na próxima etapa</div>
        </div>
      </div>
      <div className="dash-content">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill pill-up">concluídos</span>
            </div>
            <div className="kpi-val">{completed ?? 0}</div>
            <div className="kpi-label">Agendamentos concluídos</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill pill-warn">pendentes</span>
            </div>
            <div className="kpi-val">{pendingServices ?? 0}</div>
            <div className="kpi-label">Serviços pendentes</div>
          </div>
        </div>
        <div className="dash-card">
          <div className="dc-head">Próximos relatórios</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink60)", lineHeight: 1.8, fontSize: 14 }}>
            <li>Filtro por período (dia/semana/mês).</li>
            <li>Export CSV (usuários, serviços, agendamentos).</li>
            <li>Receita estimada por serviço e por prestador.</li>
          </ul>
        </div>
      </div>
    </>
  );
}

