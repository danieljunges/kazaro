/** E-mail para exercício de direitos LGPD, DPO e solicitações sobre dados. Configure em produção. */
export function getLegalContactEmail(): string {
  return process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL?.trim() || "privacidade@kazaro.app";
}

export function getDpoTitle(): string {
  return process.env.NEXT_PUBLIC_DPO_TITLE?.trim() || "Encarregado de dados (DPO)";
}

/** Texto curto sobre identificação societária; complete com razão social/CNPJ quando formalizado. */
export function getControllerLegalNote(): string {
  return (
    process.env.NEXT_PUBLIC_CONTROLLER_LEGAL_NOTE?.trim() ||
    "O Kazaro é operado como plataforma digital de intermediação de serviços. Razão social e CNPJ do controlador podem ser solicitados pelo e-mail de privacidade abaixo."
  );
}
