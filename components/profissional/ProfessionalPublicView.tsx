import Link from "next/link";
import type { ProfessionalDetail } from "@/lib/professionals";
import { ProfileTabs } from "@/components/kazaro/ProfileTabs";

function availLabel(avail: ProfessionalDetail["avail"]) {
  if (avail === "today") return "Disponível hoje";
  if (avail === "tomorrow") return "Disponível amanhã";
  return "Esta semana";
}

function availClass(avail: ProfessionalDetail["avail"]) {
  if (avail === "today") return "avail-badge avail-today";
  if (avail === "tomorrow") return "avail-badge avail-tom";
  return "avail-badge avail-tom";
}

export function ProfessionalPublicView({ detail }: { detail: ProfessionalDetail }) {
  const stats = detail.statRow.slice(0, 3);

  return (
    <>
      <div className="pp-header">
        <div className="pp-pic">
          <div className={`pp-avatar-initials ${detail.phClass}`} aria-hidden>
            {detail.initials}
          </div>
          {detail.verified ? <span className="pp-verified-pill">✓ Verificado</span> : null}
        </div>
        <div className="pp-info">
          <h1 className="pp-name">
            {detail.nameLine1}
            {detail.nameLine2 ? (
              <>
                <br />
                {detail.nameLine2}
              </>
            ) : null}
          </h1>
          <div className="pp-role-line">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "var(--ink40)" }}
              aria-hidden
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            {detail.roleLine}
          </div>
          <div className="pp-pills">
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>{detail.rating}</span>
            <span style={{ fontSize: 12.5, color: "var(--ink60)" }}>
              · {detail.reviewsCount} avaliações
            </span>
            <span className={availClass(detail.avail)} style={{ position: "static", backdropFilter: "none" }}>
              {availLabel(detail.avail)}
            </span>
          </div>
        </div>
        <div className="pp-actions">
          <Link href={`/dashboard/mensagens/novo/${detail.slug}`} className="btn-outline-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Mensagem
          </Link>
          <Link href={`/profissional/${detail.slug}/agendar`} className="btn-book-now">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Agendar serviço
          </Link>
        </div>
      </div>

      <div className="pp-stats">
        {stats.map((s) => (
          <div key={s.label} className="pp-stat">
            <div className="pp-stat-val">{s.val}</div>
            <div className="pp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <ProfileTabs reviewsCount={detail.reviewsCount} />

      <div className="services-list">
        {detail.services.length === 0 ? (
          <p style={{ color: "var(--ink60)", fontSize: 14, padding: "12px 0" }}>
            Nenhum serviço cadastrado ainda neste perfil.
          </p>
        ) : (
          detail.services.map((s, i) => (
            <div key={`${s.name}-${i}`} className="service-item">
              {s.categoryLabel || s.attendanceLabel ? (
                <div className="si-service-badges">
                  {s.categoryLabel ? <span className="si-category">{s.categoryLabel}</span> : null}
                  {s.attendanceLabel ? <span className="si-attendance">{s.attendanceLabel}</span> : null}
                </div>
              ) : null}
              <div className="si-name">{s.name}</div>
              <div className="si-desc">{s.desc}</div>
              <div className="si-footer">
                <div>
                  <span className="si-price">{s.price}</span> <span className="si-unit">/ serviço</span>
                </div>
                <Link href={`/profissional/${detail.slug}/agendar?servico=${i}`} className="btn-contratar">
                  Contratar →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {detail.reviews.length > 0 ? (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink40)", marginBottom: 16 }}>
            AVALIAÇÕES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {detail.reviews.map((r) => (
              <div key={r.id} className="testim-card" style={{ margin: 0 }}>
                <div className="tc-score">{r.score}</div>
                <p className="tc-text">{r.text}</p>
                <div className="tc-author">
                  <div className="tc-initial">{r.author[0]}</div>
                  <div>
                    <div className="tc-name">{r.author}</div>
                    <div className="tc-info">{r.info}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink40)", marginBottom: 8 }}>
            AVALIAÇÕES
          </div>
          <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14 }}>
            Ainda não há avaliações publicadas para este profissional.
          </p>
        </div>
      )}

      <p style={{ fontSize: 13, color: "var(--ink40)", marginTop: 24 }}>
        <Link href="/search">← Voltar para a busca</Link>
      </p>
    </>
  );
}
