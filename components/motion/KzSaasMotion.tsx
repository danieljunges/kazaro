"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Aplica entrada ao scroll em blocos principais de todas as rotas.
 * Usa classe `.kz-sv` + `.kz-sv--in` (estilos em 14-motion-saas.css).
 */
export function KzSaasMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const selectors = [
      ".home-editorial > *:not(nav)",
      ".public-page > *:not(nav)",
      ".public-page .pp-main > *",
      ".dash-body > *",
      ".dash-content > *",
      ".kz-busca .kz-search-header",
      ".kz-busca .kz-filters-bar",
      ".kz-busca-main > *",
      ".kz-results-grid > a.kz-grid-card",
    ];

    const seen = new Set<HTMLElement>();

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.closest("[data-kz-motion-skip]")) return;
        seen.add(node);
      });
    }

    const list = [...seen];

    const byParent = new Map<Element, HTMLElement[]>();
    for (const el of list) {
      const p = el.parentElement ?? document.body;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p)!.push(el);
    }
    for (const group of byParent.values()) {
      group.forEach((el, i) => {
        el.style.setProperty("--kz-sv", String(Math.min(i, 14)));
      });
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          en.target.classList.add("kz-sv--in");
          io.unobserve(en.target);
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    for (const el of list) {
      el.classList.remove("kz-sv", "kz-sv--in");
      el.classList.add("kz-sv");
      io.observe(el);
    }

    return () => {
      io.disconnect();
      for (const el of list) {
        el.classList.remove("kz-sv", "kz-sv--in");
        el.style.removeProperty("--kz-sv");
      }
    };
  }, [pathname]);

  return null;
}
