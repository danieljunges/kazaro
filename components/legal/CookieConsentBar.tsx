"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/site";

const STORAGE_KEY = "kz_lgpd_cookie_ack_v1";

export function CookieConsentBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function acknowledge() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="kz-cookie-bar" role="dialog" aria-modal="false" aria-labelledby="kz-cookie-bar-title">
      <div className="kz-cookie-bar-inner">
        <div className="kz-cookie-bar-text">
          <div id="kz-cookie-bar-title" className="kz-cookie-bar-title">
            Cookies e dados no {SITE_NAME}
          </div>
          <p className="kz-cookie-bar-desc">
            Usamos cookies e armazenamento local estritamente necessários para segurança, sessão de login (conta) e
            funcionamento da plataforma. Não vendemos seus dados. Leia a{" "}
            <Link href="/privacidade" className="kz-cookie-bar-link">
              Política de Privacidade
            </Link>{" "}
            e a{" "}
            <Link href="/cookies" className="kz-cookie-bar-link">
              Política de Cookies
            </Link>
            . Você pode gerir cookies no seu navegador.
          </p>
        </div>
        <div className="kz-cookie-bar-actions">
          <button type="button" className="kz-cookie-bar-btn kz-cookie-bar-btn--primary" onClick={acknowledge}>
            Entendi e continuar
          </button>
          <Link href="/privacidade" className="kz-cookie-bar-btn kz-cookie-bar-btn--ghost" prefetch={false}>
            Privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}
