"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { DashboardNotifItem } from "@/lib/dashboard/pro-notifications";

type Props = {
  items: DashboardNotifItem[];
};

export function DashboardNotificationsBell({ items }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const count = items.length;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const badge = count > 99 ? "99+" : count > 0 ? String(count) : null;

  return (
    <div className="kz-notif-wrap" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className="notif-btn"
        aria-label={count > 0 ? `Notificações, ${count} novidade(s)` : "Notificações"}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {badge ? (
          <span className="notif-btn__badge" aria-hidden>
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          className="kz-notif-panel"
          role="dialog"
          aria-label="Notificações"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="kz-notif-panel__head">
            <span className="kz-notif-panel__title">Notificações</span>
            <button type="button" className="kz-notif-panel__close" onClick={close} aria-label="Fechar">
              ×
            </button>
          </div>
          {items.length === 0 ? (
            <p className="kz-notif-panel__empty">Nada novo por aqui. Quando houver pedidos ou mensagens, avisamos.</p>
          ) : (
            <ul className="kz-notif-list">
              {items.map((it) => (
                <li key={it.key}>
                  <Link href={it.href} className="kz-notif-item" onClick={close}>
                    <span className="kz-notif-item__title">{it.title}</span>
                    <span className="kz-notif-item__sub">{it.subtitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
