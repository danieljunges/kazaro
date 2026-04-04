import { formatCepDisplay, onlyCepDigits } from "@/lib/address/viacep";

export type BookingAddressParts = {
  cepDigits: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  contactPhone: string;
};

export function composeBookingLocationSnapshot(p: BookingAddressParts): string {
  const cep = formatCepDisplay(p.cepDigits).trim();
  const lines: string[] = [];
  if (cep) lines.push(`CEP ${cep}`);
  const street = p.street.trim();
  const num = p.number.trim();
  const comp = p.complement.trim();
  let addr = street;
  if (num) addr = addr ? `${addr}, ${num}` : num;
  if (comp) addr = addr ? `${addr}, ${comp}` : comp;
  if (addr) lines.push(addr);
  const nb = p.neighborhood.trim();
  const city = p.city.trim();
  const st = p.state.trim().toUpperCase();
  const cityLine = [nb, city && st ? `${city}/${st}` : city || st].filter(Boolean).join(" · ");
  if (cityLine) lines.push(cityLine);
  const phone = p.contactPhone.trim();
  if (phone) lines.push(`Contato: ${phone}`);
  return lines.join("\n").trim();
}

export function validateBookingAddressParts(p: BookingAddressParts): string | null {
  const cep = onlyCepDigits(p.cepDigits);
  if (cep.length !== 8) return "Informe um CEP válido (8 dígitos).";
  const num = p.number.trim();
  if (!num) return "Informe o número do endereço.";
  const street = p.street.trim();
  const nb = p.neighborhood.trim();
  const city = p.city.trim();
  if (!street && !nb) return "Preencha o logradouro ou aguarde a busca pelo CEP.";
  if (!city) return "Informe a cidade.";
  if (!st || st.length !== 2) return "Informe a UF (2 letras), ex.: SC.";
  return null;
}
