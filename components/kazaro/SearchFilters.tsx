"use client";

import { useState } from "react";

type Group = { label: string; options: string[] };

const GROUPS: Group[] = [
  {
    label: "Disponibilidade",
    options: ["Qualquer dia", "Disponível hoje", "Disponível amanhã"],
  },
  {
    label: "Faixa de preço",
    options: [
      "Qualquer preço",
      "Até R$ 100",
      "R$ 100 – R$ 200",
      "R$ 200 – R$ 350",
      "Acima de R$ 350",
    ],
  },
  {
    label: "Avaliação mínima",
    options: ["Qualquer avaliação", "4+ estrelas", "4.5+ estrelas", "4.8+ estrelas"],
  },
  {
    label: "Categoria",
    options: [
      "Todas",
      "Encanamento",
      "Elétrica",
      "Limpeza",
      "Frete e mudança",
      "Ar-condicionado",
      "Jardinagem",
    ],
  },
];

export function SearchFilters() {
  const [sel, setSel] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });

  return (
    <>
      {GROUPS.map((g, gi) => (
        <div key={g.label} className="sp-filter-group">
          <div className="sp-filter-label">{g.label}</div>
          {g.options.map((opt, oi) => (
            <button
              key={opt}
              type="button"
              className={`sp-opt${sel[gi] === oi ? " sel" : ""}`}
              onClick={() => setSel((s) => ({ ...s, [gi]: oi }))}
            >
              {opt}
            </button>
          ))}
        </div>
      ))}
    </>
  );
}
