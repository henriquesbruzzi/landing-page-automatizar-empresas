import React from 'react';
import { Helmet } from 'react-helmet-async';
import translations from '../i18n/translations';

/**
 * Componente SEO reutilizável — gere meta tags dinâmicas + JSON-LD
 *
 * Props:
 *  - lang: 'pt' | 'en'
 *  - page: 'home' | 'contact' | 'faq'
 */

const BASE_URL = process.env.REACT_APP_SITE_URL || 'https://www.nexugal.com';

// Dados SEO por idioma e página
const seoData = {
  pt: {
    home: {
      title: 'NEXUGAL, Consultoria Tecnológica | Desenvolvimento Web, Cibersegurança & Cloud',
      description:
        'NEXUGAL, consultoria tecnológica em Braga, Portugal. Especialistas em desenvolvimento web, cibersegurança, soluções cloud, inteligência artificial e análise de dados. Transformação digital para a sua empresa.',
      canonical: `${BASE_URL}/`,
      alternate: `${BASE_URL}/us`,
      ogLocale: 'pt_PT',
    },
    contact: {
      title: 'Contacto, NEXUGAL | Fale Connosco',
      description:
        'Entre em contacto com a NEXUGAL. Preencha o formulário e a nossa equipa responde em 24 horas. Consultoria tecnológica em Braga, Portugal.',
      canonical: `${BASE_URL}/contacto`,
      alternate: `${BASE_URL}/us/contact`,
      ogLocale: 'pt_PT',
    },
    faq: {
      title: 'FAQ, NEXUGAL | Perguntas Frequentes sobre Consultoria Tecnológica',
      description:
        'Respostas às perguntas mais frequentes sobre os serviços da NEXUGAL: desenvolvimento web, cibersegurança, cloud, IA, prazos, custos e suporte.',
      canonical: `${BASE_URL}/faq`,
      alternate: `${BASE_URL}/us/faq`,
      ogLocale: 'pt_PT',
    },
    about: {
      title: 'Sobre Nós, NEXUGAL | Consultoria Tecnológica e Transformação Digital',
      description:
        'Conheça a NEXUGAL: quem somos, a nossa visão e a nossa paixão por transformar empresas através da tecnologia, cibersegurança e inovação.',
      canonical: `${BASE_URL}/sobre`,
      alternate: `${BASE_URL}/us/about`,
      ogLocale: 'pt_PT',
    },
    privacy: {
      title: 'Política de Privacidade, NEXUGAL | Proteção de Dados e RGPD',
      description:
        'Política de Privacidade da NEXUGAL. Saiba como recolhemos, tratamos e protegemos os seus dados pessoais em conformidade com o RGPD.',
      canonical: `${BASE_URL}/privacidade`,
      alternate: `${BASE_URL}/us/privacy`,
      ogLocale: 'pt_PT',
    },
  },
  en: {
    home: {
      title: 'NEXUGAL, Technology Consulting | Web Development, Cybersecurity & Cloud',
      description:
        'NEXUGAL, technology consultancy in Braga, Portugal. Experts in web development, cybersecurity, cloud solutions, artificial intelligence and data analytics. Digital transformation for your business.',
      canonical: `${BASE_URL}/us`,
      alternate: `${BASE_URL}/`,
      ogLocale: 'en_US',
    },
    contact: {
      title: 'Contact, NEXUGAL | Get in Touch',
      description:
        'Get in touch with NEXUGAL. Fill out the form and our team will respond within 24 hours. Technology consultancy in Braga, Portugal.',
      canonical: `${BASE_URL}/us/contact`,
      alternate: `${BASE_URL}/contacto`,
      ogLocale: 'en_US',
    },
    faq: {
      title: 'FAQ, NEXUGAL | Frequently Asked Questions about Technology Consulting',
      description:
        'Answers to frequently asked questions about NEXUGAL services: web development, cybersecurity, cloud, AI, timelines, costs and support.',
      canonical: `${BASE_URL}/us/faq`,
      alternate: `${BASE_URL}/faq`,
      ogLocale: 'en_US',
    },
    about: {
      title: 'About Us, NEXUGAL | Technology Consulting & Digital Transformation',
      description:
        'Meet NEXUGAL: who we are, our vision and our passion for transforming businesses through technology, cybersecurity, and innovation.',
      canonical: `${BASE_URL}/us/about`,
      alternate: `${BASE_URL}/sobre`,
      ogLocale: 'en_US',
    },
    privacy: {
      title: 'Privacy Policy, NEXUGAL | Data Protection & GDPR',
      description:
        'NEXUGAL Privacy Policy. Learn how we collect, process and protect your personal data in compliance with GDPR.',
      canonical: `${BASE_URL}/us/privacy`,
      alternate: `${BASE_URL}/privacidade`,
      ogLocale: 'en_US',
    },
  },
};

