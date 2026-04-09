/** Requisitos alinhados ao que pedimos no formulário (reforce também no painel Supabase → Auth). */
export const PASSWORD_POLICY_HINT =
  "Pelo menos 8 caracteres, com maiúscula, minúscula, número e um símbolo (ex.: ! @ # $ %).";

const MIN_LEN = 8;

/**
 * @returns mensagem em português se inválida; `null` se ok.
 */
export function getPasswordPolicyError(password: string): string | null {
  if (password.length < MIN_LEN) {
    return `A senha deve ter pelo menos ${MIN_LEN} caracteres.`;
  }
  if (!/[a-z]/.test(password)) {
    return "Inclua pelo menos uma letra minúscula.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Inclua pelo menos uma letra maiúscula.";
  }
  if (!/[0-9]/.test(password)) {
    return "Inclua pelo menos um número.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Inclua pelo menos um caractere especial (ex.: !@#$%).";
  }
  return null;
}
