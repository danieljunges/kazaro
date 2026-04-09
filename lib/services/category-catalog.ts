/** Alinhado aos chips da busca (`/search`): uma categoria por serviço ativo/pendente. Foco: estética, barbearia e beleza. */
export const SERVICE_CATEGORY_KEYS = [
  "barbearia",
  "nails",
  "sobrancelha",
  "cilios",
  "cabelo",
  "maquiagem",
  "tatuagem",
  "podologia",
] as const;

export type ServiceCategoryKey = (typeof SERVICE_CATEGORY_KEYS)[number];

export type ServiceCategoryDef = {
  key: ServiceCategoryKey;
  label: string;
  hint: string;
  /** Valor de `q` nos chips da página /search (alinha com roleLine / filterExtra). */
  chipQuery: string;
  /** Termos usados só na busca (texto livre), sem exibir no UI. */
  searchBlob: string;
};

export const SERVICE_CATEGORIES: readonly ServiceCategoryDef[] = [
  {
    key: "barbearia",
    label: "Barbearia",
    hint: "Corte, barba, degradê…",
    chipQuery: "barbearia",
    searchBlob: "barbearia barbeiro barba corte degradê navalha fade",
  },
  {
    key: "nails",
    label: "Manicure & nails",
    hint: "Esmaltação, gel, alongamento de unha…",
    chipQuery: "manicure",
    searchBlob: "manicure nails unha esmalte gel alongamento nail art unhas fibra banho de gel",
  },
  {
    key: "sobrancelha",
    label: "Design de sobrancelha",
    hint: "Design com pinça, henna, brow lamination…",
    chipQuery: "sobrancelha",
    searchBlob:
      "sobrancelha design sobrancelhas henna brow micropigmentação microblading pinça mapeamento lamination brow lamination",
  },
  {
    key: "cilios",
    label: "Extensão de cílios",
    hint: "Fio a fio, volume, lifting, manutenção…",
    chipQuery: "cilios",
    searchBlob:
      "cílios cilios extensão extensão de cílios lash fio a fio volume russo híbrido lifting manutenção lash designer",
  },
  {
    key: "cabelo",
    label: "Cabelo",
    hint: "Corte, cor, tratamento…",
    chipQuery: "cabeleireiro",
    searchBlob: "cabeleireiro cabelo corte coloração mechas tratamento escova penteado salão",
  },
  {
    key: "maquiagem",
    label: "Maquiagem",
    hint: "Social, noiva, editorial…",
    chipQuery: "maquiagem",
    searchBlob: "maquiagem make social noiva editorial beauty",
  },
  {
    key: "tatuagem",
    label: "Tatuagem",
    hint: "Traço, sombra, retoque…",
    chipQuery: "tatuagem",
    searchBlob: "tatuagem tatuador tattoo flash blackwork fineline sombras",
  },
  {
    key: "podologia",
    label: "Podologia",
    hint: "Cuidados com pés e unhas dos pés…",
    chipQuery: "podologia",
    searchBlob: "podologia podólogo podóloga pé unhas dos pés encravada calo spa dos pés",
  },
] as const;

/** Chips da página /search: mesma ordem e rótulos do cadastro de serviços. */
export function searchPageFilterChips(): { label: string; query: string }[] {
  return [{ label: "Todos", query: "" }, ...SERVICE_CATEGORIES.map((c) => ({ label: c.label, query: c.chipQuery }))];
}

export function isServiceCategoryKey(s: string): s is ServiceCategoryKey {
  return (SERVICE_CATEGORY_KEYS as readonly string[]).includes(s);
}

export function labelForCategoryKey(key: string | null | undefined): string {
  if (!key) return "";
  if (key === "lash") return "Extensão de cílios";
  const d = SERVICE_CATEGORIES.find((c) => c.key === key);
  return d?.label ?? key;
}

export function searchBlobForCategoryKey(key: string | null | undefined): string {
  if (!key) return "";
  if (key === "lash") {
    return SERVICE_CATEGORIES.find((c) => c.key === "cilios")?.searchBlob ?? "";
  }
  return SERVICE_CATEGORIES.find((c) => c.key === key)?.searchBlob ?? "";
}
