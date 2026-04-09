"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DASH_ROUTE = /^\/dashboard(\/.*)?$/;

/**
 * Em rotas /dashboard/* o link “← Dashboard” some no mobile (só no desktop).
 * Chip reforça para onde o utilizador volta, com menos sensação de “perdido no site”.
 */
export function CompactNavContextChip({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  const pathname = usePathname() ?? "";
  if (!DASH_ROUTE.test(pathname) || pathname === "/dashboard") return null;
  const label = backLabel.replace(/^[←\s]+/u, "").trim() || "Voltar";

  return (
    <Link href={backHref} className="kz-nav-context-chip" prefetch>
      {label}
    </Link>
  );
}
