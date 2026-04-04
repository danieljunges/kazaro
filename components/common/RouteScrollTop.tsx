"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Rola para o topo em navegações “novas” (links internos).
 * Não força topo em voltar/avançar do navegador; preserva posição de leitura.
 */
export function RouteScrollTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipNextScroll = useRef(false);
  const key = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    const onPopState = () => {
      skipNextScroll.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.history.scrollRestoration = "auto";
    } catch {
      // ignore
    }

    if (skipNextScroll.current) {
      skipNextScroll.current = false;
      return;
    }

    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    };
    scrollTop();
  }, [key]);

  return null;
}
