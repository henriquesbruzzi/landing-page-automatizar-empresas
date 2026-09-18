import React from 'react';
import { Helmet } from 'react-helmet-async';
import translations from '../i18n/translations';

/**
 * Componente SEO reutilizável: etiquetas do cabeçalho por página, mais JSON-LD.
 *
 * Props:
 *  - lang: 'pt' | 'en'
 *  - page: 'home' | 'contact' | 'faq' | 'about' | 'privacy'
 *
 * Cada etiqueta tem UM só sítio que a escreve. Quando havia dois (o
 * public/index.html e a biblioteca), cada página ficava com dois canonical, duas
 * descrições e hreflang a dizer coisas diferentes.
 *
 * - public/index.html: título, descrição e etiquetas de partilha (og:, twitter:)
 *   da página inicial em português. Ficam lá porque o WhatsApp e as redes sociais
 *   não correm JavaScript e só leem esse ficheiro. Não tem canonical nem hreflang:
 *   o ficheiro é o mesmo para todas as páginas, e lá só podiam estar errados.
 * - O efeito, mais abaixo: reescreve essas mesmas etiquetas com os valores da
 *   página em que se está, e cria o canonical.
 * - A biblioteca (Helmet): só os hreflang e o JSON-LD, que não existem no
 *   public/index.html.
 *
 * Uma etiqueta nova entra num destes três sítios, e só num.
 */

const BASE_URL = process.env.REACT_APP_SITE_URL || 'https://www.nexugal.com';

// Dados SEO por idioma e página
const seoData = {
  pt: {
    // O título e a descrição da página inicial estão também escritos à mão no
    // public/index.html, que é o que o WhatsApp e as redes sociais leem. Mudar
    // aqui obriga a mudar lá.
    home: {
      title: 'Nexugal',
      description: 'Reformulação de operações com gestão implementada',
      canonical: `${BASE_URL}/`,
      alternate: `${BASE_URL}/us`,
      ogLocale: 'pt_PT',
    },
    contact: {
      title: 'Contacto, Nexugal | Fale Connosco',
      description:
        'Entre em contacto com a Nexugal. Preencha o formulário e a nossa equipa responde em 24 horas.',
      canonical: `${BASE_URL}/contacto`,
      alternate: `${BASE_URL}/us/contact`,
      ogLocale: 'pt_PT',
    },
    faq: {
      title: 'FAQ, Nexugal | Perguntas frequentes sobre automação de processos',
      description:
        'Respostas às perguntas mais frequentes sobre os serviços da Nexugal: desenvolvimento web, cibersegurança, cloud, IA, prazos, custos e suporte.',
      canonical: `${BASE_URL}/faq`,
      alternate: `${BASE_URL}/us/faq`,
      ogLocale: 'pt_PT',
    },
    about: {
      title: 'Sobre nós, Nexugal | Sistemas que falam entre si',
      description:
        'Conheça a Nexugal: quem somos, a nossa visão e a nossa paixão por transformar empresas através da tecnologia, cibersegurança e inovação.',
      canonical: `${BASE_URL}/sobre`,
      alternate: `${BASE_URL}/us/about`,
      ogLocale: 'pt_PT',
    },
    privacy: {
      title: 'Política de Privacidade, Nexugal | Proteção de Dados e RGPD',
      description:
        'Política de Privacidade da Nexugal. Saiba como recolhemos, tratamos e protegemos os seus dados pessoais em conformidade com o RGPD.',
      canonical: `${BASE_URL}/privacidade`,
      alternate: `${BASE_URL}/us/privacy`,
      ogLocale: 'pt_PT',
    },
  },
  en: {
    home: {
      title: 'Nexugal',
      description: 'Operations redesign with management put in place',
      canonical: `${BASE_URL}/us`,
      alternate: `${BASE_URL}/`,
      ogLocale: 'en_US',
    },
    contact: {
      title: 'Contact, Nexugal | Get in Touch',
      description:
        'Get in touch with Nexugal. Fill out the form and our team will respond within 24 hours.',
      canonical: `${BASE_URL}/us/contact`,
      alternate: `${BASE_URL}/contacto`,
      ogLocale: 'en_US',
    },
    faq: {
      title: 'FAQ, Nexugal | Frequently asked questions about process automation',
      description:
        'Answers to frequently asked questions about Nexugal services: web development, cybersecurity, cloud, AI, timelines, costs and support.',
      canonical: `${BASE_URL}/us/faq`,
      alternate: `${BASE_URL}/faq`,
      ogLocale: 'en_US',
    },
    about: {
      title: 'About us, Nexugal | Systems that talk to each other',
      description:
        'Meet Nexugal: who we are, our vision and our passion for transforming businesses through technology, cybersecurity, and innovation.',
      canonical: `${BASE_URL}/us/about`,
      alternate: `${BASE_URL}/sobre`,
      ogLocale: 'en_US',
    },
    privacy: {
      title: 'Privacy Policy, Nexugal | Data Protection & GDPR',
      description:
        'Nexugal Privacy Policy. Learn how we collect, process and protect your personal data in compliance with GDPR.',
      canonical: `${BASE_URL}/us/privacy`,
      alternate: `${BASE_URL}/privacidade`,
      ogLocale: 'en_US',
    },
  },
};

