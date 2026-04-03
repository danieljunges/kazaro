import { CompactNav } from "@/components/kazaro/CompactNav";

export default function MensagensLoading() {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 980 }}>
          <div className="auth-skeleton" aria-busy="true" aria-label="Carregando mensagens" style={{ minHeight: 280 }} />
        </div>
      </div>
    </div>
  );
}
