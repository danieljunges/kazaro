import { CompactNav } from "@/components/kazaro/CompactNav";

export default function ConversaLoading() {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard/mensagens" backLabel="← Mensagens" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 980 }}>
          <div className="auth-skeleton" aria-busy="true" aria-label="Carregando conversa" style={{ minHeight: 360 }} />
        </div>
      </div>
    </div>
  );
}
