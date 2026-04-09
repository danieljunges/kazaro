import Link from "next/link";

type Variant = "qa" | "database-empty" | "no-match";

export function SearchEmptyState({
  variant = "qa",
  query,
}: {
  variant?: Variant;
  /** Termo buscado (variante no-match). */
  query?: string;
}) {
  if (variant === "no-match") {
    const q = query?.trim();
    return (
      <div className="search-empty">
        <p className="search-empty__title">
          {q ? `Nenhum resultado para “${q}”` : "Nenhum profissional encontrado"}
        </p>
        <p className="search-empty__text">
          Tente outro termo ou use os atalhos de categoria acima. Você também pode voltar à lista completa.
        </p>
        <div className="search-empty__actions">
          <Link href="/search" className="search-empty__btn">
            Ver todos
          </Link>
          <Link href="/" className="search-empty__link">
            Início
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "database-empty") {
    return (
      <div className="search-empty">
        <p className="search-empty__title">Ainda não há profissionais na base</p>
        <p className="search-empty__text">
          A base está pronta. Cadastre prestadores no painel (SQL ou painel admin) para eles aparecerem aqui
          automaticamente.
        </p>
        <div className="search-empty__actions">
          <Link href="/para-profissionais" className="search-empty__btn">
            Área do prestador
          </Link>
          <Link href="/" className="search-empty__link">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="search-empty">
      <p className="search-empty__title">Nenhum profissional encontrado</p>
      <p className="search-empty__text">
        Tente outro termo, mude os filtros à esquerda ou amplie a região quando a busca estiver ligada a dados
        reais.
      </p>
      <div className="search-empty__actions">
        <Link href="/search" className="search-empty__btn">
          Limpar parâmetros de teste
        </Link>
        <Link href="/" className="search-empty__link">
          Voltar ao início
        </Link>
      </div>
      <p className="search-empty__hint">
        Dica de QA: resultados de demonstração voltam ao remover{" "}
        <code className="search-empty__code">?vazio=1</code> da URL.
      </p>
    </div>
  );
}