// Schema.org JSON-LD — Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NEXUGAL',
  url: BASE_URL,
  logo: `${BASE_URL}/icons/favicon.png`,
  description:
    'Consultoria tecnológica especializada em desenvolvimento web, cibersegurança, soluções cloud, inteligência artificial e análise de dados.',
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
  name: 'NEXUGAL',
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
  name: 'NEXUGAL',
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
  areaServed: [
    { '@type': 'Country', name: 'Portugal' },
    { '@type': 'Country', name: 'Brazil' },
  ],
  serviceType: [
    'Web Development',
    'Cybersecurity',
    'Cloud Solutions',
    'AI Consulting',
    'Data Analytics',
    'IT Support & Maintenance',
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
  name: 'Serviços NEXUGAL',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Service',
        name: 'Desenvolvimento Web',
        description:
          'Aplicações web modernas, responsivas e de alta performance com as tecnologias mais recentes do mercado.',
        provider: { '@type': 'Organization', name: 'NEXUGAL' },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Service',
        name: 'Cibersegurança',
        description:
          'Proteção completa dos seus dados e infraestrutura com auditorias, monitoramento e estratégias avançadas de segurança.',
        provider: { '@type': 'Organization', name: 'NEXUGAL' },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Service',
        name: 'Soluções Cloud',
        description:
          'Migração, gestão e otimização de infraestrutura em nuvem para máxima escalabilidade e disponibilidade.',
        provider: { '@type': 'Organization', name: 'NEXUGAL' },
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
        provider: { '@type': 'Organization', name: 'NEXUGAL' },
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'Service',
        name: 'Análise de Dados',
        description:
          'Transforme dados em decisões estratégicas com dashboards inteligentes e relatórios personalizados.',
        provider: { '@type': 'Organization', name: 'NEXUGAL' },
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'Service',
        name: 'Suporte & Manutenção',
        description:
          'Suporte técnico contínuo 24/7 e manutenção proativa para manter os seus sistemas sempre operacionais.',
        provider: { '@type': 'Organization', name: 'NEXUGAL' },
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

  // Efeito direto no DOM como garantia síncrona de atualização de título e metas
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
    setMeta('name', 'twitter:title', data.title);
    setMeta('name', 'twitter:description', data.description);
  }, [data, htmlLang]);

  return (
    <Helmet>
      {/* Idioma do HTML */}
      <html lang={htmlLang} />

      {/* Título e Description */}
      <title>{data.title}</title>
      <meta name="description" content={data.description} />

      {/* Canonical & Hreflang */}
      <link rel="canonical" href={data.canonical} />
      <link rel="alternate" hreflang={lang} href={data.canonical} />
      <link rel="alternate" hreflang={altLang} href={data.alternate} />
      <link rel="alternate" hreflang="x-default" href={`${BASE_URL}/`} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="NEXUGAL" />
      <meta property="og:title" content={data.title} />
      <meta property="og:description" content={data.description} />
      <meta property="og:url" content={data.canonical} />
      <meta property="og:image" content={`${BASE_URL}/images/og-image.png`} />
      <meta property="og:image:secure_url" content={`${BASE_URL}/images/og-image.png`} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="NEXUGAL, Codificando o Amanhã da sua Empresa" />
      <meta property="og:locale" content={data.ogLocale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={data.title} />
      <meta name="twitter:description" content={data.description} />
      <meta name="twitter:image" content={`${BASE_URL}/images/og-image.png`} />

      {/* Robots */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

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
