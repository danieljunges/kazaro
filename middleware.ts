import { type NextRequest } from "next/server";
import { blockLegacyAdminPaths, enforceAdminPanelOnEdge } from "@/lib/admin/middleware-admin";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const legacy = blockLegacyAdminPaths(request);
  if (legacy) return legacy;

  const sessionResponse = await updateSession(request);
  return enforceAdminPanelOnEdge(request, sessionResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
