import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { classesEntrada, atrasoEntrada } from '../utils/entrada';

function About() {
  const { t } = useLanguage();
  const { ref, visivel, semAnimacao } = useRevealOnScroll();
  const entrada = classesEntrada(visivel, semAnimacao);
  const atraso = (ms) => atrasoEntrada(ms, visivel, semAnimacao);

  return (
    <section ref={ref} id="sobre" className="relative py-24 md:py-32 bg-black" aria-labelledby="about-title">
      {/* Linha divisória sutil no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Header da secção */}
        <div className={`text-center mb-20 ${entrada}`} style={atraso(0)}>
          <span className="font-orbitron text-cyan-neon text-xs tracking-[0.3em] uppercase mb-4 block">
            {t.about.subtitle}
          </span>
          <h2 id="about-title" className="font-orbitron text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em] mb-6">
            {t.about.title}
            <span className="text-cyan-neon">{t.about.titleHighlight}</span>
          </h2>
          <p className="text-white/50 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
            {t.about.description}
          </p>
        </div>

        {/* Missão + Valores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Missão */}
          <div
            className={`p-8 md:p-10 rounded-2xl border border-white/5 bg-white/[0.02] relative overflow-hidden ${entrada}`}
            style={atraso(120)}
          >
            {/* Detalhe decorativo */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-neon/60 via-cyan-neon/20 to-transparent"></div>

            <h3 className="font-orbitron text-white text-lg md:text-xl font-semibold tracking-[0.08em] mb-6 pl-6">
              {t.about.mission.title}
            </h3>
            <p className="text-white/50 text-sm md:text-base leading-relaxed pl-6">
              {t.about.mission.text}
            </p>
          </div>

          {/* Valores */}
          <div className="flex flex-col gap-4">
            {t.about.values.map((value, index) => (
              <div key={index} className={entrada} style={atraso(200 + index * 80)}>
              <div className="group p-6 md:p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-cyan-neon/20 transition-all duration-500 flex items-start gap-5">
                {/* Número decorativo */}
                <span className="font-orbitron text-cyan-neon/30 text-2xl md:text-3xl font-bold flex-shrink-0 group-hover:text-cyan-neon/60 transition-colors duration-300">
                  0{index + 1}
                </span>
                <div>
                  <h4 className="font-orbitron text-white text-sm md:text-base font-semibold tracking-[0.08em] mb-2">
                    {value.title}
                  </h4>
                  <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                    {value.text}
                  </p>
                </div>
              </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

export default About;
