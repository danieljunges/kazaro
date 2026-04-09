import { Resend } from "resend";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function resendFrom(): string {
  return process.env.RESEND_FROM?.trim() || "Kazaro <no-reply@kazaro.app>";
}

export async function sendTextEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, message: "RESEND_API_KEY não configurada." };

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: resendFrom(),
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

/** E-mail com HTML (e texto plano opcional para clientes antigos). */
export async function sendHtmlEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, message: "RESEND_API_KEY não configurada." };

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: resendFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) return { ok: false, message: error.message || "Falha ao enviar e-mail." };
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Falha ao enviar e-mail." };
  }
}

