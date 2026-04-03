import type { LegalSection } from "@/lib/legal/types";

export function buildPrivacySections(input: {
  contactEmail: string;
  controllerNote: string;
  siteName: string;
  dpoTitle: string;
}): LegalSection[] {
  const { contactEmail, controllerNote, siteName, dpoTitle } = input;

  return [
    {
      heading: "1. Quem é o responsável pelos seus dados (controlador)",
      body: [
        controllerNote,
        `Para questões sobre esta política ou sobre o tratamento de dados pessoais, utilize o e-mail: ${contactEmail}.`,
      ],
    },
    {
      heading: "2. Escopo e aceitação",
      body: `Ao utilizar o site, aplicativo ou serviços do ${siteName}, você declara que leu e compreendeu esta Política de Privacidade. O uso continuado após alterações publicadas implica ciência das novas condições, na medida exigida pela legislação aplicável.`,
    },
    {
      heading: "3. Dados pessoais que podemos tratar",
      body: [
        "Dados de cadastro e conta: nome, e-mail, telefone (quando informado), dados de perfil e, para prestadores, informações profissionais exibidas publicamente conforme suas configurações.",
        "Dados de agendamentos e contratação: histórico de pedidos, mensagens trocadas na plataforma, avaliações e dados necessários à mediação operacional.",
        "Dados técnicos: endereço IP, tipo de navegador, logs de segurança, identificadores de sessão e cookies estritamente necessários ao funcionamento e à autenticação.",
        "Dados de pagamento: quando integrados, poderão ser tratados por provedores de pagamento; o ${siteName} pode receber status de transação, sem armazenar dados completos de cartão quando o processamento for delegado ao parceiro certificado.",
      ],
    },
    {
      heading: "4. Finalidades e bases legais (LGPD — Lei nº 13.709/2018)",
      body: [
        "Execução de contrato e procedimentos preliminares: viabilizar cadastro, agendamentos, mensagens e prestação do serviço da plataforma (base: execução de contrato, art. 7º, V).",
        "Legítimo interesse: segurança da informação, prevenção a fraudes, melhoria de desempenho e métricas agregadas, respeitando seus direitos e expectativas (art. 7º, IX), quando aplicável.",
        "Consentimento: quando exigido para funcionalidades opcionais ou comunicações de marketing não essenciais (art. 7º, I).",
        "Cumprimento de obrigação legal ou regulatória: guarda de registros quando a lei exigir (art. 7º, II).",
      ],
    },
    {
      heading: "5. Compartilhamento de dados",
      body: [
        "Prestadores de infraestrutura e hospedagem (ex.: provedor de nuvem e banco de dados) sob obrigações contratuais de confidencialidade e segurança.",
        "Processadores contratados (ex.: envio de e-mail transacional, pagamentos), apenas na medida necessária à finalidade.",
        "Autoridades públicas, quando houver determinação legal, ordem judicial ou requisição legítima.",
        "Não vendemos listas de contatos nem compartilhamos seus dados para publicidade de terceiros sem base legal adequada.",
      ],
    },
    {
      heading: "6. Transferência internacional",
      body: "Alguns fornecedores de tecnologia podem processar dados fora do Brasil. Nesses casos, adotamos cláusulas contratuais e medidas compatíveis com a LGPD e orientações da Autoridade Nacional de Proteção de Dados (ANPD), quando aplicável.",
    },
    {
      heading: "7. Segurança",
      body: "Adotamos medidas técnicas e administrativas razoáveis para proteger dados contra acessos não autorizados, perda ou alteração indevida, incluindo criptografia em trânsito quando aplicável, controle de acesso e monitoração. Nenhum sistema é 100% invulnerável; em caso de incidente relevante, seguiremos os procedimentos legais de comunicação.",
    },
    {
      heading: "8. Retenção",
      body: "Mantemos dados pelo tempo necessário para cumprir finalidades descritas, obrigações legais, resolução de disputas e exercício regular de direitos. Mensagens e registros operacionais podem ser conservados conforme política interna e prazo legal. Após o prazo, dados são eliminados ou anonimizados quando possível.",
    },
    {
      heading: "9. Seus direitos como titular",
      body: [
        "Confirmação da existência de tratamento; acesso; correção de dados incompletos, inexatos ou desatualizados;",
        "Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a LGPD;",
        "Portabilidade, quando aplicável; eliminação dos dados tratados com consentimento, observadas exceções legais;",
        "Informação sobre compartilhamentos e sobre a possibilidade de não fornecer consentimento;",
        "Revogação do consentimento, quando o tratamento tiver essa base.",
        `Solicitações podem ser enviadas para ${contactEmail}. Você também pode apresentar reclamação à ANPD (www.gov.br/anpd).`,
      ],
    },
    {
      heading: "10. Cookies e tecnologias similares",
      body: `Detalhamos categorias, finalidades e formas de controle na Política de Cookies (/cookies). O banner de cookies registra sua ciência quanto ao uso de tecnologias necessárias à operação.`,
    },
    {
      heading: "11. Crianças e adolescentes",
      body: `O ${siteName} não é direcionado a menores de 16 anos sem consentimento dos responsáveis, conforme LGPD. Se tomarmos conhecimento de cadastro indevido, tomaremos medidas para exclusão.`,
    },
    {
      heading: "12. Encarregado de dados (DPO)",
      body: `O encarregado pelo tratamento de dados (${dpoTitle}) pode ser contatado pelo e-mail ${contactEmail} para questões sobre privacidade, exercício de direitos e reclamações internas.`,
    },
    {
      heading: "13. Alterações",
      body: "Podemos atualizar esta política para refletir mudanças legais ou no serviço. A data da versão vigente será indicada quando passarmos a publicar histórico de revisões; recomendamos revisitar periodicamente.",
    },
  ];
}
