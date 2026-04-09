import type {
  PortfolioPhoto,
  ProfessionalCard,
  ProfessionalDetail,
  ReviewRow,
  ServiceRow,
  AvailTag,
} from "@/lib/professionals";
import {
  focusFilterExtraFromKeys,
  focusLabelsFromKeys,
  labelForCategoryKey,
  searchBlobForCategoryKey,
} from "@/lib/services/category-catalog";
import {
  isServiceAttendanceMode,
  labelAttendanceShort,
  type ServiceAttendanceMode,
} from "@/lib/services/service-attendance";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchPublicReviewsForProfessional, type BookingReviewPublic } from "@/lib/supabase/reviews";

const PH_ROTATION = ["ph-1", "ph-2", "ph-3", "ph-4", "ph-5", "ph-6"] as const;

type ProRow = {
  id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  neighborhood: string | null;
  service_region: string | null;
  is_verified: boolean;
  availability_hint: string;
  rating_avg: number | string | null;
  reviews_count: number | null;
  price_from_cents: number | null;
  focus_category_keys?: string[] | null;
  avatar_public_url?: string | null;
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
  if (v == null) return "-";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "-";
  return n.toFixed(1).replace(".", ",");
}

function formatReviewStarsLine(stars: number): string {
  return `${stars.toFixed(1).replace(".", ",")}/5`;
}

function formatReviewWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

function mapDbReviewsToRows(rows: BookingReviewPublic[]): ReviewRow[] {
  return rows.map((r) => ({
    id: r.id,
    score: formatReviewStarsLine(r.stars),
    text: (r.comment?.trim() || "Sem comentário.").trim(),
    author: r.author_public_name,
    info: formatReviewWhen(r.created_at),
  }));
}

function availFromDb(h: string): AvailTag {
  if (h === "today" || h === "tomorrow" || h === "week") return h;
  return "week";
}

function roleLineFromRow(row: ProRow): string {
  if (row.headline?.trim()) return row.headline.trim();
  const reg = row.service_region?.trim();
  if (reg) return reg;
  const nb = row.neighborhood?.trim();
  const city = row.city?.trim() || "Florianópolis";
  if (nb) return `${nb} · ${city}`;
  return city;
}

export function mapProRowToCard(row: ProRow, index: number, serviceSearchExtra?: string): ProfessionalCard {
  const ratingAvg = typeof row.rating_avg === "string" ? parseFloat(row.rating_avg) : row.rating_avg;
  const focusExtra = focusFilterExtraFromKeys(row.focus_category_keys);
  const svc = (serviceSearchExtra ?? "").trim();
  const mergedFilter = [focusExtra, svc].filter(Boolean).join(" ").trim();
  const labels = focusLabelsFromKeys(row.focus_category_keys);
  const avatar = row.avatar_public_url?.trim() || null;
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
    ...(mergedFilter ? { filterExtra: mergedFilter } : {}),
    ...(labels.length ? { focusLabels: labels } : {}),
    avatarPublicUrl: avatar,
  };
}

const BOOKING_TIMES = [
  "09:00, disponível",
  "11:00, disponível",
  "14:00, disponível",
  "16:00, disponível",
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

/** Profissionais reais para vitrine da home (ordenados por reputação). */
export async function fetchProfessionalsForHome(limit = 8): Promise<ProfessionalCard[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("professionals")
      .select(
        "id, slug, display_name, headline, city, neighborhood, service_region, is_verified, availability_hint, rating_avg, reviews_count, price_from_cents, focus_category_keys, avatar_public_url",
      )
      .order("reviews_count", { ascending: false, nullsFirst: false })
      .order("rating_avg", { ascending: false, nullsFirst: true })
      .limit(Math.min(Math.max(limit, 1), 24));

    if (error || !data?.length) return [];

    const ids = (data as ProRow[]).map((r) => r.id);
    const { data: catRows } = await supabase
      .from("pro_services")
      .select("professional_id, category_key")
      .in("professional_id", ids)
      .eq("status", "approved");

    const extraByPro = new Map<string, string>();
    for (const r of catRows ?? []) {
      const pid = r.professional_id as string;
      const blob = searchBlobForCategoryKey(r.category_key as string | null);
      if (!blob) continue;
      extraByPro.set(pid, `${extraByPro.get(pid) ?? ""} ${blob}`);
    }

    return (data as ProRow[]).map((row, i) => mapProRowToCard(row, i, extraByPro.get(row.id)));
  } catch {
    return [];
  }
}

