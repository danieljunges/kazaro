"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type Props = {
  profileUrl: string;
  slug: string;
  /** "dashboard" = card no painel; "settings" = bloco em Configurações */
  variant?: "dashboard" | "settings";
};

export function ProfessionalProfileSharePanel({ profileUrl, slug, variant = "settings" }: Props) {
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const copy = useCallback(async () => {
    setErr(null);
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setErr("Não foi possível copiar automaticamente. Selecione o link acima e copie manualmente.");
    }
  }, [profileUrl]);

  const share = useCallback(async () => {
    setErr(null);
    if (typeof navigator === "undefined" || !navigator.share) {
      await copy();
      return;
    }
    try {
      await navigator.share({
        title: "Perfil no Kazaro",
        text: "Veja meus serviços e agende pelo Kazaro.",
        url: profileUrl,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      await copy();
    }
  }, [copy, profileUrl]);

  const isDashboard = variant === "dashboard";

  return (
    <div className={isDashboard ? "dash-card kz-share-profile" : "kz-share-profile kz-share-profile--settings"}>
      <div className="kz-share-profile__head">
        <div>
          <div className="kz-prof-title">Link do seu perfil público</div>
          <p className="kz-share-profile__lead">
            Envie para clientes verem seus{" "}
            <Link className="kz-share-profile__inline-link" href={`/profissional/${slug}`}>
              serviços e avaliações
            </Link>
            . Na página, eles podem{" "}
            <Link className="kz-share-profile__inline-link" href={`/profissional/${slug}/agendar`}>
              escolher data e horário
            </Link>{" "}
            conforme a sua agenda e mandar mensagem. Portfólio por serviço ainda vem em uma próxima versão.
          </p>
        </div>
      </div>
      <div className="kz-share-profile__row">
        <input
          className="kz-share-profile__url"
          readOnly
          value={profileUrl}
          aria-label="URL do perfil público"
          onFocus={(e) => e.target.select()}
        />
        <div className="kz-share-profile__actions">
          <button type="button" className="btn-cta kz-share-profile__btn" onClick={copy}>
            {copied ? "Copiado" : "Copiar link"}
          </button>
          <button type="button" className="btn-ghost kz-share-profile__btn" onClick={share}>
            Compartilhar…
          </button>
        </div>
      </div>
      {err ? <p className="auth-error" style={{ marginTop: 10, marginBottom: 0 }}>{err}</p> : null}
    </div>
  );
}
