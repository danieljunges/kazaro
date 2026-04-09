import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getEmailConfirmationRedirectUrl } from "@/lib/auth/redirect";
import { translateResendError } from "@/lib/auth/resend-errors";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false as const, message: "Pedido inválido." }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false as const, message: "Informe um e-mail válido." }, { status: 400 });
  }

  try {
    const { url, publishableKey } = getSupabaseEnv();
    const supabase = createClient(url, publishableKey);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getEmailConfirmationRedirectUrl(),
      },
    });

    if (error) {
      return NextResponse.json({
        ok: false as const,
        message: translateResendError(error.message || "Não foi possível reenviar."),
      });
    }

    return NextResponse.json({ ok: true as const });
  } catch {
    return NextResponse.json(
      { ok: false as const, message: "Falha ao contactar o serviço de e-mail. Tente de novo." },
      { status: 502 },
    );
  }
}
