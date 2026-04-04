/** Alinhado aos chips da busca (`/search`): uma categoria por serviço ativo/pendente. */
export const SERVICE_CATEGORY_KEYS = [
  "encanamento",
  "eletrica",
  "limpeza",
  "montagem",
  "pintura",
  "reforma",
  "jardinagem",
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
    key: "encanamento",
    label: "Encanamento",
    hint: "Hidráulica, vazamentos, torneiras…",
    chipQuery: "encanador",
    searchBlob: "encanador encanamento hidráulica torneira vazamento desentupimento",
  },
  {
    key: "eletrica",
    label: "Elétrica",
    hint: "Instalações, luminárias, quadro…",
    chipQuery: "eletricista",
    searchBlob: "eletricista elétrica instalação luminária tomada disjuntor",
  },
  {
    key: "limpeza",
    label: "Limpeza",
    hint: "Faxina, residencial, pós-obra…",
    chipQuery: "limpeza",
    searchBlob: "limpeza faxina faxineiro diarista higienização",
  },
  {
    key: "montagem",
    label: "Montagem",
    hint: "Móveis, equipamentos, racks…",
    chipQuery: "montagem",
    searchBlob: "montagem montador móveis ikea rack",
  },
  {
    key: "pintura",
    label: "Pintura",
    hint: "Paredes, portas, acabamento…",
    chipQuery: "pintor",
    searchBlob: "pintor pintura parede rolo látex",
  },
  {
    key: "reforma",
    label: "Reforma",
    hint: "Pequenas obras, alvenaria…",
    chipQuery: "reforma",
    searchBlob: "reforma pedreiro obra alvenaria contrapiso",
  },
  {
    key: "jardinagem",
    label: "Jardinagem",
    hint: "Jardim, poda, grama…",
    chipQuery: "jardin",
    searchBlob: "jardim jardinagem paisagismo poda grama",
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
  const d = SERVICE_CATEGORIES.find((c) => c.key === key);
  return d?.label ?? key;
}

export function searchBlobForCategoryKey(key: string | null | undefined): string {
  if (!key) return "";
  return SERVICE_CATEGORIES.find((c) => c.key === key)?.searchBlob ?? "";
}
