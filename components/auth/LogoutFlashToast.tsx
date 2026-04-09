"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Tempo legível sem parecer que “travou” na tela. */
const FLASH_MS = 2400;

/**
 * Toasts curtos após logout (`?saiu=1`) ou exclusão de conta (`?conta=excluida`).
 * Remove o parâmetro após o tempo de leitura.
 */
export function LogoutFlashToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  const qs = searchParams.toString();

  useEffect(() => {
    const p = new URLSearchParams(qs);
    const saiu = p.get("saiu") === "1";
    const excluida = p.get("conta") === "excluida";
    if (!saiu && !excluida) {
      setVisible(false);
      return;
    }

    setText(saiu ? "Você foi desconectado." : "Sua conta foi excluída. Até logo.");
    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);
      if (saiu) p.delete("saiu");
      if (excluida) p.delete("conta");
      const next = p.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, FLASH_MS);

    return () => clearTimeout(t);
    // Não incluir `router`: em várias versões do Next a referência muda a cada render,
    // cancelando o timeout em loop e deixando o aviso fixo na tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router instável de propósito
  }, [qs, pathname]);

  if (!visible) return null;

  return (
    <div className="kz-logout-flash" role="status" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}
