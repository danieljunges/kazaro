import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileMenu } from "@/components/admin/AdminMobileMenu";
import { getAdminPanelBasePath, safeAdminNextPath } from "@/lib/admin/panel-path";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const nextPath = safeAdminNextPath(h.get("x-kz-pathname"));
  const { email } = await requireAdmin(nextPath);
  const adminBase = getAdminPanelBasePath();

  return (
    <div className="home-editorial admin-app">
      <div className="dash">
        <AdminSidebar email={email} adminBase={adminBase} />
        <div className="dash-body">
          <div className="admin-mobile-bar">
            <AdminMobileMenu adminBase={adminBase} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

