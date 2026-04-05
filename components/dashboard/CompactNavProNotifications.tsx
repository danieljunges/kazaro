"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardNotificationsBell } from "@/components/dashboard/DashboardNotificationsBell";
import type { DashboardNotifItem } from "@/lib/dashboard/pro-notifications";

const DASH = /^\/dashboard(\/|$)/;

/**
 * Sino de notificações nas rotas /dashboard/* com CompactNav (ex.: Configurações, Mensagens no telemóvel).
 * Na visão geral o sino já vem da topbar do shell com sidebar.
 */
export function CompactNavProNotifications() {
  const pathname = usePathname() ?? "";
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<DashboardNotifItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!DASH.test(pathname)) {
      setReady(false);
      setVisible(false);
      setItems([]);
      return;
    }

    let cancelled = false;
    setReady(false);

    fetch("/api/dashboard/notifications", { credentials: "same-origin" })
      .then(async (r) => {
        const data = (await r.json()) as { items?: DashboardNotifItem[]; visible?: boolean };
        if (cancelled) return;
        if (!r.ok) {
          setVisible(false);
          setItems([]);
          setReady(true);
          return;
        }
        if (data.visible === false) {
          setVisible(false);
          setItems([]);
        } else {
          setVisible(true);
          setItems(Array.isArray(data.items) ? data.items : []);
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setVisible(false);
          setItems([]);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!DASH.test(pathname) || !ready || !visible) {
    return null;
  }

  return <DashboardNotificationsBell items={items} />;
}
