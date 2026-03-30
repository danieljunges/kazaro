import Link from "next/link";

export function SearchEmptyState() {
  return (
    <div className="search-empty">
      <p className="search-empty__title">Nenhum profissional encontrado</p>
      <p className="search-empty__text">
        Tente outro termo, mude os filtros à esquerda ou amplie a região quando a busca real estiver
        ligada ao mapa.
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
