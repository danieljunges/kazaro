"use client";

import { useState } from "react";

const tabs = ["Serviços", "Sobre", "Avaliações (127)"];

export function ProfileTabs() {
  const [active, setActive] = useState(0);
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
