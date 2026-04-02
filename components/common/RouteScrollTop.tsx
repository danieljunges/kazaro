"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Always starts each route at page top. */
export function RouteScrollTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Force top even when user navigates back/forward (Next may try to restore scroll).
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      // ignore
    }

    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      // double-tap to win race with automatic restoration
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    };

    scrollTop();

    const onPopState = () => scrollTop();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pathname, searchParams]);

  return null;
}
