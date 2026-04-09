export type AvailTag = "today" | "tomorrow" | "week";

export type ProfessionalCard = {
  slug: string;
  initials: string;
  name: string;
  roleLine: string;
  rating: string;
  reviewsCount: string;
  price: string;
  avail: AvailTag;
  verified: boolean;
  phClass: "ph-1" | "ph-2" | "ph-3" | "ph-4" | "ph-5" | "ph-6";
  /** Texto extra para filtro na busca (categorias dos serviços aprovados). */
  filterExtra?: string;
  /** Rótulos das funções marcadas na ativação (aparecem na busca e no perfil). */
  focusLabels?: string[];
  /** Foto pública (espelho do avatar em Configurações). */
  avatarPublicUrl?: string | null;
};

export type ServiceRow = {
  name: string;
  desc: string;
  price: string;
  categoryLabel?: string;
  /** Selo curto: “No meu espaço”, “Vou até você”, etc. */
  attendanceLabel?: string;
};

export type ReviewRow = { id: string; score: string; text: string; author: string; info: string };

export type PortfolioPhoto = { id: string; url: string };

export type ProfessionalDetail = ProfessionalCard & {
  nameLine1: string;
  nameLine2: string;
  categoryHref: string;
  categoryLabel: string;
  about: string;
  services: ServiceRow[];
  reviews: ReviewRow[];
  statRow: { val: string; label: string }[];
  bookingTimes: string[];
  /** Trabalhos publicados pelo prestador. */
  portfolioPhotos?: PortfolioPhoto[];
};

const COMMON_TIMES = [
  "09:00, disponível",
  "11:00, disponível",
  "14:00, disponível",
  "16:00, disponível",
];

export const SEARCH_GRID_PROS: ProfessionalCard[] = [
  {
    slug: "carlos-eduardo-machado",
    initials: "CM",
    name: "Carlos Eduardo Machado",
    roleLine: "Barbearia · Trindade",
    rating: "4,9",
    reviewsCount: "127",
    price: "R$ 45",
    avail: "today",
    verified: true,
    phClass: "ph-1",
    filterExtra: "barbearia barbeiro barba corte degradê fade navalha",
    focusLabels: ["Barbearia"],
  },
  {
    slug: "rodrigo-bittencourt",
    initials: "RB",
    name: "Rodrigo Bittencourt",
    roleLine: "Manicure & nails · Córrego Grande",
    rating: "4,8",
    reviewsCount: "89",
    price: "R$ 65",
    avail: "today",
    verified: true,
    phClass: "ph-2",
    filterExtra: "manicure nails unha esmalte gel alongamento nail art fibra banho de gel",
    focusLabels: ["Manicure & nails"],
  },
  {
    slug: "beatriz-nogueira",
    initials: "BN",
    name: "Beatriz Nogueira",
    roleLine: "Design de sobrancelha · Agronômica",
    rating: "4,9",
    reviewsCount: "156",
    price: "R$ 70",
    avail: "today",
    verified: true,
    phClass: "ph-3",
    filterExtra:
      "sobrancelha design sobrancelhas henna brow micropigmentação microblading pinça mapeamento lamination",
    focusLabels: ["Design de sobrancelha"],
  },
  {
    slug: "ana-paula-ferreira",
    initials: "AP",
    name: "Ana Paula Ferreira",
    roleLine: "Extensão de cílios · Lagoa da Conceição",
    rating: "5,0",
    reviewsCount: "203",
    price: "R$ 120",
    avail: "tomorrow",
    verified: true,
    phClass: "ph-4",
    filterExtra:
      "cílios cilios extensão extensão de cílios lash fio a fio volume russo híbrido lifting manutenção lash designer",
    focusLabels: ["Extensão de cílios"],
  },
  {
    slug: "marcos-silva",
    initials: "MS",
    name: "Marcos Silva",
    roleLine: "Tatuagem · Campeche",
    rating: "4,7",
    reviewsCount: "61",
    price: "R$ 200",
    avail: "today",
    verified: true,
    phClass: "ph-5",
    filterExtra: "tatuagem tatuador tattoo flash blackwork fineline sombras",
    focusLabels: ["Tatuagem"],
  },
  {
    slug: "juliana-oliveira",
    initials: "JO",
    name: "Juliana Oliveira",
    roleLine: "Podologia · Trindade",
    rating: "4,9",
    reviewsCount: "44",
    price: "R$ 85",
    avail: "today",
    verified: false,
    phClass: "ph-6",
    filterExtra: "podologia podólogo podóloga pé unha encravada calo spa dos pés",
    focusLabels: ["Podologia"],
  },
  {
    slug: "felipe-lima",
    initials: "FL",
    name: "Felipe Lima",
    roleLine: "Cabeleireiro · Ingleses",
    rating: "4,6",
    reviewsCount: "38",
    price: "R$ 90",
    avail: "tomorrow",
    verified: true,
    phClass: "ph-1",
    filterExtra: "cabeleireiro cabelo corte coloração mechas tratamento escova salão",
    focusLabels: ["Cabelo"],
  },
  {
    slug: "laura-mendes",
    initials: "LM",
    name: "Laura Mendes",
    roleLine: "Maquiagem · Centro",
    rating: "5,0",
    reviewsCount: "72",
    price: "R$ 150",
    avail: "today",
    verified: true,
    phClass: "ph-4",
    filterExtra: "maquiagem make social noiva editorial beauty",
    focusLabels: ["Maquiagem"],
  },
];

