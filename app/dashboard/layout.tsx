/**
 * Segmento /dashboard: transições e fundo coerentes entre visão geral (sidebar) e sub-rotas (CompactNav).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="kz-dashboard-route-root">{children}</div>;
}
