/** Consulta pública de CEP (Brasil). Usado no cliente no formulário de agendamento. */

export type ViaCepJson = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export function onlyCepDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 8);
}

export function formatCepDisplay(digits: string): string {
  const d = onlyCepDigits(digits);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export async function fetchViaCep(digits: string): Promise<ViaCepJson | null> {
  const d = onlyCepDigits(digits);
  if (d.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    if (!res.ok) return null;
    const data = (await res.json()) as ViaCepJson;
    if (data?.erro) return null;
    return data;
  } catch {
    return null;
  }
}
