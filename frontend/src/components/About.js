import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { classesEntrada, atrasoEntrada } from '../utils/entrada';

// ---------------------------------------------------------------------------
// A PREENCHER quando houver
// ---------------------------------------------------------------------------

// Endereço completo do LinkedIn de cada fundador, por exemplo
// 'https://www.linkedin.com/in/nome'. Enquanto estiver vazio, o ícone do
// LinkedIn não aparece no cartão.
const LINKEDIN = {
  rui: '',
  henrique: '',
};

// Fotografia de cada fundador. Caminho a contar da pasta public, por exemplo
// '/images/rui.jpg'. Enquanto estiver vazio, aparece uma silhueta neutra.
const FOTOS = {
  rui: '',
  henrique: '',
};

// ---------------------------------------------------------------------------

// Cadeia de entrada
const ATRASO_INTRO = 120;
const ATRASO_CARTOES = 200;
const ATRASO_ENTRE_CARTOES = 80;

// Silhueta neutra, no lugar da fotografia que ainda não existe
const silhueta = (
  <svg
    className="w-10 h-10 text-white/25"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
  </svg>
);

const iconeLinkedin = (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.7c0-1.36-.03-3.1-1.9-3.1-1.9 0-2.2 1.47-2.2 2.99V21h-4V9Z" />
  </svg>
);

function About() {
  const { t } = useLanguage();
  const { ref, visivel, semAnimacao } = useRevealOnScroll();
  const entrada = classesEntrada(visivel, semAnimacao);
  const atraso = (ms) => atrasoEntrada(ms, visivel, semAnimacao);
  const fundadores = t.about.founders;

  return (
    <section ref={ref} id="sobre" className="relative py-24 md:py-32 bg-black" aria-labelledby="about-title">
      {/* Linha divisória sutil no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Header da secção */}
        <div className={`text-center mb-16 ${entrada}`} style={atraso(0)}>
          <span className="font-orbitron text-cyan-neon text-xs font-semibold tracking-[0.3em] uppercase mb-4 block">
            {t.about.subtitle}
          </span>
          <h2 id="about-title" className="font-orbitron text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em] mb-6">
            {t.about.title}
            <span className="text-cyan-neon">{t.about.titleHighlight}</span>
          </h2>
          <p className="text-white/90 max-w-3xl mx-auto text-sm md:text-base leading-relaxed text-justify">
            {t.about.description}
          </p>
        </div>

        {/* De onde vem a forma de trabalhar dos dois */}
        <div className={`text-center mb-12 ${entrada}`} style={atraso(ATRASO_INTRO)}>
          <p className="text-white/90 max-w-3xl mx-auto text-sm md:text-base leading-relaxed text-justify">
            {fundadores.intro}
          </p>
        </div>

        {/* Fundadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {fundadores.people.map((pessoa, index) => {
            const foto = FOTOS[pessoa.id];
            const linkedin = LINKEDIN[pessoa.id];

            return (
              <div
                key={pessoa.id}
                className={`h-full ${entrada}`}
                style={atraso(ATRASO_CARTOES + index * ATRASO_ENTRE_CARTOES)}
              >
                <div className="group h-full flex flex-col p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-cyan-neon/20 hover:bg-white/[0.04] transition-colors duration-500">
                  <div className="flex items-center gap-5 mb-6">
                    {/* Fotografia, ou silhueta enquanto não houver */}
                    <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden border border-white/10 bg-white/[0.03] flex items-center justify-center group-hover:border-cyan-neon/30 transition-colors duration-500">
                      {foto ? (
                        <img
                          src={foto}
                          alt={`${fundadores.photoAlt}${pessoa.name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        silhueta
                      )}
                    </div>

                    <div>
                      <h3 className="font-orbitron text-white text-base md:text-lg font-semibold tracking-[0.05em]">
                        {pessoa.name}
                      </h3>
                      <p className="font-orbitron text-cyan-neon text-xs font-semibold tracking-[0.2em] uppercase mt-2">
                        {pessoa.role}
                      </p>
                    </div>
                  </div>

                  <p className="text-white/90 text-sm leading-relaxed flex-1 text-justify">
                    {pessoa.description}
                  </p>

                  {/* Lugar do LinkedIn. O ícone só aparece depois de a constante
                      LINKEDIN lá em cima ter um endereço. */}
                  <div className="mt-6 h-6 flex items-center">
                    {linkedin && (
                      <a
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${fundadores.linkedinLabel}${pessoa.name}`}
                        className="text-white/60 hover:text-cyan-neon transition-colors duration-300"
                      >
                        {iconeLinkedin}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default About;
