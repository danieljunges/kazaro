"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Tempo legível sem parecer que “travou” na tela. */
const FLASH_MS = 2400;

/**
 * Mostra aviso após logout quando a URL traz `?saiu=1`.
 * Remove o parâmetro após o tempo de leitura (scroll preservado).
 */
export function LogoutFlashToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  const qs = searchParams.toString();

  useEffect(() => {
    const p = new URLSearchParams(qs);
    if (p.get("saiu") !== "1") return;

    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);
      p.delete("saiu");
      const next = p.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, FLASH_MS);

    return () => clearTimeout(t);
  }, [qs, pathname, router]);

  if (!visible) return null;

  return (
    <div className="kz-logout-flash" role="status" aria-live="polite" aria-atomic="true">
      Você foi desconectado.
    </div>
  );
}