// Texto alternativo da imagem de partilha. A versão portuguesa está também
// escrita à mão no public/index.html (og:image:alt e twitter:image:alt).
const ALT_IMAGEM = {
  pt: 'Menos tarefas repetidas. Mais tempo para o que importa.',
  en: 'Fewer repetitive tasks. More time for what matters.',
};

// Schema.org JSON-LD — Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Nexugal',
  url: BASE_URL,
  logo: `${BASE_URL}/icons/favicon.png`,
  description:
    'Consultoria tecnológica especializada em desenvolvimento web, cibersegurança, soluções na nuvem, inteligência artificial e análise de dados.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Braga',
    addressCountry: 'PT',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+351912423912',
    email: 'geral@nexugal.com',
    contactType: 'customer service',
    availableLanguage: ['Portuguese', 'English'],
  },
  sameAs: [
    'https://www.linkedin.com/company/nexugal',
    'https://www.instagram.com/nexugal',
  ],
};

// Schema.org JSON-LD — WebSite (ativa sitelinks no Google)
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Nexugal',
  url: BASE_URL,
  inLanguage: ['pt-PT', 'en-US'],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// Schema.org JSON-LD — LocalBusiness (SEO local)
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Nexugal',
  image: `${BASE_URL}/icons/favicon.png`,
  url: BASE_URL,
  telephone: '+351912423912',
  email: 'geral@nexugal.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Braga',
    addressRegion: 'Braga',
    addressCountry: 'PT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.5518,
    longitude: -8.4229,
  },
  priceRange: '$$',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
  // Sem areaServed, de propósito: a Nexugal não declara limite geográfico
  // nenhum. Não voltar a pôr países nem regiões.
  serviceType: [
    'Desenvolvimento Web',
    'Cibersegurança',
    'Soluções na Nuvem',
    'Consultoria em IA',
    'Análise de Dados',
    'Suporte e Manutenção',
  ],
};

// Schema.org JSON-LD — BreadcrumbList
function getBreadcrumbs(lang, page) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: lang === 'pt' ? `${BASE_URL}/` : `${BASE_URL}/us`,
    },
  ];

  if (page === 'contact') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: lang === 'pt' ? 'Contacto' : 'Contact',
      item: lang === 'pt' ? `${BASE_URL}/contacto` : `${BASE_URL}/us/contact`,
    });
  }

  if (page === 'faq') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'FAQ',
      item: lang === 'pt' ? `${BASE_URL}/faq` : `${BASE_URL}/us/faq`,
    });
  }

  if (page === 'about') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: lang === 'pt' ? 'Sobre Nós' : 'About Us',
      item: lang === 'pt' ? `${BASE_URL}/sobre` : `${BASE_URL}/us/about`,
    });
  }

  if (page === 'privacy') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: lang === 'pt' ? 'Privacidade' : 'Privacy',
      item: lang === 'pt' ? `${BASE_URL}/privacidade` : `${BASE_URL}/us/privacy`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

