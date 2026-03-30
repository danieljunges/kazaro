"use client";

import { useState } from "react";

export function ProfileTabs({ reviewsCount }: { reviewsCount: string }) {
  const [active, setActive] = useState(0);
  const tabs = ["Serviços", "Sobre", `Avaliações (${reviewsCount})`];
  return (
    <div className="pp-tabs">
      {tabs.map((label, i) => (
        <button
          key={label}
          type="button"
          className={`pp-tab${i === active ? " on" : ""}`}
          onClick={() => setActive(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
