"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Always starts each route at page top. */
export function RouteScrollTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, searchParams]);

  return null;
}
