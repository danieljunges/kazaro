"use client";

import { SERVICE_CATEGORIES, type ServiceCategoryKey } from "@/lib/services/category-catalog";

type Props = {
  value: ServiceCategoryKey[];
  onChange: (keys: ServiceCategoryKey[]) => void;
  disabled?: boolean;
};

export function ProFocusCategoriesChecklist({ value, onChange, disabled }: Props) {
  const set = new Set(value);
  function toggle(key: ServiceCategoryKey) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(SERVICE_CATEGORIES.filter((c) => next.has(c.key)).map((c) => c.key));
  }

  return (
    <fieldset className="auth-field kz-focus-fieldset" disabled={disabled}>
      <legend className="auth-label">Funções / áreas em que você atua</legend>
      <p className="auth-password-hint kz-focus-fieldset__intro">
        Marque todas que combinam com você. Isso entra na busca por categoria e aparece no seu perfil público.
      </p>
      <div className="kz-focus-cats" role="group" aria-label="Áreas de atuação">
        {SERVICE_CATEGORIES.map((c) => (
          <label key={c.key} className="kz-focus-cat-opt">
            <input type="checkbox" checked={set.has(c.key)} onChange={() => toggle(c.key)} />
            <span className="kz-focus-cat-body">
              <span className="kz-focus-cat-label">{c.label}</span>
              <span className="kz-focus-cat-hint">{c.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
