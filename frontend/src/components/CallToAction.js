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
    <section className="relative py-28 md:py-36 bg-white overflow-hidden" aria-labelledby="cta-title">
      {/* Linha divisória no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-azul-claro to-transparent"></div>

      {/* A mancha desfocada e as três partículas que aqui estavam vinham do
          fundo preto, onde davam profundidade. Sobre branco a mancha era
          invisível e as partículas liam-se como sujidade no ecrã. */}

      <div className="max-w-4xl mx-auto px-6 md:px-10 relative z-10 text-center">
        {/* Título de impacto */}
        <Entrada>
          <h2
            id="cta-title"
            className="font-display text-azul-profundo text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.04em] leading-tight mb-8"
          >
            {t.cta.title_start}
            <span className="text-azul-vivo">{t.cta.title_highlight}</span>
            {t.cta.title_end}
          </h2>
        </Entrada>

        {/* Descrição */}
        <Entrada atraso={ATRASO_ENTRE_BLOCOS}>
          <p className="text-texto text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-12">
            {t.cta.description}
          </p>
        </Entrada>

        {/* Botão CTA */}
        <Entrada className="flex flex-col items-center gap-4" atraso={ATRASO_ENTRE_BLOCOS * 2}>
          <button
            onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
            className="rounded-full bg-azul-medio px-9 py-4 text-sm font-semibold tracking-[0.06em] text-white shadow-azul transition-colors duration-300 hover:bg-azul-profundo active:scale-95 sm:text-base"
          >
            {t.cta.button}
          </button>

          {/* Nota */}
          <span className="text-texto text-xs font-medium tracking-[0.1em]">
            {t.cta.note}
          </span>
        </Entrada>
      </div>
    </section>
  );
}

export default CallToAction;
