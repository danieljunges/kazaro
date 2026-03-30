import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: Array<{ heading: string; body: string }>;
};

export function InfoPage({ eyebrow, title, subtitle, sections }: InfoPageProps) {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/" backLabel="← Início" />
      <div className="section">
        <div style={{ maxWidth: 780 }}>
          <span className="sec-eyebrow">{eyebrow}</span>
          <h1 className="sec-title" style={{ marginBottom: 18 }}>
            {title}
          </h1>
          <p className="sec-sub" style={{ maxWidth: 680, marginBottom: 26 }}>
            {subtitle}
          </p>
        </div>
        <div className="pro-page-card" style={{ maxWidth: 860 }}>
          {sections.map((section) => (
            <div key={section.heading} style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, marginBottom: 8 }}>{section.heading}</h2>
              <p style={{ margin: 0, color: "var(--ink50)", lineHeight: 1.7 }}>{section.body}</p>
            </div>
          ))}
          <Link href="/search" className="btn-cta">
            Buscar profissionais →
          </Link>
        </div>
      </div>
    </div>
  );
}
