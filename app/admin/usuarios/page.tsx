import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { UserRolePicker } from "@/components/admin/UserRolePicker";

export default async function AdminUsuariosPage() {
  await requireAdmin("/admin/usuarios");
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <>
      <div className="dash-topbar">
        <div>
          <div className="dt-title">Usuários</div>
          <div className="dt-sub">Roles, controle e auditoria básica</div>
        </div>
      </div>
      <div className="dash-content">
        <div className="dash-card">
          <div className="dc-head">Lista</div>
          {!data?.length ? (
            <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14 }}>Sem usuários.</p>
          ) : (
            <div className="kz-table-scroll">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>ID</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((u: any) => (
                    <tr key={u.id}>
                      <td className="o-client">{u.full_name ?? "—"}</td>
                      <td style={{ fontSize: 12, fontFamily: "ui-monospace, monospace" }}>{String(u.id).slice(0, 8)}…</td>
                      <td style={{ fontWeight: 800 }}>{u.role}</td>
                      <td style={{ textAlign: "right" }}>
                        <UserRolePicker userId={u.id} role={u.role} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

