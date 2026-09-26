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
      // Uma frase só, de propósito. A anterior dava a entender que estava aqui
      // tudo o que a Nexugal faz, e não está.
      subtitulo: 'Alguns exemplos do que fazemos.',
      indiceTitulo: 'Saltar para',
      // Cada bloco tem o seu próprio desenho, moldado à história que conta. A
      // unidade vem da paleta, da letra e do estilo das caixas, não de serem
      // todos iguais. O esquema de setas ficou só no hero.
      //
      // O campo `visual` diz qual dos desenhos usar. Um bloco novo obriga a um
      // desenho novo: não há aqui um molde que sirva para tudo, e é de
      // propósito.
      blocos: [
        {
          id: 'exemplo-faturacao',
          visual: 'papel',
          indice: 'Contabilidade e faturação',
          rotulo: 'CONTABILIDADE E FATURAÇÃO',
          dor: 'Alguém passa duas manhãs por mês a lançar faturas de fornecedor.',
          explicacao: 'Chegam por email, por WhatsApp e em papel. Passam a ser lidas e transformadas em dados sozinhas, e o que precisa mesmo de olhos fica numa lista curta.',
          arte: {
            descricao: 'Uma pilha de faturas em papel dá origem a uma tabela de dados já preenchida.',
            papelEtiqueta: 'FATURA',
            papelLegenda: 'Não interessa como chega, em PDF, em papel ou numa foto.',
            colunas: ['FORNECEDOR', 'DOC', 'VALOR'],
            linhas: [
              { fornecedor: 'Malhas do Ave', doc: 'FT 1184', valor: '1 240,00' },
              { fornecedor: 'Tintex', doc: 'FT A/9042', valor: '418,60' },
              { fornecedor: 'Fios e Cores', doc: 'FT 331', valor: '96,40' },
            ],
            // Duas linhas por preencher, desenhadas como barras: mostram que o
            // trabalho continua a andar depois de a imagem ficar parada.
            porPreencher: 2,
            // "sozinhas" é o argumento todo: sem essa palavra o 214 não prova nada
            resumo: { total: '214', totalTexto: 'faturas lançadas sozinhas em setembro,', rever: '3', reverTexto: 'precisaram de si' },
          },
        },
        {
          id: 'exemplo-pedidos',
          visual: 'conversa',
          indice: 'Pedidos de clientes',
          rotulo: 'PEDIDOS DE CLIENTES',
          dor: 'As mesmas cinco perguntas todos os dias, e as encomendas anotadas num papel.',
          explicacao: 'O que chega por email, por WhatsApp e pelo formulário é lido, cruzado com a encomenda, e a resposta fica escrita à espera de um clique. Nada sai sem alguém aprovar.',
          arte: {
            descricao: 'Uma pergunta de cliente e a resposta já escrita, ao lado do que o dia rendeu.',
            pergunta: 'Boa tarde, a minha encomenda 4471 ainda não chegou.',
            perguntaOrigem: 'cliente, WhatsApp, 14h02',
            resposta: 'Saiu do armazém ontem às 17h20, entrega prevista para amanhã, dia 10.',
            contadores: [
              { numero: '34', legenda: 'mensagens tratadas hoje' },
              { numero: '0', legenda: 'chamadas atendidas', realce: true },
            ],
            nota: '5 à espera de si',
          },
        },
        {
          id: 'exemplo-stock',
          visual: 'discordancia',
          indice: 'Stock e compras',
          rotulo: 'STOCK E COMPRAS',
          dor: 'O stock do programa diz uma coisa e o armazém diz outra.',
          explicacao: 'O ERP, a loja e o portal da transportadora passam a falar entre si. As diferenças aparecem numa lista de manhã, em vez de aparecerem ao cliente na hora de entregar.',
          arte: {
            descricao: 'O mesmo artigo com dois números diferentes, um no programa e outro na loja e armazém, e o resultado da verificação da manhã.',
            // Um artigo só, em grande. Quatro artigos obrigavam quem lia a
            // comparar número a número para encontrar a diferença.
            //
            // A ordem dos números é a da frase de baixo: o programa promete 19,
            // na prateleira há 12, e faltam sete. Ao contrário, as correias
            // existiam todas e a frase não tinha pé. O mesmo no bloco EN.
            colunas: ['NO PROGRAMA', 'NA LOJA/ARMAZÉM'],
            artigo: 'Correias',
            numeros: ['19', '12'],
            consequencia: 'Sete clientes iam comprar uma coisa que não existe.',
            cartao: {
              titulo: 'Hoje, 6h05',
              linhas: [
                { numero: '5 487', texto: 'referências verificadas', proprioBloco: true },
                { numero: '9', texto: 'corrigidas sozinhas' },
                { numero: '3', texto: 'precisam de decisão', destaque: true },
              ],
            },
          },
        },
        {
          id: 'exemplo-numeros',
          visual: 'margem',
          indice: 'Números do negócio',
          rotulo: 'NÚMEROS DO NEGÓCIO',
          dor: 'Só se sabe se o mês correu bem quando o contabilista fecha as contas.',
          explicacao: 'Os números que andam espalhados por quatro programas juntam-se num só e chegam por email na segunda de manhã. Ninguém refaz tabelas no fim do mês.',
          arte: {
            descricao: 'Margem por artigo na semana 37: quatro artigos acima de zero e um abaixo.',
            titulo: 'MARGEM POR ARTIGO, SEMANA 37',
            zero: '0%',
            // `valor` é o número que manda no comprimento da barra. Negativo
            // atravessa para a esquerda do zero e acende a cor de alerta.
            barras: [
              { nome: 'Filtros', valor: 38, etiqueta: '38%' },
              { nome: 'Correias', valor: 31, etiqueta: '31%' },
              { nome: 'Baterias', valor: 22, etiqueta: '22%' },
              { nome: 'Juntas', valor: 9, etiqueta: '9%' },
              { nome: 'Óleos', valor: -7, etiqueta: '-7%' },
            ],
            remate: 'Um artigo a dar prejuízo, e ninguém sabia.',
          },
        },
      ],
      convite: {
        frase: 'Tem tarefas que se repetem todas as semanas e comem tempo a alguém? Conte-nos qual é. Muitas vezes há forma de ganhar esse tempo.',
        botao: 'Entre em contacto',
      },
      // A tira cresce quando houver capacidade real de integrar mais uma coisa,
      // não se enche à partida. Cada entrada leva `logo` quando o ficheiro
      // existir, e passa a imagem sem a tira ser refeita.
      //
      // O Moloni fica como nome. O ficheiro que chegou tem as letras a branco,
      // é a versão para fundo escuro, e nesta tira branca só se via a flor.
      // Quando houver a versão para fundo claro, é acrescentar o `logo`.
      tira: {
        texto: 'Fazemos integrações com',
        ferramentas: [
          { id: 'gmail', nome: 'Gmail', logo: '/logos/gmail.svg' },
          { id: 'outlook', nome: 'Outlook', logo: '/logos/outlook.svg' },
          { id: 'excel', nome: 'Excel', logo: '/logos/excel.svg' },
          { id: 'google-sheets', nome: 'Google Sheets', logo: '/logos/google-sheets.svg' },
          { id: 'primavera', nome: 'Cegid Primavera', logo: '/logos/cegid.svg' },
          { id: 'moloni', nome: 'Moloni' },
          { id: 'invoicexpress', nome: 'InvoiceXpress', logo: '/logos/invoicexpress.png' },
          { id: 'shopify', nome: 'Shopify', logo: '/logos/shopify.svg' },
          { id: 'woocommerce', nome: 'WooCommerce', logo: '/logos/woocommerce.svg' },
        ],
      },
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
          'Contacto direto da Nexugal',
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
        // Avisos de recusa. Os quatro primeiros correspondem aos campos que o
        // backend valida, e são escolhidos pelo campo que ele aponta na
        // resposta. Os dois últimos cobrem uma recusa sem campo identificado e
        // uma falha de rede. Sem eles, o visitante via "[object Object]" ou
        // "Failed to fetch", que não dizem nada a ninguém.
        nameError: 'Escreva o seu nome, com pelo menos 2 letras.',
        emailError: 'Confirme o email: parece estar incompleto.',
        phoneError: 'Confirme o número de telefone.',
        // O "{email}" é trocado pelo endereço corrigido, que fica clicável
        emailSuggestion: 'Quis dizer {email}?',
        phoneDigitsError: 'O número não parece certo. Escreva os 9 dígitos, ou o número completo com o indicativo do país.',
        companyError: 'Confirme o nome da empresa.',
        messageError: 'A mensagem é facultativa, mas escrita tem de ter pelo menos 5 caracteres.',
        sendError: 'Não foi possível enviar a mensagem. Tente outra vez dentro de momentos.',
        networkError: 'Não foi possível falar com o servidor. Verifique a ligação à internet e tente outra vez.',
      },
      back: 'Voltar ao início',
      logo: 'Nexugal, ir para a página inicial',
    },
    about: {
      subtitle: 'Quem somos',
      title: 'Sobre a ',
      titleHighlight: 'Nexugal',
      // Um parágrafo por entrada, pela ordem em que aparecem
      historia: {
        titulo: 'Como começou',
        paragrafos: [
          'Novembro de 2025. A Nexugal começou por dar suporte a lojas online e, em menos de um ano, já trabalhava com lojas em mais de dez países, cada uma com a sua língua, moeda, fornecedores e parceiros.',
          'O problema era sempre o mesmo: trabalho manual a travar o crescimento. Algumas horas por dia só para fechar as contas. Emails de clientes a acumular, alguns vistos três dias depois. Cada encomenda nova trazia mais trabalho, não mais tempo.',
          'Automatizámos a contabilidade, o apoio ao cliente e a gestão de stock, entre outras coisas. As contas do dia passaram a fechar em cinco minutos e os clientes têm resposta sem ninguém estar a escrever email a email.',
          'O que resolvemos no comércio online resolve-se em qualquer empresa. Hoje ajudamos empresas de outros setores a tirar do meio o trabalho manual que ninguém gosta de fazer e a pôr a informação a circular entre as pessoas e os sistemas. Sem projetos intermináveis, sem tecnologia a mais do que a necessária.',
        ],
      },
      founders: {
        photoAlt: 'Fotografia de ',
        linkedinLabel: 'LinkedIn de ',
        people: [
          {
            id: 'rui',
            name: 'Rui Machado',
            role: 'Fundador',
            description: 'Licenciado em Engenharia e Gestão de Sistemas de Informação pela Universidade do Minho. Construiu as primeiras automações da Nexugal nas lojas online que acompanhamos desde novembro de 2025, da contabilidade ao apoio ao cliente e à gestão de stock.',
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
          question: 'Que tipo de serviços a Nexugal oferece?',
          answer: 'Oferecemos uma gama completa de serviços tecnológicos: desenvolvimento web (sites, aplicações e plataformas), cibersegurança (auditorias, monitorização e proteção de dados), soluções cloud (migração e gestão), consultoria em inteligência artificial, análise de dados com dashboards personalizados, e suporte técnico contínuo 24/7.',
        },
        {
          question: 'Quanto tempo demora um projeto de desenvolvimento web?',
          answer: 'O prazo varia conforme a complexidade do projeto. Um site institucional pode estar pronto em 2 a 4 semanas, enquanto uma aplicação web mais complexa pode levar entre 2 a 6 meses. Na fase de diagnóstico, dizemos o que fica pronto em cada etapa e quando.',
        },
        {
          question: 'Como funciona o processo de trabalho da Nexugal?',
          answer: 'O nosso processo tem quatro etapas. Diagnóstico, percebemos como o trabalho corre hoje, ao pormenor, e daí sai um relatório com o que pode mudar e o que isso traz à empresa. Planeamento, dizemos o que vamos fazer, quanto custa e em quanto tempo, antes de começarmos. Desenvolvimento, fazemos por partes e vai vendo a funcionar antes de estar tudo pronto, para se corrigir cedo o que for preciso. Acompanhamento, fica a funcionar e nós ficamos por perto, com alguém a quem ligar quando for preciso.',
        },
        {
          question: 'A Nexugal trabalha com empresas de que dimensão?',
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
        // {rede} fica com o nome da rede, por exemplo LinkedIn. Só é lido
        // por leitores de ecrã, no ícone de cada rede.
        aria: 'Nexugal no {rede}',
      },
      copyright: '© {year} Nexugal. Todos os direitos reservados.',
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
      subtitulo: 'Some examples of what we do.',
      indiceTitulo: 'Jump to',
      blocos: [
        {
          id: 'exemplo-faturacao',
          visual: 'papel',
          indice: 'Accounting and invoicing',
          rotulo: 'ACCOUNTING AND INVOICING',
          dor: 'Someone spends two mornings a month entering supplier invoices.',
          explicacao: 'They arrive by email, by WhatsApp and on paper. They start being read and turned into data on their own, and whatever really needs a human eye ends up on a short list.',
          arte: {
            descricao: 'A stack of paper invoices turns into a table of data that is already filled in.',
            papelEtiqueta: 'INVOICE',
            papelLegenda: 'It does not matter how it arrives, as a PDF, on paper or in a photo.',
            colunas: ['SUPPLIER', 'DOC', 'AMOUNT'],
            linhas: [
              { fornecedor: 'Malhas do Ave', doc: 'FT 1184', valor: '1 240,00' },
              { fornecedor: 'Tintex', doc: 'FT A/9042', valor: '418,60' },
              { fornecedor: 'Fios e Cores', doc: 'FT 331', valor: '96,40' },
            ],
            porPreencher: 2,
            resumo: { total: '214', totalTexto: 'invoices entered on their own in September,', rever: '3', reverTexto: 'needed you' },
          },
        },
        {
          id: 'exemplo-pedidos',
          visual: 'conversa',
          indice: 'Customer requests',
          rotulo: 'CUSTOMER REQUESTS',
          dor: 'The same five questions every day, and orders written down on a piece of paper.',
          explicacao: 'What arrives by email, by WhatsApp and through the form is read, matched against the order, and the reply is written and waiting for one click. Nothing goes out without someone approving it.',
          arte: {
            descricao: 'A customer question and the reply already written, next to what the day brought in.',
            pergunta: 'Good afternoon, my order 4471 still has not arrived.',
            perguntaOrigem: 'customer, WhatsApp, 14:02',
            resposta: 'It left the warehouse yesterday at 17:20, delivery expected tomorrow, the 10th.',
            contadores: [
              { numero: '34', legenda: 'messages handled today' },
              { numero: '0', legenda: 'calls answered', realce: true },
            ],
            nota: '5 waiting on you',
          },
        },
        {
          id: 'exemplo-stock',
          visual: 'discordancia',
          indice: 'Stock and purchasing',
          rotulo: 'STOCK AND PURCHASING',
          dor: 'The stock in the system says one thing and the warehouse says another.',
          explicacao: 'The ERP, the shop and the carrier portal start talking to each other. Differences show up on a list in the morning, instead of showing up to the customer at delivery time.',
          arte: {
            descricao: 'The same product with two different numbers, one in the system and one in the shop and warehouse, and the result of the morning check.',
            // O \u200B é um ponto de quebra invisível: lê-se "IN THE
            // SHOP/WAREHOUSE", mas a linha pode partir depois da barra. Sem
            // ele, o browser não parte ali, e a partir de 1280px
            // "SHOP/WAREHOUSE" saía 6px da coluna do número.
            colunas: ['IN THE SYSTEM', 'IN THE SHOP/\u200BWAREHOUSE'],
            artigo: 'Belts',
            numeros: ['19', '12'],
            consequencia: 'Seven customers were about to buy something that does not exist.',
            cartao: {
              titulo: 'Today, 6:05',
              linhas: [
                { numero: '5 487', texto: 'references checked', proprioBloco: true },
                { numero: '9', texto: 'corrected on their own' },
                { numero: '3', texto: 'need a decision', destaque: true },
              ],
            },
          },
        },
        {
          id: 'exemplo-numeros',
          visual: 'margem',
          indice: 'Business numbers',
          rotulo: 'BUSINESS NUMBERS',
          dor: 'You only know whether the month went well once the accountant closes the books.',
          explicacao: 'The numbers scattered across four systems come together in one place and arrive by email on Monday morning. Nobody rebuilds spreadsheets at the end of the month.',
          arte: {
            descricao: 'Margin per product in week 37: four products above zero and one below.',
            titulo: 'MARGIN PER PRODUCT, WEEK 37',
            zero: '0%',
            barras: [
              { nome: 'Filters', valor: 38, etiqueta: '38%' },
              { nome: 'Belts', valor: 31, etiqueta: '31%' },
              { nome: 'Batteries', valor: 22, etiqueta: '22%' },
              { nome: 'Gaskets', valor: 9, etiqueta: '9%' },
              { nome: 'Oils', valor: -7, etiqueta: '-7%' },
            ],
            remate: 'One product losing money, and nobody knew.',
          },
        },
      ],
      convite: {
        frase: 'Do you have tasks that repeat every week and eat up someone\'s time? Tell us which one. There is often a way to win that time back.',
        botao: 'Get in touch',
      },
      tira: {
        texto: 'We integrate with',
        ferramentas: [
          { id: 'gmail', nome: 'Gmail', logo: '/logos/gmail.svg' },
          { id: 'outlook', nome: 'Outlook', logo: '/logos/outlook.svg' },
          { id: 'excel', nome: 'Excel', logo: '/logos/excel.svg' },
          { id: 'google-sheets', nome: 'Google Sheets', logo: '/logos/google-sheets.svg' },
          { id: 'primavera', nome: 'Cegid Primavera', logo: '/logos/cegid.svg' },
          { id: 'moloni', nome: 'Moloni' },
          { id: 'invoicexpress', nome: 'InvoiceXpress', logo: '/logos/invoicexpress.png' },
          { id: 'shopify', nome: 'Shopify', logo: '/logos/shopify.svg' },
          { id: 'woocommerce', nome: 'WooCommerce', logo: '/logos/woocommerce.svg' },
        ],
      },
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
          'Direct contact from Nexugal',
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
        nameError: 'Please enter your name, with at least 2 letters.',
        emailError: 'Please check your email address: it looks incomplete.',
        phoneError: 'Please check the phone number.',
        emailSuggestion: 'Did you mean {email}?',
        phoneDigitsError: 'The number does not look right. Please enter the 9 digits, or the full number with the country code.',
        companyError: 'Please check the company name.',
        messageError: 'The message is optional, but if you write one it needs at least 5 characters.',
        sendError: 'We could not send your message. Please try again in a moment.',
        networkError: 'We could not reach the server. Please check your internet connection and try again.',
      },
      back: 'Back to home',
      logo: 'Nexugal, go to the home page',
    },
    about: {
      subtitle: 'Who we are',
      title: 'About ',
      titleHighlight: 'Nexugal',
      historia: {
        titulo: 'How it started',
        paragrafos: [
          'November 2025. Nexugal started out supporting online stores and, in less than a year, was already working with stores in more than ten countries, each with its own language, currency, suppliers and partners.',
          'The problem was always the same: manual work holding back growth. A few hours a day just to close the books. Customer emails piling up, some seen three days later. Every new order brought more work, not more time.',
          'We automated the accounting, customer support and stock management, among other things. The day\'s books now close in five minutes, and customers get an answer without anyone writing emails one by one.',
          'What we solved in online retail can be solved in any business. Today we help companies in other sectors take out the manual work nobody enjoys doing and get information moving between people and systems. No endless projects, no more technology than the job needs.',
        ],
      },
      founders: {
        photoAlt: 'Photo of ',
        linkedinLabel: 'LinkedIn profile of ',
        people: [
          {
            id: 'rui',
            name: 'Rui Machado',
            role: 'Founder',
            description: 'Degree in Information Systems Engineering and Management from the University of Minho. Built Nexugal\'s first automations in the online stores we have supported since November 2025, from accounting to customer support and stock management.',
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
          question: 'What type of services does Nexugal offer?',
          answer: 'We offer a complete range of technology services: web development (websites, applications and platforms), cybersecurity (audits, monitoring and data protection), cloud solutions (migration and management), artificial intelligence consulting, data analytics with customized dashboards, and continuous 24/7 technical support.',
        },
        {
          question: 'How long does a web development project take?',
          answer: 'The timeframe varies depending on the complexity of the project. A corporate website can be ready in 2 to 4 weeks, while a more complex web application can take between 2 to 6 months. During the discovery phase, we tell you what is ready at each stage and when.',
        },
        {
          question: 'How does Nexugal\'s work process function?',
          answer: 'Our process has four stages. Discovery, we look in detail at how the work runs today, and from that comes a report with what can change and what that brings to the company. Planning, we tell you what we will do, what it costs and how long it takes, before we start. Development, we build it in parts and you see it working before everything is finished, so whatever needs correcting is caught early. Ongoing support, it keeps running and we stay close by, with someone to call when you need it.',
        },
        {
          question: 'What size companies does Nexugal work with?',
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
        aria: 'Nexugal on {rede}',
      },
      copyright: '© {year} Nexugal. All rights reserved.',
    },
  },
};

export default translations;
