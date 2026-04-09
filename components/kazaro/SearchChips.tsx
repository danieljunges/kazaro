"use client";

import { useState } from "react";

const CHIPS = [
  "Todos",
  "Encanador",
  "Eletricista",
  "Pintor",
  "Montador",
  "Faxineira",
  "Frete",
  "Ar-condicionado",
  "Jardinagem",
  "Marido de Aluguel",
];

export function SearchChips() {
  const [on, setOn] = useState(0);
  return (
    <div className="sp-chips">
      {CHIPS.map((label, i) => (
        <button
          key={label}
          type="button"
          className={`chip ${i === on ? "chip-on" : "chip-off"}`}
          onClick={() => setOn(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
