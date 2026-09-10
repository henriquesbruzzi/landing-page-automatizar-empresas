const translations = {
  pt: {
    nav: {
      home: 'HOME',
      services: 'EXEMPLOS DE SERVIÇOS',
      about: 'SOBRE',
      faq: 'FAQ',
      contact: 'CONTACTO',
    },
    hero: {
      title_line1: 'Deixe a sua empresa',
      title_line2_start: 'andar ',
      title_line2_highlight: 'sozinha',
      subtitle: 'A informação que anda espalhada junta-se num só sítio, sem ninguém copiar nada.',
      cta: 'Falar connosco',
      ctaSecundario: 'Ver exemplos',
      esquema: {
        // Lido por quem usa leitor de ecrã, em vez do desenho
        descricao: 'Quatro origens de informação, email, Excel, o seu ERP e WhatsApp, juntam-se num sítio só e dão origem a um resumo semanal.',
        // A ORDEM destas quatro é a mesma das linhas do resumo, e é ela que faz
        // a correspondência entre origem e resultado. Mexer numa obriga a mexer
        // na outra, senão o esquema passa a mentir.
        origens: [
          { id: 'email', nome: 'Email' },
          { id: 'excel', nome: 'Excel' },
          { id: 'erp', nome: 'O seu ERP' },
          { id: 'whatsapp', nome: 'WhatsApp' },
        ],
        resumo: {
          titulo: 'O seu resumo de segunda-feira',
          entrega: 'chega ao email às 7h30',
          // Uma linha por origem, pela mesma ordem. Os números ganham peso
          // sozinhos, o componente encontra-os: não é preciso marcá-los aqui.
          linhas: [
            { texto: '47 faturas lançadas, 2 por rever' },
            // A `nota` continua a linha em vez de abrir uma nova: o cartão tem
            // de ficar com quatro linhas, uma por cada caixa do esquema.
            {
              texto: '3 artigos em rutura de stock',
              nota: 'fornecedor alertado a *8/09*, sem resposta há *2 dias*',
            },
            { texto: '18 420 € vendidos, 6 310 € por receber' },
            // O `destaque` é a única parte realçada do cartão, porque é a
            // única que pede acção a quem o lê
            { texto: '20 pedidos respondidos,', destaque: '3 à espera de si' },
          ],
          rodape: 'agende este resumo ao seu gosto',
        },
      },
    },
    exemplos: {
      rotulo: 'EXEMPLOS',
      titulo: 'Isto é o que fazemos, em concreto',
      subtitulo: 'Seis situações que se repetem em quase todas as empresas. Cada uma mostra o que entra, o que se junta, e o que passa a chegar sozinho.',
      indiceTitulo: 'Saltar para',
      // A ORDEM é deliberada: o mais forte abre, o mais forte fecha, o mais
      // fraco fica ao meio. O índice segue esta mesma ordem, sozinho.
      blocos: [
        {
          id: 'exemplo-faturacao',
          indice: 'Contabilidade e faturação',
          rotulo: 'CONTABILIDADE E FATURAÇÃO',
          dor: 'Alguém passa duas manhãs por mês a lançar faturas de fornecedor.',
          explicacao: 'As faturas chegam por email, por WhatsApp e em papel, e acabam todas escritas à mão no mesmo sítio. Passam a ser lidas e lançadas sozinhas, e o que precisa mesmo de olhos fica numa lista curta.',
          esquema: {
            descricao: 'Faturas que chegam por email, por WhatsApp, em papel e pelo seu ERP juntam-se num sítio só e dão origem ao fecho do mês.',
            origens: [
              { id: 'email', nome: 'Email' },
              { id: 'whatsapp', nome: 'WhatsApp' },
              { id: 'papel', nome: 'Papel' },
              { id: 'erp', nome: 'O seu ERP' },
            ],
            resumo: {
              titulo: 'Fecho de setembro',
              entrega: 'enviado ao contabilista a 1/10',
              linhas: [
                { texto: '214 faturas lançadas' },
                { texto: '3 por rever, fornecedor sem NIF' },
                // O "12/08" fica sem peso de propósito: a data não é o número
                // que interessa. Marcar o "1" à mão desliga a procura no resto
                // da linha, senão a data saía em negrito e partida ao meio.
                { texto: '*1* repetida, já lançada a 12/08' },
              ],
            },
          },
        },
        {
          id: 'exemplo-clientes',
          indice: 'Resposta a clientes',
          rotulo: 'RESPOSTA A CLIENTES',
          dor: 'As mesmas cinco perguntas, todos os dias, em três sítios diferentes.',
          explicacao: 'O que chega por email, por WhatsApp e pelo formulário do site é lido, cruzado com a encomenda, e a resposta fica escrita à espera de um clique. Nada sai sem alguém aprovar.',
          esquema: {
            descricao: 'Mensagens que chegam por email, por WhatsApp, pelo formulário do site e pelo seu ERP juntam-se num sítio só e dão origem a respostas já escritas.',
            origens: [
              { id: 'email', nome: 'Email' },
              { id: 'whatsapp', nome: 'WhatsApp' },
              { id: 'formulario', nome: 'Formulário' },
              { id: 'erp', nome: 'O seu ERP' },
            ],
            resumo: {
              titulo: 'Hoje, 18h00',
              linhas: [
                { texto: '34 mensagens tratadas' },
                { texto: '5 à espera de si' },
                { texto: 'resposta em *6 minutos*, em média' },
              ],
            },
          },
        },
        {
          id: 'exemplo-encomendas',
          indice: 'Encomendas e pedidos',
          rotulo: 'ENCOMENDAS E PEDIDOS',
          dor: 'As encomendas entram por telefone e ficam anotadas num papel.',
          explicacao: 'O cliente passa a encomendar sozinho, num portal com a tabela do dia já lá dentro. A encomenda entra direta na preparação, sem ninguém copiar nada, e o telefone deixa de tocar para isto.',
          esquema: {
            descricao: 'Encomendas que chegam pelo portal, por WhatsApp, por email e pelo seu ERP juntam-se num sítio só e entram diretas na preparação.',
            origens: [
              { id: 'portal', nome: 'Portal' },
              { id: 'whatsapp', nome: 'WhatsApp' },
              { id: 'email', nome: 'Email' },
              { id: 'erp', nome: 'O seu ERP' },
            ],
            resumo: {
              titulo: 'Hoje, 9h00',
              linhas: [
                { texto: '37 encomendas recebidas' },
                { texto: '0 chamadas atendidas' },
                { texto: 'todas prontas para carga' },
              ],
            },
          },
        },
        {
          id: 'exemplo-seguranca',
          indice: 'Cópias de segurança e acessos',
          rotulo: 'CÓPIAS DE SEGURANÇA E ACESSOS',
          dor: 'Se o computador do escritório morrer hoje, o que é que se perde?',
          explicacao: 'As cópias passam a fazer-se sozinhas e a ser verificadas, os acessos de quem sai são retirados no próprio dia, e todas as semanas recebe um resumo do que aconteceu.',
          esquema: {
            descricao: 'O servidor, os computadores, o email e a nuvem passam a ser acompanhados num sítio só e dão origem a um resumo semanal.',
            origens: [
              { id: 'servidor', nome: 'Servidor' },
              { id: 'computadores', nome: 'Computadores' },
              { id: 'email', nome: 'Email' },
              { id: 'nuvem', nome: 'Nuvem' },
            ],
            resumo: {
              titulo: 'Semana de 31/08 a 6/09',
              linhas: [
                { texto: '*7 de 7* cópias feitas e verificadas' },
                { texto: '*1* acesso removido, saiu a 29/08' },
                { texto: '*1* falha resolvida às *3h14*, sem ninguém dar por ela' },
              ],
            },
          },
        },
        {
          id: 'exemplo-stock',
          indice: 'Stock e compras',
          rotulo: 'STOCK E COMPRAS',
          dor: 'O stock do programa diz uma coisa e o armazém diz outra.',
          explicacao: 'O ERP, a loja e o portal da transportadora passam a falar entre si. As diferenças aparecem numa lista de manhã, em vez de aparecerem ao cliente na hora de entregar.',
          esquema: {
            descricao: 'O seu ERP, a loja online, o portal da transportadora e o Excel passam a falar entre si e dão origem a uma lista de divergências.',
            origens: [
              { id: 'erp', nome: 'O seu ERP' },
              { id: 'loja', nome: 'Loja online' },
              { id: 'transporte', nome: 'Transporte' },
              { id: 'excel', nome: 'Excel' },
            ],
            resumo: {
              titulo: 'Hoje, 6h05',
              linhas: [
                { texto: '5 487 referências verificadas' },
                { texto: '12 divergências, 9 corrigidas sozinhas' },
                { texto: '3 precisam de decisão' },
              ],
            },
          },
        },
        {
          id: 'exemplo-numeros',
          indice: 'Números do negócio',
          rotulo: 'NÚMEROS DO NEGÓCIO',
          dor: 'Só se sabe se o mês correu bem quando o contabilista fecha as contas.',
          explicacao: 'Os números que andam espalhados por quatro programas juntam-se num só e chegam por email na segunda de manhã. Ninguém refaz tabelas no fim do mês.',
          esquema: {
            descricao: 'O seu ERP, a faturação, a loja online e o Excel juntam-se num sítio só e dão origem a um resumo semanal por email.',
            origens: [
              { id: 'erp', nome: 'O seu ERP' },
              { id: 'faturacao', nome: 'Faturação' },
              { id: 'loja', nome: 'Loja online' },
              { id: 'excel', nome: 'Excel' },
            ],
            resumo: {
              titulo: 'Semana 37',
              linhas: [
                { texto: 'margem média *21%*, menos *3 pontos* que a semana passada' },
                { texto: '4 artigos a dar prejuízo' },
                { texto: '3 clientes acima do plafond' },
              ],
            },
          },
        },
      ],
      convite: {
        frase: 'Não viu o seu caso? A maior parte do que fazemos parece-se com isto.',
        botao: 'Falar connosco',
      },
      // A tira cresce quando houver capacidade real de integrar mais uma coisa,
      // não se enche à partida. Cada entrada leva `logo` quando o ficheiro
      // existir, e passa a imagem sem a tira ser refeita.
      tira: {
        texto: 'Fazemos integrações com',
        ferramentas: [
          { id: 'gmail', nome: 'Gmail' },
          { id: 'outlook', nome: 'Outlook' },
          { id: 'excel', nome: 'Excel' },
          { id: 'google-sheets', nome: 'Google Sheets' },
          { id: 'primavera', nome: 'Cegid Primavera' },
          { id: 'moloni', nome: 'Moloni' },
          { id: 'invoicexpress', nome: 'InvoiceXpress' },
          { id: 'shopify', nome: 'Shopify' },
          { id: 'woocommerce', nome: 'WooCommerce' },
        ],
      },
    },
    services: {
      subtitle: 'O que fazemos',
      title: 'Nossos ',
      titleHighlight: 'Serviços',
      description: 'Trabalho manual a menos, informação a circular, e alguém a quem ligar quando é preciso.',
      items: [
        {
          id: 'servico-automacao',
          icon: 'ciclo',
          title: 'Automação de trabalho administrativo',
          description: 'Encomendas, faturação, mapas mensais e o envio de ficheiros ao contabilista deixam de precisar de alguém a escrevê-los à mão.',
        },
        {
          id: 'servico-sistemas',
          icon: 'elo',
          title: 'Sistemas de informação e integrações',
          description: 'O ERP, a loja online, as folhas de Excel e os portais das transportadoras passam a falar uns com os outros, sem ninguém reescrever a mesma coisa em três sítios.',
        },
        {
          id: 'servico-ia',
          icon: 'brain',
          title: 'Inteligência artificial aplicada ao negócio',
          description: 'Usamos IA onde ela resolve mesmo: ler emails e documentos, classificar pedidos e preparar respostas.',
        },
        {
          id: 'servico-web',
          icon: 'code',
          title: 'Sites e canais para chegar ao cliente',
          description: 'Site, formulários de pedido que substituem dezenas de emails, e páginas onde o cliente consulta sozinho o estado da encomenda.',
        },
        {
          id: 'servico-dados',
          icon: 'chart',
          title: 'Dados e relatórios',
          description: 'Os números que precisa de ver todas as semanas, sem ninguém refazer tabelas no fim do mês.',
        },
        {
          id: 'servico-seguranca',
          icon: 'shield',
          title: 'Segurança, cloud e apoio contínuo',
          description: 'O que construímos fica alojado com segurança e acompanhado por nós, com cópias de segurança, acessos controlados e alguém a quem ligar quando falha.',
        },
      ],
    },
    process: {
      subtitle: 'Como trabalhamos',
      title: 'Do primeiro dia até ',
      titleHighlight: 'andar sozinho',
      steps: [
        {
          number: '01',
          keyword: 'Diagnóstico',
          description: 'Percebemos como o trabalho corre hoje, ao pormenor. Daí sai um relatório com o que pode mudar e o que isso traz à empresa.',
        },
        {
          number: '02',
          keyword: 'Planeamento',
          description: 'Dizemos o que vamos fazer, quanto custa e em quanto tempo, antes de começarmos. O valor combinado é o que fica, sem surpresas pelo caminho.',
        },
        {
          number: '03',
          keyword: 'Desenvolvimento',
          description: 'Fazemos por partes e vai vendo a funcionar antes de estar tudo pronto, para se corrigir cedo o que for preciso.',
        },
        {
          number: '04',
          keyword: 'Acompanhamento',
          description: 'Fica a funcionar e nós ficamos por perto, com alguém a quem ligar quando for preciso.',
        },
      ],
    },
    contact: {
      subtitle: 'Vamos conversar',
      title: 'Fale ',
      titleHighlight: 'Connosco',
      description: 'Preencha o formulário abaixo e a nossa equipa entrará em contacto consigo no prazo de um dia útil.',
      form: {
        name: 'Primeiro e Último Nome',
        namePlaceholder: 'João Silva',
        email: 'Email',
        emailPlaceholder: 'seuemail@exemplo.com',
        phone: 'Telefone',
        phonePlaceholder: '+351 912 345 678',
        phoneHint: 'Aceita o sinal + e o indicativo de qualquer país, por exemplo +351 912 345 678.',
        company: 'Empresa',
        companyPlaceholder: 'Nome da sua empresa',
        source: 'Como soube de nós?',
        sourcePlaceholder: 'Selecione uma opção',
        sourceOptions: [
          'Pesquisa online',
          'LinkedIn',
          'Evento ou conferência',
          'Notícia ou imprensa',
          'Recomendação de amigo ou colega',
          'Já era cliente',
          'Contacto direto da NEXUGAL',
          // "Outro" tem de ficar sempre em último: o formulário identifica-o
          // pela última posição da lista para abrir a caixa de texto.
          'Outro',
        ],
        sourceError: 'Selecione uma opção para continuarmos.',
        sourceOtherPlaceholder: 'Diga-nos onde nos encontrou',
        sourceOtherError: 'Escreva onde nos encontrou.',
        messageOptional: 'Mensagem (opcional)',
        messageAutoPrefix: 'Pedido de contacto. Soube de nós através de: ',
        messagePlaceholder: 'Descreva brevemente o seu projeto ou necessidade...',
        submit: 'Enviar Mensagem',
        sending: 'A enviar...',
        success: 'Mensagem enviada com sucesso! Entraremos em contacto em breve.',
      },
      back: 'Voltar ao início',
      logo: 'NEXUGAL, ir para a página inicial',
    },
    about: {
      subtitle: 'Quem somos',
      title: 'Sobre a ',
      titleHighlight: 'NEXUGAL',
      description: 'A nossa equipa ajuda empresas a tirar do meio o trabalho manual que ninguém gosta de fazer e a pôr a informação a circular entre as pessoas e os sistemas. Sem projetos intermináveis, sem tecnologia a mais do que a necessária.',
      founders: {
        intro: 'Os nossos fundadores são licenciados em Engenharia e Gestão de Sistemas de Informação pela Universidade do Minho. É de lá que vem a forma como trabalhamos, a olhar ao mesmo tempo para o processo e para a tecnologia.',
        photoAlt: 'Fotografia de ',
        linkedinLabel: 'LinkedIn de ',
        people: [
          {
            id: 'rui',
            name: 'Rui Machado',
            role: 'Sócio fundador',
            description: 'Gere lojas de comércio eletrónico em vários países e foi aí que construiu as primeiras automações, das respostas a clientes à faturação e à expedição. Traz o método de quem já resolveu estes problemas na sua própria empresa, antes de os resolver nas dos outros.',
          },
          {
            id: 'henrique',
            name: 'Henrique Fernandes',
            role: 'Sócio fundador',
            description: 'Trabalhou como freelancer para mais de 80 clientes de vários setores, a construir software à medida e a automatizar processos. Traz o lado técnico da NEXUGAL, a parte de pegar num processo complicado e transformá-lo em algo simples de usar no dia a dia.',
          },
        ],
      },
    },
    faq: {
      subtitle: 'Perguntas Frequentes',
      title: 'Dúvidas ',
      titleHighlight: 'Frequentes',
      description: 'Encontre respostas para as perguntas mais comuns sobre os nossos serviços, processos e formas de trabalho.',
      back: '← Voltar ao início',
      items: [
        {
          question: 'Que tipo de serviços a NEXUGAL oferece?',
          answer: 'Oferecemos uma gama completa de serviços tecnológicos: desenvolvimento web (sites, aplicações e plataformas), cibersegurança (auditorias, monitorização e proteção de dados), soluções cloud (migração e gestão), consultoria em inteligência artificial, análise de dados com dashboards personalizados, e suporte técnico contínuo 24/7.',
        },
        {
          question: 'Quanto tempo demora um projeto de desenvolvimento web?',
          answer: 'O prazo varia conforme a complexidade do projeto. Um site institucional pode estar pronto em 2 a 4 semanas, enquanto uma aplicação web mais complexa pode levar entre 2 a 6 meses. Na fase de diagnóstico, dizemos o que fica pronto em cada etapa e quando.',
        },
        {
          question: 'Como funciona o processo de trabalho da NEXUGAL?',
          answer: 'O nosso processo tem quatro etapas. Diagnóstico, percebemos como o trabalho corre hoje, ao pormenor, e daí sai um relatório com o que pode mudar e o que isso traz à empresa. Planeamento, dizemos o que vamos fazer, quanto custa e em quanto tempo, antes de começarmos. Desenvolvimento, fazemos por partes e vai vendo a funcionar antes de estar tudo pronto, para se corrigir cedo o que for preciso. Acompanhamento, fica a funcionar e nós ficamos por perto, com alguém a quem ligar quando for preciso.',
        },
        {
          question: 'A NEXUGAL trabalha com empresas de que dimensão?',
          answer: 'Trabalhamos com empresas de todas as dimensões, desde startups e PMEs até grandes corporações. As nossas soluções são personalizadas para se adaptarem às necessidades e ao orçamento de cada cliente.',
        },
        {
          question: 'Oferecem suporte após a entrega do projeto?',
          answer: 'Sim! Oferecemos suporte técnico contínuo 24/7 e manutenção proativa. Após a entrega, acompanhamos o desempenho da solução, aplicamos atualizações de segurança e corrigimos o que for aparecendo.',
        },
        {
          question: 'Qual é o custo dos vossos serviços?',
          answer: 'Cada projeto é único, por isso o custo depende dos requisitos específicos, da complexidade e do prazo desejado. Oferecemos uma consulta gratuita e sem compromisso onde apresentamos um orçamento personalizado e transparente.',
        },
        {
          question: 'A consulta inicial é gratuita?',
          answer: 'Sim, a primeira consulta é totalmente gratuita e sem compromisso. Nela, analisamos as suas necessidades, apresentamos possíveis soluções e respondemos a todas as suas questões. Pode agendar através do nosso formulário de contacto.',
        },
      ],
    },
    cta: {
      title_start: 'Pronto para a sua empresa ',
      title_highlight: 'andar sozinha',
      title_end: '?',
      description: 'Falamos primeiro, sem custo, para perceber se há aqui trabalho para fazer.',
      button: 'Iniciar Conversa',
      note: 'Sem compromisso. Resposta no prazo de um dia útil.',
    },
    privacy: 'Política de Privacidade',
    cookieBanner: {
      title: 'Respeito pela sua privacidade',
      description: 'Utilizamos cookies essenciais para garantir o funcionamento do site e, com o seu consentimento, podemos usar cookies para análise e melhoria da experiência. Pode gerir as suas preferências a qualquer momento.',
      acceptAll: 'Aceitar Todos',
      acceptEssential: 'Apenas Essenciais',
      learnMore: 'Política de Privacidade',
      essentialOnly: 'Apenas cookies essenciais ativados',
    },
    footer: {
      brand: {
        name: 'NEXUGAL',
        tagline: 'Deixe a sua empresa andar sozinha. Menos trabalho manual, mais tempo para o que interessa.',
      },
      contact: {
        title: 'Contacto',
        email: 'geral@nexugal.com',
        phone: '+351 912 423 912',
        address: 'Braga, Portugal',
      },
      links: {
        title: 'Links Rápidos',
        items: [
          { label: 'Home', href: '#home' },
          { label: 'Exemplos', href: '#exemplos' },
          { label: 'Como trabalhamos', href: '#processo' },
          { label: 'Sobre', href: '/sobre' },
        ],
      },
      legalLinks: [
        { label: 'Política de Privacidade', href: '/privacidade' },
        { label: 'Política de Cookies', href: '/privacidade#cookies' },
      ],
      services: {
        title: 'Serviços',
      },
      social: {
        title: 'Redes Sociais',
      },
      copyright: '© {year} NEXUGAL. Todos os direitos reservados.',
      madeWith: 'Feito com tecnologia de ponta em',
      location: 'Portugal',
    },
    chatbot: {
      welcome: 'Olá! 👋 Sou o assistente virtual da NEXUGAL. Como posso ajudar hoje?',
      placeholder: 'Digite sua mensagem...',
      send: 'Enviar mensagem',
      close: 'Fechar chat',
      open: 'Abrir chat',
      title: 'Assistente Virtual',
      subtitle: 'NEXUGAL',
    },
  },
  en: {
    nav: {
      home: 'HOME',
      services: 'SERVICE EXAMPLES',
      about: 'ABOUT',
      faq: 'FAQ',
      contact: 'CONTACT',
    },
    hero: {
      title_line1: 'Let your business',
      title_line2_start: 'run ',
      title_line2_highlight: 'on its own',
      subtitle: 'Information that lives in scattered places comes together in one, without anyone copying anything.',
      cta: 'Talk to us',
      ctaSecundario: 'See examples',
      esquema: {
        descricao: 'Four sources of information, email, Excel, your ERP and WhatsApp, come together in one place and produce a weekly summary.',
        // Same order as the summary lines below. The order is what pairs each
        // source with its result, so the two lists move together or not at all.
        origens: [
          { id: 'email', nome: 'Email' },
          { id: 'excel', nome: 'Excel' },
          { id: 'erp', nome: 'Your ERP' },
          { id: 'whatsapp', nome: 'WhatsApp' },
        ],
        resumo: {
          titulo: 'Your Monday summary',
          entrega: 'arrives by email at 7:30',
          linhas: [
            { texto: '47 invoices posted, 2 to review' },
            {
              texto: '3 items out of stock',
              nota: 'supplier alerted on *Sep 8*, no reply for *2 days*',
            },
            { texto: '€18,420 sold, €6,310 outstanding' },
            { texto: '20 requests answered,', destaque: '3 waiting on you' },
          ],
          rodape: 'schedule this summary to suit you',
        },
      },
    },
    exemplos: {
      rotulo: 'EXAMPLES',
      titulo: 'This is what we do, in practice',
      subtitulo: 'Six situations that come up in almost every company. Each one shows what goes in, what gets brought together, and what starts arriving on its own.',
      indiceTitulo: 'Jump to',
      blocos: [
        {
          id: 'exemplo-faturacao',
          indice: 'Accounting and invoicing',
          rotulo: 'ACCOUNTING AND INVOICING',
          dor: 'Someone spends two mornings a month entering supplier invoices.',
          explicacao: 'Invoices arrive by email, by WhatsApp and on paper, and all end up typed by hand into the same place. They start being read and entered on their own, and whatever really needs a human eye ends up on a short list.',
          esquema: {
            descricao: 'Invoices arriving by email, by WhatsApp, on paper and through your ERP come together in one place and produce the month end close.',
            origens: [
              { id: 'email', nome: 'Email' },
              { id: 'whatsapp', nome: 'WhatsApp' },
              { id: 'papel', nome: 'Paper' },
              { id: 'erp', nome: 'Your ERP' },
            ],
            resumo: {
              titulo: 'September close',
              entrega: 'sent to the accountant on 1/10',
              linhas: [
                { texto: '214 invoices entered' },
                { texto: '3 to review, supplier with no tax number' },
                { texto: '*1* duplicate, already entered on 12/08' },
              ],
            },
          },
        },
        {
          id: 'exemplo-clientes',
          indice: 'Customer replies',
          rotulo: 'CUSTOMER REPLIES',
          dor: 'The same five questions, every day, in three different places.',
          explicacao: 'What arrives by email, by WhatsApp and through the website form is read, matched against the order, and the reply is written and waiting for one click. Nothing goes out without someone approving it.',
          esquema: {
            descricao: 'Messages arriving by email, by WhatsApp, through the website form and through your ERP come together in one place and produce replies that are already written.',
            origens: [
              { id: 'email', nome: 'Email' },
              { id: 'whatsapp', nome: 'WhatsApp' },
              { id: 'formulario', nome: 'Form' },
              { id: 'erp', nome: 'Your ERP' },
            ],
            resumo: {
              titulo: 'Today, 18:00',
              linhas: [
                { texto: '34 messages handled' },
                { texto: '5 waiting on you' },
                { texto: 'replies in *6 minutes*, on average' },
              ],
            },
          },
        },
        {
          id: 'exemplo-encomendas',
          indice: 'Orders and requests',
          rotulo: 'ORDERS AND REQUESTS',
          dor: 'Orders come in by phone and get written down on a piece of paper.',
          explicacao: 'Customers order on their own, through a portal with the price list of the day already in it. The order goes straight into picking, with nobody copying anything, and the phone stops ringing for this.',
          esquema: {
            descricao: 'Orders arriving through the portal, by WhatsApp, by email and through your ERP come together in one place and go straight into picking.',
            origens: [
              { id: 'portal', nome: 'Portal' },
              { id: 'whatsapp', nome: 'WhatsApp' },
              { id: 'email', nome: 'Email' },
              { id: 'erp', nome: 'Your ERP' },
            ],
            resumo: {
              titulo: 'Today, 9:00',
              linhas: [
                { texto: '37 orders received' },
                { texto: '0 calls answered' },
                { texto: 'all ready for loading' },
              ],
            },
          },
        },
        {
          id: 'exemplo-seguranca',
          indice: 'Backups and access',
          rotulo: 'BACKUPS AND ACCESS',
          dor: 'If the office computer dies today, what is lost?',
          explicacao: 'Backups start running and being checked on their own, access for people who leave is removed the same day, and every week you get a summary of what happened.',
          esquema: {
            descricao: 'The server, the computers, email and the cloud are watched from one place and produce a weekly summary.',
            origens: [
              { id: 'servidor', nome: 'Server' },
              { id: 'computadores', nome: 'Computers' },
              { id: 'email', nome: 'Email' },
              { id: 'nuvem', nome: 'Cloud' },
            ],
            resumo: {
              titulo: 'Week of 31/08 to 6/09',
              linhas: [
                { texto: '*7 of 7* backups made and checked' },
                { texto: '*1* access removed, left on 29/08' },
                { texto: '*1* failure resolved at *3:14*, with nobody noticing' },
              ],
            },
          },
        },
        {
          id: 'exemplo-stock',
          indice: 'Stock and purchasing',
          rotulo: 'STOCK AND PURCHASING',
          dor: 'The stock in the system says one thing and the warehouse says another.',
          explicacao: 'The ERP, the shop and the carrier portal start talking to each other. Differences show up on a list in the morning, instead of showing up to the customer at delivery time.',
          esquema: {
            descricao: 'Your ERP, the online shop, the carrier portal and Excel start talking to each other and produce a list of discrepancies.',
            origens: [
              { id: 'erp', nome: 'Your ERP' },
              { id: 'loja', nome: 'Online shop' },
              { id: 'transporte', nome: 'Carrier' },
              { id: 'excel', nome: 'Excel' },
            ],
            resumo: {
              titulo: 'Today, 6:05',
              linhas: [
                { texto: '5 487 references checked' },
                { texto: '12 discrepancies, 9 corrected on their own' },
                { texto: '3 need a decision' },
              ],
            },
          },
        },
        {
          id: 'exemplo-numeros',
          indice: 'Business numbers',
          rotulo: 'BUSINESS NUMBERS',
          dor: 'You only know whether the month went well once the accountant closes the books.',
          explicacao: 'The numbers scattered across four systems come together in one place and arrive by email on Monday morning. Nobody rebuilds spreadsheets at the end of the month.',
          esquema: {
            descricao: 'Your ERP, invoicing, the online shop and Excel come together in one place and produce a weekly summary by email.',
            origens: [
              { id: 'erp', nome: 'Your ERP' },
              { id: 'faturacao', nome: 'Invoicing' },
              { id: 'loja', nome: 'Online shop' },
              { id: 'excel', nome: 'Excel' },
            ],
            resumo: {
              titulo: 'Week 37',
              linhas: [
                { texto: 'average margin *21%*, *3 points* below last week' },
                { texto: '4 products losing money' },
                { texto: '3 customers over their credit limit' },
              ],
            },
          },
        },
      ],
      convite: {
        frase: 'Not seeing your situation? Most of what we do looks like this.',
        botao: 'Talk to us',
      },
      tira: {
        texto: 'We integrate with',
        ferramentas: [
          { id: 'gmail', nome: 'Gmail' },
          { id: 'outlook', nome: 'Outlook' },
          { id: 'excel', nome: 'Excel' },
          { id: 'google-sheets', nome: 'Google Sheets' },
          { id: 'primavera', nome: 'Cegid Primavera' },
          { id: 'moloni', nome: 'Moloni' },
          { id: 'invoicexpress', nome: 'InvoiceXpress' },
          { id: 'shopify', nome: 'Shopify' },
          { id: 'woocommerce', nome: 'WooCommerce' },
        ],
      },
    },
    services: {
      subtitle: 'What we do',
      title: 'Our ',
      titleHighlight: 'Services',
      description: 'Less manual work, information that flows, and someone to call when you need it.',
      items: [
        {
          id: 'servico-automacao',
          icon: 'ciclo',
          title: 'Administrative work automation',
          description: 'Orders, invoicing, monthly reports and sending files to the accountant no longer need someone to type them by hand.',
        },
        {
          id: 'servico-sistemas',
          icon: 'elo',
          title: 'Information systems and integrations',
          description: 'Your ERP, online shop, spreadsheets and carrier portals start to talk to each other, so nobody rewrites the same thing in three places.',
        },
        {
          id: 'servico-ia',
          icon: 'brain',
          title: 'Artificial intelligence applied to business',
          description: 'We use AI where it truly solves something: reading emails and documents, sorting requests and drafting replies.',
        },
        {
          id: 'servico-web',
          icon: 'code',
          title: 'Websites and channels to reach customers',
          description: 'A website, request forms that replace dozens of emails, and pages where customers check the status of their order on their own.',
        },
        {
          id: 'servico-dados',
          icon: 'chart',
          title: 'Data and reporting',
          description: 'The numbers you need to see every week, without anyone rebuilding tables at the end of the month.',
        },
        {
          id: 'servico-seguranca',
          icon: 'shield',
          title: 'Security, cloud and ongoing support',
          description: 'What we build stays hosted securely and looked after by us, with backups, controlled access and someone to call when something fails.',
        },
      ],
    },
    process: {
      subtitle: 'How we work',
      title: 'From the first day until ',
      titleHighlight: 'it runs on its own',
      steps: [
        {
          number: '01',
          keyword: 'Discovery',
          description: 'We look in detail at how the work runs today. From that comes a report with what can change and what that brings to the company.',
        },
        {
          number: '02',
          keyword: 'Planning',
          description: 'We tell you what we will do, what it costs and how long it takes, before we start. The price we agree on is the price that stands, with no surprises along the way.',
        },
        {
          number: '03',
          keyword: 'Development',
          description: 'We build it in parts and you see it working before everything is finished, so whatever needs correcting is caught early.',
        },
        {
          number: '04',
          keyword: 'Ongoing support',
          description: 'It keeps running and we stay close by, with someone to call when you need it.',
        },
      ],
    },
    contact: {
      subtitle: "Let's talk",
      title: 'Get in ',
      titleHighlight: 'Touch',
      description: 'Fill in the form below and our team will get back to you within one business day.',
      form: {
        name: 'First and Last Name',
        namePlaceholder: 'John Smith',
        email: 'Email',
        emailPlaceholder: 'youremail@example.com',
        phone: 'Phone',
        phonePlaceholder: '+351 912 345 678',
        phoneHint: 'Accepts the + sign and any country code, for example +351 912 345 678.',
        company: 'Company',
        companyPlaceholder: 'Your company name',
        source: 'How did you hear about us?',
        sourcePlaceholder: 'Please Select',
        sourceOptions: [
          'Online Search',
          'LinkedIn',
          'Event or Conference',
          'News Article or Press Coverage',
          'Friend or Colleague Recommendation',
          'Already a client',
          'Direct contact from NEXUGAL',
          // "Other" must stay last: the form identifies it by the list's final
          // position in order to open the free-text box.
          'Other',
        ],
        sourceError: 'Please select an option so we can continue.',
        sourceOtherPlaceholder: 'Tell us where you found us',
        sourceOtherError: 'Please tell us where you found us.',
        messageOptional: 'Message (optional)',
        messageAutoPrefix: 'Contact request. Heard about us through: ',
        messagePlaceholder: 'Briefly describe your project or need...',
        submit: 'Send Message',
        sending: 'Sending...',
        success: 'Message sent successfully! We will get in touch soon.',
      },
      back: 'Back to home',
      logo: 'NEXUGAL, go to the home page',
    },
    about: {
      subtitle: 'Who we are',
      title: 'About ',
      titleHighlight: 'NEXUGAL',
      description: 'Our team helps companies take out the manual work nobody enjoys doing and get information moving between people and systems. No endless projects, no more technology than the job needs.',
      founders: {
        intro: 'Our founders hold degrees in Information Systems Engineering and Management from the University of Minho. That is where our way of working comes from, with an eye on the process and on the technology at the same time.',
        photoAlt: 'Photo of ',
        linkedinLabel: 'LinkedIn profile of ',
        people: [
          {
            id: 'rui',
            name: 'Rui Machado',
            role: 'Founding partner',
            description: 'He runs e-commerce stores in several countries, and that is where he built his first automations, from customer replies to invoicing and shipping. He brings the method of someone who has already solved these problems in his own company, before solving them for others.',
          },
          {
            id: 'henrique',
            name: 'Henrique Fernandes',
            role: 'Founding partner',
            description: 'He worked as a freelancer for more than 80 clients across various sectors, building custom software and automating processes. He brings the technical side of NEXUGAL, the part about taking a complicated process and turning it into something simple to use day to day.',
          },
        ],
      },
    },
    faq: {
      subtitle: 'Frequently Asked Questions',
      title: 'Common ',
      titleHighlight: 'Questions',
      description: 'Find answers to the most common questions about our services, processes and ways of working.',
      back: '← Back to home',
      items: [
        {
          question: 'What type of services does NEXUGAL offer?',
          answer: 'We offer a complete range of technology services: web development (websites, applications and platforms), cybersecurity (audits, monitoring and data protection), cloud solutions (migration and management), artificial intelligence consulting, data analytics with customized dashboards, and continuous 24/7 technical support.',
        },
        {
          question: 'How long does a web development project take?',
          answer: 'The timeframe varies depending on the complexity of the project. A corporate website can be ready in 2 to 4 weeks, while a more complex web application can take between 2 to 6 months. During the discovery phase, we tell you what is ready at each stage and when.',
        },
        {
          question: 'How does NEXUGAL\'s work process function?',
          answer: 'Our process has four stages. Discovery, we look in detail at how the work runs today, and from that comes a report with what can change and what that brings to the company. Planning, we tell you what we will do, what it costs and how long it takes, before we start. Development, we build it in parts and you see it working before everything is finished, so whatever needs correcting is caught early. Ongoing support, it keeps running and we stay close by, with someone to call when you need it.',
        },
        {
          question: 'What size companies does NEXUGAL work with?',
          answer: 'We work with companies of all sizes, from startups and SMEs to large corporations. Our solutions are customized to adapt to each client\'s needs and budget.',
        },
        {
          question: 'Do you offer support after project delivery?',
          answer: 'Yes! We offer continuous 24/7 technical support and proactive maintenance. After delivery, we monitor the solution\'s performance, apply security updates and fix whatever comes up.',
        },
        {
          question: 'What is the cost of your services?',
          answer: 'Each project is unique, so the cost depends on the specific requirements, complexity and desired timeline. We offer a free, no-obligation consultation where we present a personalized and transparent quote.',
        },
        {
          question: 'Is the initial consultation free?',
          answer: 'Yes, the first consultation is completely free and with no obligation. In it, we analyze your needs, present possible solutions and answer all your questions. You can schedule it through our contact form.',
        },
      ],
    },
    cta: {
      title_start: 'Ready for your company to ',
      title_highlight: 'run on its own',
      title_end: '?',
      description: 'We talk first, at no cost, to see whether there is work here to do.',
      button: 'Start a Conversation',
      note: 'No commitment. Reply within one business day.',
    },
    privacy: 'Privacy Policy',
    cookieBanner: {
      title: 'We respect your privacy',
      description: 'We use essential cookies to ensure the website works properly and, with your consent, we may use cookies for analytics and experience improvement. You can manage your preferences at any time.',
      acceptAll: 'Accept All',
      acceptEssential: 'Essential Only',
      learnMore: 'Privacy Policy',
      essentialOnly: 'Essential cookies only enabled',
    },
    footer: {
      brand: {
        name: 'NEXUGAL',
        tagline: 'Let your company run on its own. Less manual work, more time for what matters.',
      },
      contact: {
        title: 'Contact',
        email: 'geral@nexugal.com',
        phone: '+351 912 423 912',
        address: 'Braga, Portugal',
      },
      links: {
        title: 'Quick Links',
        items: [
          { label: 'Home', href: '#home' },
          { label: 'Examples', href: '#exemplos' },
          { label: 'How we work', href: '#processo' },
          { label: 'About', href: '/us/about' },
        ],
      },
      legalLinks: [
        { label: 'Privacy Policy', href: '/us/privacy' },
        { label: 'Cookie Policy', href: '/us/privacy#cookies' },
      ],
      services: {
        title: 'Services',
      },
      social: {
        title: 'Social Media',
      },
      copyright: '© {year} NEXUGAL. All rights reserved.',
      madeWith: 'Made with cutting-edge technology in',
      location: 'Portugal',
    },
    chatbot: {
      welcome: 'Hello! 👋 I\'m NEXUGAL\'s virtual assistant. How can I help you today?',
      placeholder: 'Type your message...',
      send: 'Send message',
      close: 'Close chat',
      open: 'Open chat',
      title: 'Virtual Assistant',
      subtitle: 'NEXUGAL',
    },
  },
};

export default translations;
