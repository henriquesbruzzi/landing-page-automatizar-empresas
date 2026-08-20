import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

function Process() {
  const { t } = useLanguage();

  return (
    <section id="processo" className="relative py-24 md:py-32 bg-black overflow-hidden" aria-labelledby="process-title">
      {/* Linha divisória sutil no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Header da secção */}
        <div className="text-center mb-20">
          <span className="font-orbitron text-cyan-neon text-xs tracking-[0.3em] uppercase mb-4 block">
            {t.process.subtitle}
          </span>
          <h2 id="process-title" className="font-orbitron text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em]">
            {t.process.title}
            <span className="text-cyan-neon">{t.process.titleHighlight}</span>
          </h2>
        </div>

        {/* Timeline dos passos */}
        <div className="relative">
          {/* Linha conectora horizontal — desktop */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-cyan-neon/0 via-cyan-neon/20 to-cyan-neon/0"></div>

          {/* Grid de passos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {t.process.steps.map((step, index) => (
              <div key={index} className="group relative flex flex-col items-center text-center">
                {/* Número circular */}
                <div className="relative mb-6">
                  <div className="w-[72px] h-[72px] rounded-full border border-white/10 bg-black flex items-center justify-center group-hover:border-cyan-neon/50 group-hover:shadow-[0_0_25px_rgba(0,209,255,0.15)] transition-all duration-500">
                    <span className="font-orbitron text-cyan-neon text-lg font-bold tracking-wider">
                      {step.number}
                    </span>
                  </div>
                  {/* Ponto de conexão na linha */}
                  <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-neon/30 group-hover:bg-cyan-neon group-hover:shadow-[0_0_10px_rgba(0,209,255,0.6)] transition-all duration-500"></div>
                </div>

                {/* Card do passo */}
                <div className="w-full p-6 rounded-2xl border border-white/5 bg-white/[0.02] group-hover:border-cyan-neon/20 group-hover:bg-white/[0.04] transition-all duration-500">
                  {/* Palavra-chave de impacto */}
                  <span className="font-orbitron text-cyan-neon text-[10px] tracking-[0.3em] uppercase block mb-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    {step.keyword}
                  </span>

                  {/* Título */}
                  <h3 className="font-orbitron text-white text-sm font-semibold tracking-[0.05em] mb-3 leading-snug">
                    {step.title}
                  </h3>

                  {/* Descrição */}
                  <p className="text-white/30 text-xs leading-relaxed group-hover:text-white/50 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>

                {/* Seta mobile entre passos */}
                {index < t.process.steps.length - 1 && (
                  <div className="lg:hidden mt-4 mb-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-cyan-neon/30">
                      <path d="M8 2L8 14M8 14L3 9M8 14L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Process;
