import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileMenu } from "@/components/admin/AdminMobileMenu";
import { requireAdmin } from "@/lib/admin/requireAdmin";

function safeAdminNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/admin")) return "/admin";
  return raw;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const nextPath = safeAdminNext(h.get("x-kz-pathname"));
  const { email } = await requireAdmin(nextPath);

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

