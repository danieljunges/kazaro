import Link from "next/link";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  await requireAdmin("/admin");
  const supabase = await getSupabaseServerClient();

  const [{ count: pendingServices }, { count: users }, { count: bookings }] = await Promise.all([
    supabase
      .from("pro_services")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      <div className="dash-topbar">
        <div>
          <div className="dt-title">Admin</div>
          <div className="dt-sub">Aprovação, usuários e relatórios</div>
        </div>
        <div className="dt-right">
          <Link href="/admin/servicos" className="btn-cta" style={{ textDecoration: "none" }}>
            Revisar serviços →
          </Link>
        </div>
      </div>

      <div className="dash-content">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill pill-warn">pendentes</span>
            </div>
            <div className="kpi-val">{pendingServices ?? 0}</div>
            <div className="kpi-label">Serviços para aprovar</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill pill-up">base</span>
            </div>
            <div className="kpi-val">{users ?? 0}</div>
            <div className="kpi-label">Usuários</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill pill-up">tudo</span>
            </div>
            <div className="kpi-val">{bookings ?? 0}</div>
            <div className="kpi-label">Agendamentos</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill pill-up">atalhos</span>
            </div>
            <div className="kpi-label" style={{ marginTop: 6 }}>
              <Link className="dc-link" href="/admin/usuarios">
                Gerenciar usuários →
              </Link>
              <br />
              <Link className="dc-link" href="/admin/agendamentos">
                Ver agendamentos →
              </Link>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dc-head">Checklist rápido</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink60)", lineHeight: 1.8, fontSize: 14 }}>
            <li>Aprovar serviços pendentes para aparecerem no perfil público.</li>
            <li>Promover usuários para prestador ou admin quando necessário.</li>
            <li>Auditar agendamentos e ajustar status em casos de suporte.</li>
          </ul>
        </div>
      </div>
    </>
  );
}

