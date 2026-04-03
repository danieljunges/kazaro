"use client";

import NextTopLoader from "nextjs-toploader";

/**
 * Barra fina no topo durante navegação (App Router), no estilo de sites “clássicos”,
 * já que transições client-side nem sempre disparam o indicador da guia do navegador.
 */
export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#158c79"
      height={3}
      showSpinner={false}
      speed={380}
      crawlSpeed={140}
      initialPosition={0.06}
      easing="cubic-bezier(0.22, 1, 0.36, 1)"
      shadow="0 0 14px rgba(21, 140, 121, 0.35)"
      zIndex={99999}
    />
  );
}