export async function fetchProfessionalsForSearch(): Promise<ProfessionalCard[] | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("professionals")
      .select(
        "id, slug, display_name, headline, city, neighborhood, service_region, is_verified, availability_hint, rating_avg, reviews_count, price_from_cents, focus_category_keys, avatar_public_url",
      )
      .order("created_at", { ascending: true });

    if (error) return null;
    if (!data?.length) return [];

    const ids = (data as ProRow[]).map((r) => r.id);
    const { data: catRows } = await supabase
      .from("pro_services")
      .select("professional_id, category_key")
      .in("professional_id", ids)
      .eq("status", "approved");

    const extraByPro = new Map<string, string>();
    for (const r of catRows ?? []) {
      const pid = r.professional_id as string;
      const blob = searchBlobForCategoryKey(r.category_key as string | null);
      if (!blob) continue;
      extraByPro.set(pid, `${extraByPro.get(pid) ?? ""} ${blob}`);
    }

    return (data as ProRow[]).map((row, i) => mapProRowToCard(row, i, extraByPro.get(row.id)));
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
        "id, slug, display_name, headline, bio, city, neighborhood, service_region, is_verified, availability_hint, rating_avg, reviews_count, price_from_cents, focus_category_keys, avatar_public_url",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (pErr || !pro) return null;

    const row = pro as ProRow;
    const { data: svc } = await supabase
      .from("pro_services")
      .select("name, description, price_cents, status, category_key, attendance_mode")
      .eq("professional_id", row.id)
      .order("sort_order", { ascending: true });

    const svcRows =
      (svc as (ServiceDbRow & {
        status?: string | null;
        category_key?: string | null;
        attendance_mode?: string | null;
      })[]) ?? [];

    const serviceSearchParts: string[] = [];
    for (const s of svcRows) {
      if ((s.status ?? "approved") !== "approved") continue;
      const blob = searchBlobForCategoryKey(s.category_key ?? undefined);
      if (blob) serviceSearchParts.push(blob);
    }

    const services: ServiceRow[] = svcRows
      .filter((s) => (s.status ?? "approved") === "approved")
      .map((s) => {
        const rawAm = s.attendance_mode;
        const am: ServiceAttendanceMode =
          typeof rawAm === "string" && isServiceAttendanceMode(rawAm) ? rawAm : "at_venue";
        const attendanceLabel = labelAttendanceShort(am);
        return {
          name: s.name,
          desc: s.description?.trim() || "",
          price: formatPriceBRL(s.price_cents),
          categoryLabel: labelForCategoryKey(s.category_key ?? undefined) || undefined,
          attendanceLabel: attendanceLabel || undefined,
        };
      });

    const { line1, line2 } = splitDisplayName(row.display_name);
    const ratingAvg = typeof row.rating_avg === "string" ? parseFloat(row.rating_avg) : row.rating_avg;
    const card = mapProRowToCard(row, 0, serviceSearchParts.join(" "));
    const [reviewRows, portfolioRes] = await Promise.all([
      fetchPublicReviewsForProfessional(row.id),
      supabase
        .from("pro_portfolio_photos")
        .select("id, image_url")
        .eq("professional_id", row.id)
        .order("sort_order", { ascending: true }),
    ]);

    const portfolioPhotos: PortfolioPhoto[] = (portfolioRes.data ?? []).map((p) => ({
      id: p.id as string,
      url: (p.image_url as string).trim(),
    }));

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
      reviews: mapDbReviewsToRows(reviewRows),
      statRow: [
        { val: String(row.reviews_count ?? 0), label: "Avaliações" },
        { val: formatRating(ratingAvg), label: "Nota média" },
        { val: "-", label: "Na plataforma" },
        { val: "-", label: "Jobs concluídos" },
      ],
      bookingTimes: BOOKING_TIMES,
      ...(portfolioPhotos.length ? { portfolioPhotos } : {}),
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
