import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { pedirDestaque } from '../utils/destaqueServico';

// ---------------------------------------------------------------------------
// A PREENCHER quando as contas existirem
// ---------------------------------------------------------------------------

// Endereço completo de cada rede, por exemplo
// 'https://www.linkedin.com/company/nexugal'. Enquanto estiver vazio, o ícone
// dessa rede não aparece no rodapé. Sem nenhum preenchido, some o bloco todo.
const REDES = {
  linkedin: '',
  instagram: '',
  facebook: '',
};

// ---------------------------------------------------------------------------

const ICONES_REDES = {
  linkedin: {
    nome: 'LinkedIn',
    caminho: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  instagram: {
    nome: 'Instagram',
    caminho: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  facebook: {
    nome: 'Facebook',
    caminho: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z',
  },
};

function Footer() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const f = t.footer;
  const redes = Object.keys(ICONES_REDES).filter((rede) => REDES[rede]);

  return (
    <footer className="relative bg-black pt-20 pb-8 overflow-hidden">
      {/* Linha divisória gradient no topo */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent"></div>

      {/* Glow decorativo de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-cyan-neon/[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 relative z-10">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Coluna 1 — Brand */}
          <div className="lg:col-span-1">
            <a href="#home" className="font-orbitron text-cyan-neon text-2xl font-bold tracking-[0.2em] hover:text-white transition-colors duration-300 block mb-4">
              {f.brand.name}
            </a>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {f.brand.tagline}
            </p>

            {/* Redes Sociais: cada ícone só aparece depois de a constante
                REDES lá em cima ter o endereço dessa rede. */}
            {redes.length > 0 && (
              <div>
                <span className="font-orbitron text-white/80 text-[11px] font-semibold tracking-[0.2em] uppercase block mb-4">
                  {f.social.title}
                </span>
                <div className="flex items-center gap-3">
                  {redes.map((rede) => (
                    <a
                      key={rede}
                      href={REDES[rede]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ICONES_REDES[rede].nome}
                      className="w-10 h-10 rounded-xl border border-white/20 bg-white/[0.05] flex items-center justify-center text-white/80 hover:text-cyan-neon hover:border-cyan-neon hover:shadow-[0_0_15px_rgba(0,209,255,0.2)] transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d={ICONES_REDES[rede].caminho} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna 2 — Links Rápidos */}
          <nav aria-label="Links rápidos">
            <h4 className="font-orbitron text-white text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              {f.links.title}
            </h4>
            <ul className="space-y-3">
              {f.links.items.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 text-sm hover:text-cyan-neon transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon/60 group-hover:bg-cyan-neon transition-colors duration-300"></span>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate(lang === 'pt' ? '/faq' : '/us/faq')}
                  className="text-gray-300 text-sm hover:text-cyan-neon transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon/60 group-hover:bg-cyan-neon transition-colors duration-300"></span>
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
                  className="text-cyan-neon text-sm font-medium hover:text-cyan-neon/80 transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon group-hover:bg-cyan-neon transition-colors duration-300"></span>
                  {lang === 'pt' ? 'Contacto' : 'Contact'}
                </button>
              </li>
            </ul>
          </nav>

          {/* Coluna 3 — Serviços */}
          <div>
            <h4 className="font-orbitron text-white text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              {f.services.title}
            </h4>
            <ul className="space-y-3">
              {f.services.items.map((servico) => (
                <li key={servico.id}>
                  <a
                    href={`#${servico.id}`}
                    onClick={() => pedirDestaque(servico.id)}
                    className="text-gray-300 text-sm hover:text-cyan-neon transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon/60 group-hover:bg-cyan-neon transition-colors duration-300"></span>
                    {servico.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4 — Contacto */}
          <div>
            <h4 className="font-orbitron text-white text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              {f.contact.title}
            </h4>
            <ul className="space-y-4">
              {/* Email */}
              <li>
                <a
                  href={`mailto:${f.contact.email}`}
                  className="flex items-start gap-3 group"
                >
                  <svg className="w-4 h-4 mt-0.5 text-cyan-neon group-hover:scale-110 transition-transform duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  <span className="text-gray-200 text-sm group-hover:text-cyan-neon transition-colors duration-300">
                    {f.contact.email}
                  </span>
                </a>
              </li>

              {/* Telefone */}
              <li>
                <a
                  href={`tel:${f.contact.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-3 group"
                >
                  <svg className="w-4 h-4 mt-0.5 text-cyan-neon group-hover:scale-110 transition-transform duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  <span className="text-gray-200 text-sm group-hover:text-cyan-neon transition-colors duration-300">
                    {f.contact.phone}
                  </span>
                </a>
              </li>

              {/* Morada */}
              <li>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 text-cyan-neon flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="text-gray-200 text-sm">
                    {f.contact.address}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs tracking-[0.1em] font-orbitron">
            {f.copyright.replace('{year}', new Date().getFullYear())}
          </p>
          <div className="flex items-center gap-6">
            {(f.legalLinks || []).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-400 text-xs tracking-[0.08em] hover:text-cyan-neon transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-gray-400 text-xs tracking-[0.1em]">
            {f.madeWith}{' '}
            <span className="text-cyan-neon font-semibold">
              {f.location}
            </span>
            {' '}🇵🇹
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
