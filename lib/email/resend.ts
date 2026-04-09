import { Resend } from "resend";

function requireResendKey(): string {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY não configurada.");
  return key;
}

export async function sendTextEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const resend = new Resend(requireResendKey());
    const from = process.env.RESEND_FROM?.trim() || "Kazaro <no-reply@kazaro.app>";

    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    if (error) return { ok: false, message: error.message || "Falha ao enviar e-mail." };
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Falha ao enviar e-mail." };
  }
}

