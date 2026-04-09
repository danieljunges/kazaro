/** Mensagens do GoTrue / Supabase para `auth.resend` (signup). */
export function translateResendError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  }
  if (m.includes("email rate limit")) {
    return "Limite de e-mails atingido. Tente de novo em alguns minutos.";
  }
  if (m.includes("signups not allowed")) {
    return "Novos cadastros estão desativados no momento.";
  }
  if (m.includes("invalid email")) {
    return "E-mail inválido.";
  }
  if (m.includes("for security")) {
    return "Por segurança, aguarde um pouco antes de pedir outro e-mail.";
  }
  return message;
}
