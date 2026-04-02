import type { ProfessionalCard, ProfessionalDetail, ServiceRow, AvailTag } from "@/lib/professionals";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const PH_ROTATION = ["ph-1", "ph-2", "ph-3", "ph-4", "ph-5", "ph-6"] as const;

type ProRow = {
  id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  neighborhood: string | null;
  is_verified: boolean;
  availability_hint: string;
  rating_avg: number | string | null;
  reviews_count: number | null;
  price_from_cents: number | null;
};

type ServiceDbRow = {
  name: string;
  description: string | null;
  price_cents: number | null;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0];
  const b = parts[parts.length - 1][0];
  return `${a}${b}`.toUpperCase();
}

function formatPriceBRL(cents: number | null): string {
  if (cents == null || cents <= 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatRating(v: number | string | null): string {
  if (v == null) return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "—";
  return n.toFixed(1).replace(".", ",");
}

function availFromDb(h: string): AvailTag {
  if (h === "today" || h === "tomorrow" || h === "week") return h;
  return "week";
}

function roleLineFromRow(row: ProRow): string {
  if (row.headline?.trim()) return row.headline.trim();
  const nb = row.neighborhood?.trim();
  const city = row.city?.trim() || "Florianópolis";
  if (nb) return `${nb} · ${city}`;
  return city;
}

export function mapProRowToCard(row: ProRow, index: number): ProfessionalCard {
  const ratingAvg = typeof row.rating_avg === "string" ? parseFloat(row.rating_avg) : row.rating_avg;
  return {
    slug: row.slug,
    initials: initialsFromName(row.display_name),
    name: row.display_name,
    roleLine: roleLineFromRow(row),
    rating: formatRating(ratingAvg),
    reviewsCount: String(row.reviews_count ?? 0),
    price: formatPriceBRL(row.price_from_cents),
    avail: availFromDb(row.availability_hint),
    verified: row.is_verified,
    phClass: PH_ROTATION[index % PH_ROTATION.length] as ProfessionalCard["phClass"],
  };
}

const BOOKING_TIMES = [
  "09:00 — disponível",
  "11:00 — disponível",
  "14:00 — disponível",
  "16:00 — disponível",
];

function splitDisplayName(displayName: string): { line1: string; line2: string } {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { line1: displayName, line2: "" };
  const mid = Math.ceil(parts.length / 2);
  return {
    line1: parts.slice(0, mid).join(" "),
    line2: parts.slice(mid).join(" "),
  };
}

export async function fetchProfessionalsForSearch(): Promise<ProfessionalCard[] | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("professionals")
      .select(
        "id, slug, display_name, headline, city, neighborhood, is_verified, availability_hint, rating_avg, reviews_count, price_from_cents",
      )
      .order("created_at", { ascending: true });

    if (error) return null;
    if (!data?.length) return [];
    return (data as ProRow[]).map((row, i) => mapProRowToCard(row, i));
  } catch {
    return null;
  }
}

export async function fetchProfessionalDetailFromDb(slug: string): Promise<ProfessionalDetail | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: pro, error: pErr } = await supabase
      .from("professionals")
      .select(
        "id, slug, display_name, headline, bio, city, neighborhood, is_verified, availability_hint, rating_avg, reviews_count, price_from_cents",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (pErr || !pro) return null;

    const row = pro as ProRow;
    const { data: svc } = await supabase
      .from("pro_services")
      .select("name, description, price_cents, status")
      .eq("professional_id", row.id)
      .order("sort_order", { ascending: true });

    const services: ServiceRow[] = (svc as (ServiceDbRow & { status?: string | null })[] | null)?.length
      ? (svc as (ServiceDbRow & { status?: string | null })[]).filter((s) => (s.status ?? "approved") === "approved").map((s) => ({
          name: s.name,
          desc: s.description?.trim() || "",
          price: formatPriceBRL(s.price_cents),
        }))
      : [];

    const { line1, line2 } = splitDisplayName(row.display_name);
    const ratingAvg = typeof row.rating_avg === "string" ? parseFloat(row.rating_avg) : row.rating_avg;
    const card = mapProRowToCard(row, 0);

    return {
      ...card,
      nameLine1: line1,
      nameLine2: line2,
      categoryHref: "/search",
      categoryLabel: row.headline?.split("·")[0]?.trim() || "Serviços",
      about:
        row.bio?.trim() ||
        "Este profissional ainda não preencheu a descrição completa. Entre em contato pelo Kazaro para saber mais.",
      services,
      reviews: [],
      statRow: [
        { val: String(row.reviews_count ?? 0), label: "Avaliações" },
        { val: formatRating(ratingAvg), label: "Nota média" },
        { val: "—", label: "Na plataforma" },
        { val: "—", label: "Jobs concluídos" },
      ],
      bookingTimes: BOOKING_TIMES,
    };
  } catch {
    return null;
  }
}

export async function fetchProfessionalDisplayTitle(slug: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.from("professionals").select("display_name").eq("slug", slug).maybeSingle();
    if (error || !data?.display_name) return null;
    return data.display_name as string;
  } catch {
    return null;
  }
}
