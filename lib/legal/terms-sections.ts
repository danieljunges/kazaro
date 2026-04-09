import type { LegalSection } from "@/lib/legal/types";

export function buildTermsSections(input: { siteName: string; contactEmail: string }): LegalSection[] {
  const { siteName, contactEmail } = input;

  return [
    {
      heading: "1. Objeto",
      body: `Os presentes Termos regulam o uso da plataforma ${siteName}, que intermedia contato entre clientes e profissionais para serviços. O ${siteName} não substitui a relação civil ou comercial direta entre as partes, salvo disposição específica em contrato ou regulamento.`,
    },
    {
      heading: "2. Cadastro e conta",
      body: [
        "Você declara que as informações fornecidas são verdadeiras e se compromete a atualizá-las.",
        "É proibido criar contas de forma fraudulenta, suplantar terceiros ou utilizar a plataforma para fins ilícitos.",
        "Podemos suspender ou encerrar contas que violem estes Termos, a legislação ou direitos de terceiros.",
      ],
    },
    {
      heading: "3. Papéis de cliente e profissional",
      body: [
        "O cliente utiliza a plataforma para buscar, contratar e avaliar serviços, observando conduta respeitosa e cumprimento do combinado com o profissional.",
        "O profissional é responsável pela qualidade técnica do serviço, cumprimento de normas aplicáveis à sua atividade, alvarás quando exigidos e pela veracidade de anúncios e preços.",
      ],
    },
    {
      heading: "4. Agendamentos, mensagens e avaliações",
      body: [
        "Pedidos de agendamento, propostas e mensagens devem ocorrer preferencialmente pela plataforma para segurança e rastreabilidade.",
        "Avaliações devem refletir experiência real após serviço concluído; conteúdo ofensivo, falso ou manipulado pode ser removido e ensejar sanções.",
      ],
    },
    {
      heading: "5. Pagamentos",
      body: "Quando pagamentos forem processados pela plataforma ou por parceiros integrados, aplicar-se-ão condições adicionais exibidas no momento da contratação (taxas, chargebacks, reembolsos). Até lá, a cobrança pode ocorrer diretamente entre as partes, conforme acordado, sem prejuízo das regras de conduta aqui previstas.",
    },
    {
      heading: "6. Propriedade intelectual e conteúdo",
      body: `Marcas, layout, código e conteúdos do ${siteName} são protegidos. O usuário concede licença limitada para exibir conteúdo que ele próprio enviar (ex.: descrição de serviços) na medida necessária à operação da plataforma.`,
    },
    {
      heading: "7. Privacidade e LGPD",
      body: `O tratamento de dados pessoais obedece à nossa Política de Privacidade e à legislação brasileira, em especial a LGPD. O exercício de direitos do titular pode ser feito pelo e-mail ${contactEmail}.`,
    },
    {
      heading: "8. Limitação de responsabilidade",
      body: [
        "O serviço é oferecido “no estado em que se encontra”, com esforços razoáveis de disponibilidade e segurança.",
        "O ${siteName} não se responsabiliza por danos decorrentes de culpa exclusiva de cliente ou profissional, caso fortuito, força maior ou uso indevido da plataforma.",
        "Em hipóteses permitidas pela lei, a responsabilidade total pode ficar limitada ao valor pago pelo usuário ao ${siteName} nos últimos 12 meses, quando houver relação de consumo ou contratual equivalente.",
      ],
    },
    {
      heading: "9. Alterações",
      body: "Podemos alterar estes Termos. Alterações relevantes serão comunicadas por meios razoáveis (ex.: aviso no site ou e-mail). O uso continuado após a vigência pode constituir aceitação, conforme aplicável.",
    },
    {
      heading: "10. Foro e lei aplicável",
      body: "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de domicílio do consumidor ou, quando não aplicável o Código de Defesa do Consumidor, o foro da sede do controlador, salvo disposição legal em contrário.",
    },
  ];
}