// Schema.org — Service (para página home)
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Serviços Nexugal',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Service',
        name: 'Desenvolvimento Web',
        description:
          'Aplicações web modernas, responsivas e de alto desempenho com as tecnologias mais recentes do mercado.',
        provider: { '@type': 'Organization', name: 'Nexugal' },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Service',
        name: 'Cibersegurança',
        description:
          'Proteção completa dos seus dados e infraestrutura com auditorias, monitorização e estratégias avançadas de segurança.',
        provider: { '@type': 'Organization', name: 'Nexugal' },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Service',
        name: 'Soluções na Nuvem',
        description:
          'Migração, gestão e otimização de infraestrutura em nuvem para máxima escalabilidade e disponibilidade.',
        provider: { '@type': 'Organization', name: 'Nexugal' },
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Service',
        name: 'Consultoria em IA',
        description:
          'Integração de inteligência artificial e automação nos seus processos para aumentar a eficiência operacional.',
        provider: { '@type': 'Organization', name: 'Nexugal' },
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'Service',
        name: 'Análise de Dados',
        description:
          'Transforme dados em decisões estratégicas com painéis inteligentes e relatórios personalizados.',
        provider: { '@type': 'Organization', name: 'Nexugal' },
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'Service',
        name: 'Suporte e Manutenção',
        description:
          'Suporte técnico contínuo 24/7 e manutenção proativa para manter os seus sistemas sempre operacionais.',
        provider: { '@type': 'Organization', name: 'Nexugal' },
      },
    },
  ],
};

// Schema.org JSON-LD, FAQPage (rich results no Google)
//
// As perguntas vêm do translations.js, que é onde vive o texto do site. Já
// estiveram escritas aqui outra vez, à mão, e as duas cópias afastaram-se: o
// ecrã dizia uma coisa e o Google era informado de outra. Uma fonte só.
function getFaqSchema(lang) {
  const items = (translations[lang] || translations.pt).faq.items;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function SEO({ lang = 'pt', page = 'home' }) {
  const data = seoData[lang]?.[page] || seoData.pt.home;
  const htmlLang = lang === 'pt' ? 'pt-PT' : 'en-US';
  const altLang = lang === 'pt' ? 'en' : 'pt';

  // Compor todos os schemas JSON-LD
  const schemas = [organizationSchema, websiteSchema, localBusinessSchema, getBreadcrumbs(lang, page)];
  if (page === 'home') {
    schemas.push(serviceSchema);
  }
  if (page === 'faq') {
    schemas.push(getFaqSchema(lang));
  }

  // A versão portuguesa de cada página é a de omissão (x-default). Apontava
  // sempre para a página inicial, mesmo na FAQ, e o Google só aceita o x-default
  // se a página para onde aponta também apontar de volta.
  const versaoPortuguesa = lang === 'pt' ? data.canonical : data.alternate;

  // Efeito direto no DOM. Não depende da biblioteca, que só escreve quando o
  // browser desenha o ecrã seguinte (num separador escondido, nunca). Reescreve
  // as etiquetas que já vêm no public/index.html e cria o canonical.
  React.useEffect(() => {
    document.title = data.title;
    document.documentElement.lang = htmlLang;

    const setMeta = (attr, attrValue, content) => {
      let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    setMeta('name', 'description', data.description);
    setLink('canonical', data.canonical);
    setMeta('property', 'og:title', data.title);
    setMeta('property', 'og:description', data.description);
    setMeta('property', 'og:url', data.canonical);
    setMeta('property', 'og:locale', data.ogLocale);
    setMeta('property', 'og:locale:alternate', lang === 'pt' ? 'en_US' : 'pt_PT');
    setMeta('property', 'og:image:alt', ALT_IMAGEM[lang] || ALT_IMAGEM.pt);
    setMeta('name', 'twitter:title', data.title);
    setMeta('name', 'twitter:description', data.description);
    setMeta('name', 'twitter:image:alt', ALT_IMAGEM[lang] || ALT_IMAGEM.pt);
  }, [data, htmlLang, lang]);

  // A biblioteca fica só com o que não existe no public/index.html. Tudo o que
  // lá existe (título, descrição, og:, twitter:, robots) é do efeito acima: se
  // a biblioteca também o escrevesse, ficava repetido.
  return (
    <Helmet>
      {/* Hreflang */}
      <link rel="alternate" hreflang={lang} href={data.canonical} />
      <link rel="alternate" hreflang={altLang} href={data.alternate} />
      <link rel="alternate" hreflang="x-default" href={versaoPortuguesa} />

      {/* JSON-LD Structured Data */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export default SEO;
