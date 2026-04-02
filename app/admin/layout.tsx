import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin("/admin");

  return (
    <div className="home-editorial">
      <div className="dash">
        <AdminSidebar email={email} />
        <div className="dash-body">{children}</div>
      </div>
    </div>
  );
}

