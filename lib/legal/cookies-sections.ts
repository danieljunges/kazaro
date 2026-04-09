import type { LegalSection } from "@/lib/legal/types";

export function buildCookiesSections(siteName: string): LegalSection[] {
  return [
    {
      heading: "1. O que são cookies",
      body: "Cookies são pequenos arquivos ou identificadores armazenados no seu navegador quando você visita um site. Também podemos usar armazenamento local (localStorage) para preferências essenciais, como o registro de que você leu este aviso.",
    },
    {
      heading: "2. Cookies e dados estritamente necessários",
      body: [
        `O ${siteName} utiliza cookies e tecnologias similares necessários à autenticação de sessão (login), segurança (proteção contra abuso), manutenção de preferências funcionais e operação técnica da plataforma.`,
        "Sem esses elementos, não é possível garantir o funcionamento seguro de contas, agendamentos e mensagens.",
      ],
    },
    {
      heading: "3. Cookies de desempenho e marketing (opcionais)",
      body: `No estado atual do serviço, não utilizamos cookies de publicidade comportamental nem pixels de remarketing sem consentimento específico. Caso passemos a utilizar análises ou marketing não essenciais, solicitaremos consentimento prévio e atualizaremos esta política.`,
    },
    {
      heading: "4. Recursos de terceiros (fontes e APIs)",
      body: "Algumas fontes tipográficas podem ser carregadas de fornecedores externos (ex.: Google Fonts / Fontshare). Esses fornecedores podem receber dados técnicos como IP e User-Agent conforme suas próprias políticas. Quando possível, preferimos carregamento com parâmetros de privacidade (display=swap) e minimização de dados.",
    },
    {
      heading: "5. Como gerir ou desativar cookies",
      body: [
        "A maioria dos navegadores permite bloquear ou apagar cookies nas configurações de privacidade. A desativação de cookies necessários pode impedir login ou outras funções centrais.",
        "Para localStorage: você pode limpar os dados do site nas configurações do navegador; isso pode remover o registro do aviso de cookies e fazê-lo reaparecer.",
      ],
    },
    {
      heading: "6. Base legal",
      body: "O uso de cookies necessários fundamenta-se no legítimo interesse e na execução do contrato de uso da plataforma, bem como em obrigações de segurança, conforme LGPD. Eventuais cookies não essenciais dependerão de consentimento.",
    },
    {
      heading: "7. Contato",
      body: `Dúvidas sobre esta política podem ser encaminhadas pelo e-mail indicado na Política de Privacidade do ${siteName}.`,
    },
  ];
}
