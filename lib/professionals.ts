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
};

export type ServiceRow = { name: string; desc: string; price: string };

export type ReviewRow = { id: string; score: string; text: string; author: string; info: string };

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
};

const COMMON_TIMES = [
  "09:00 — disponível",
  "11:00 — disponível",
  "14:00 — disponível",
  "16:00 — disponível",
];

export const SEARCH_GRID_PROS: ProfessionalCard[] = [
  {
    slug: "carlos-eduardo-machado",
    initials: "CM",
    name: "Carlos Eduardo Machado",
    roleLine: "Encanador · Trindade",
    rating: "4,9",
    reviewsCount: "127",
    price: "R$ 120",
    avail: "today",
    verified: true,
    phClass: "ph-1",
  },
  {
    slug: "rodrigo-bittencourt",
    initials: "RB",
    name: "Rodrigo Bittencourt",
    roleLine: "Eletricista · Córrego Grande",
    rating: "4,8",
    reviewsCount: "89",
    price: "R$ 150",
    avail: "today",
    verified: true,
    phClass: "ph-2",
  },
  {
    slug: "ana-paula-ferreira",
    initials: "AP",
    name: "Ana Paula Ferreira",
    roleLine: "Limpeza · Lagoa da Conceição",
    rating: "5,0",
    reviewsCount: "203",
    price: "R$ 130",
    avail: "tomorrow",
    verified: true,
    phClass: "ph-3",
  },
  {
    slug: "marcos-silva",
    initials: "MS",
    name: "Marcos Silva",
    roleLine: "Pintor · Campeche",
    rating: "4,7",
    reviewsCount: "61",
    price: "R$ 200",
    avail: "today",
    verified: true,
    phClass: "ph-4",
  },
  {
    slug: "juliana-oliveira",
    initials: "JO",
    name: "Juliana Oliveira",
    roleLine: "Montagem · Trindade",
    rating: "4,9",
    reviewsCount: "44",
    price: "R$ 80",
    avail: "today",
    verified: false,
    phClass: "ph-5",
  },
  {
    slug: "felipe-lima",
    initials: "FL",
    name: "Felipe Lima",
    roleLine: "Encanador · Ingleses",
    rating: "4,6",
    reviewsCount: "38",
    price: "R$ 110",
    avail: "tomorrow",
    verified: true,
    phClass: "ph-6",
  },
];

const DETAIL: Record<string, Omit<ProfessionalDetail, keyof ProfessionalCard> & Partial<ProfessionalCard>> = {
  "carlos-eduardo-machado": {
    nameLine1: "Carlos Eduardo",
    nameLine2: "Machado",
    roleLine: "Encanador · Trindade, Florianópolis",
    categoryHref: "/search",
    categoryLabel: "Encanamento",
    about:
      "Encanador com mais de 10 anos de experiência em residências e imóveis de temporada em Florianópolis. Especializado em vazamentos, troca de torneiras, desentupimento e instalação de aquecedores. Atendo com pontualidade e deixo o ambiente como encontrei — ou melhor.",
    services: [
      {
        name: "Conserto de vazamento",
        desc: "Identificação e reparo de vazamentos internos ou externos",
        price: "R$ 120",
      },
      { name: "Troca de torneira", desc: "Desmontagem, instalação e vedação", price: "R$ 80" },
      { name: "Desentupimento", desc: "Pia, vaso, ralo e colunas", price: "R$ 150" },
      {
        name: "Instalação de aquecedor",
        desc: "Gás ou elétrico, com laudo de instalação",
        price: "R$ 250",
      },
    ],
    reviews: [
      {
        id: "demo-r1",
        score: "Vazamento · 5/5",
        text: "Chegou no horário, resolveu rápido e o valor foi exato o combinado. Recomendo.",
        author: "Mariana S.",
        info: "Trindade · há 3 dias",
      },
      {
        id: "demo-r2",
        score: "Troca de torneira · 5/5",
        text: "Pontual, educado e deixou tudo limpo. Já agendei para o próximo mês.",
        author: "Pedro M.",
        info: "Campeche · há 1 semana",
      },
      {
        id: "demo-r3",
        score: "Desentupimento · 5/5",
        text: "Resolveu em 20 minutos um problema que tinha há semanas. Profissional de verdade.",
        author: "Renata B.",
        info: "Lagoa · há 2 semanas",
      },
      {
        id: "demo-r4",
        score: "Instalação · 4/5",
        text: "Ótimo serviço. Só demorou um pouco mais do previsto, mas resultado impecável.",
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
    rating: "—",
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
      { val: "—", label: "Avaliações" },
      { val: "—", label: "Nota média" },
      { val: "—", label: "Na plataforma" },
      { val: "—", label: "Jobs concluídos" },
    ],
    bookingTimes: COMMON_TIMES,
  };
}

export function resolveProfessionalDetail(slug: string): ProfessionalDetail {
  return getProfessionalDetail(slug) ?? fallbackDetailFromSlug(slug);
}