const DETAIL: Record<string, Omit<ProfessionalDetail, keyof ProfessionalCard> & Partial<ProfessionalCard>> = {
  "carlos-eduardo-machado": {
    nameLine1: "Carlos Eduardo",
    nameLine2: "Machado",
    roleLine: "Barbearia · Trindade, Florianópolis",
    categoryHref: "/search",
    categoryLabel: "Barbearia",
    about:
      "Barbeiro em Florianópolis com foco em acabamento e atendimento no tempo combinado. Trabalho com corte clássico, degradê, barba desenhada e orientação de estilo para o dia a dia.",
    services: [
      {
        name: "Corte masculino",
        desc: "Corte na tesoura ou máquina, acabamento com navalha",
        price: "R$ 45",
      },
      { name: "Corte + barba", desc: "Corte completo e barba com toalha quente", price: "R$ 65" },
      { name: "Barba completa", desc: "Desenho, navalha e finalização", price: "R$ 35" },
      {
        name: "Pezinho e degradê",
        desc: "Refino de degradê e acabamento entre cortes",
        price: "R$ 30",
      },
    ],
    reviews: [
      {
        id: "demo-r1",
        score: "Corte · 5/5",
        text: "Marcou certinho o horário, mesmo valor do perfil e corte impecável.",
        author: "Mariana S.",
        info: "Trindade · há 3 dias",
      },
      {
        id: "demo-r2",
        score: "Corte + barba · 5/5",
        text: "Atendimento caprichado, já voltei duas vezes.",
        author: "Pedro M.",
        info: "Campeche · há 1 semana",
      },
      {
        id: "demo-r3",
        score: "Degradê · 5/5",
        text: "Melhor degradê que fiz na cidade. Indico demais.",
        author: "Renata B.",
        info: "Lagoa · há 2 semanas",
      },
      {
        id: "demo-r4",
        score: "Barba · 4/5",
        text: "Muito bom; só peguei fila num sábado, mas valeu a pena.",
        author: "Lucas F.",
        info: "Córrego Grande · há 3 semanas",
      },
    ],
    statRow: [
      { val: "127", label: "Avaliações" },
      { val: "4,9", label: "Nota média" },
      { val: "3 anos", label: "Na plataforma" },
      { val: "98%", label: "Jobs concluídos" },
    ],
    bookingTimes: COMMON_TIMES,
  },
};

export function getProfessionalCard(slug: string): ProfessionalCard | undefined {
  return SEARCH_GRID_PROS.find((p) => p.slug === slug);
}

export function getProfessionalDetail(slug: string): ProfessionalDetail | null {
  const card = getProfessionalCard(slug);
  const extra = DETAIL[slug];
  if (!card || !extra.nameLine1) {
    return null;
  }
  return { ...card, ...extra } as ProfessionalDetail;
}

export function fallbackDetailFromSlug(slug: string): ProfessionalDetail {
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const parts = title.split(" ");
  const line1 = parts.slice(0, Math.ceil(parts.length / 2)).join(" ");
  const line2 = parts.slice(Math.ceil(parts.length / 2)).join(" ");
  return {
    slug,
    initials: parts
      .slice(0, 2)
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase(),
    name: title,
    roleLine: "Profissional · Florianópolis, SC",
    rating: "-",
    reviewsCount: "0",
    price: "Sob consulta",
    avail: "week",
    verified: false,
    phClass: "ph-1",
    nameLine1: line1 || title,
    nameLine2: line2,
    categoryHref: "/search",
    categoryLabel: "Serviços",
    about:
      "Perfil em construção. Em breve você verá histórico completo, serviços e avaliações verificadas por aqui.",
    services: [],
    reviews: [],
    statRow: [
      { val: "-", label: "Avaliações" },
      { val: "-", label: "Nota média" },
      { val: "-", label: "Na plataforma" },
      { val: "-", label: "Jobs concluídos" },
    ],
    bookingTimes: COMMON_TIMES,
    avatarPublicUrl: null,
    portfolioPhotos: [],
  };
}

export function resolveProfessionalDetail(slug: string): ProfessionalDetail {
  return getProfessionalDetail(slug) ?? fallbackDetailFromSlug(slug);
}
