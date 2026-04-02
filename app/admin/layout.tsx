import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileMenu } from "@/components/admin/AdminMobileMenu";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin("/admin");

  return (
    <div className="home-editorial admin-app">
      <div className="dash">
        <AdminSidebar email={email} />
        <div className="dash-body">
          <div className="admin-mobile-bar">
            <AdminMobileMenu />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

