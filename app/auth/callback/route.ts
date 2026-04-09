import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

const EMAIL_CONFIRM_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const authErr = searchParams.get("error");
  if (authErr) {
    const desc = searchParams.get("error_description")?.trim().slice(0, 400) ?? "";
    const q = new URLSearchParams({ erro: "callback" });
    if (desc) q.set("motivo", desc);
    return NextResponse.redirect(`${origin}/entrar?${q.toString()}`);
  }

  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : `/${nextRaw}`;

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (token_hash && type && EMAIL_CONFIRM_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?erro=callback`);
}
