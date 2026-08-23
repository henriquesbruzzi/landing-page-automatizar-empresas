import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import Entrada from './Entrada';

// Espera entre o título, a descrição e o botão
const ATRASO_ENTRE_BLOCOS = 90;

function CallToAction() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative py-28 md:py-36 bg-black overflow-hidden" aria-labelledby="cta-title">
      {/* Linha divisória no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent"></div>

      {/* Glow central de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-neon/[0.04] blur-[150px] rounded-full pointer-events-none"></div>

      {/* Partículas decorativas */}
      <div className="absolute top-16 left-[15%] w-1 h-1 rounded-full bg-cyan-neon/20 animate-pulse"></div>
      <div className="absolute bottom-20 right-[20%] w-1.5 h-1.5 rounded-full bg-cyan-neon/15 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-[10%] w-1 h-1 rounded-full bg-cyan-neon/10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 relative z-10 text-center">
        {/* Título de impacto */}
        <Entrada>
          <h2
            id="cta-title"
            className="font-display text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.04em] leading-tight mb-8"
          >
            {t.cta.title_start}
            <span className="text-cyan-neon">{t.cta.title_highlight}</span>
            {t.cta.title_end}
          </h2>
        </Entrada>

        {/* Descrição */}
        <Entrada atraso={ATRASO_ENTRE_BLOCOS}>
          <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-12 text-justify">
            {t.cta.description}
          </p>
        </Entrada>

        {/* Botão CTA */}
        <Entrada className="flex flex-col items-center gap-4" atraso={ATRASO_ENTRE_BLOCOS * 2}>
          <button
            onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
            className="
              text-sm
              md:text-base
              font-normal
              text-white
              tracking-[0.15em]
              px-12
              py-5
              border-2
              border-cyan-neon
              rounded-full
              bg-cyan-neon/10
              cursor-pointer
              transition-all
              duration-500
              hover:bg-cyan-neon/20
              hover:shadow-neon-glow-lg
              hover:text-cyan-neon
              active:scale-95
            "
          >
            {t.cta.button}
          </button>

          {/* Nota */}
          <span className="text-gray-300 text-xs font-medium tracking-[0.1em]">
            {t.cta.note}
          </span>
        </Entrada>
      </div>
    </section>
  );
}

export default CallToAction;
