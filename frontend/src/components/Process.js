import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { classesEntrada, atrasoEntrada } from '../utils/entrada';

// O cartão é opaco de propósito: a linha que liga os passos corre por trás e
// só aparece nos intervalos. #050505 é o tom que bg-white/[0.02] dá sobre
// preto, e #0a0a0a o de bg-white/[0.04], para ficar igual aos serviços.
const FUNDO = 'bg-[#050505] group-hover:bg-[#0a0a0a]';

// Cadeia de entrada dos passos
const ATRASO_PASSOS = 120;
const ATRASO_ENTRE_PASSOS = 80;

function Process() {
  const { t } = useLanguage();
  const { ref, visivel, semAnimacao } = useRevealOnScroll();
  const entrada = classesEntrada(visivel, semAnimacao);
  const atraso = (ms) => atrasoEntrada(ms, visivel, semAnimacao);

  return (
    <section ref={ref} id="processo" className="relative py-24 md:py-32 bg-black overflow-hidden" aria-labelledby="process-title">
      {/* Linha divisória sutil no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Header da secção */}
        <div className={`text-center mb-20 ${entrada}`} style={atraso(0)}>
          <span className="font-orbitron text-cyan-neon text-sm font-semibold tracking-[0.3em] uppercase mb-4 block">
            {t.process.subtitle}
          </span>
          <h2 id="process-title" className="font-orbitron text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em]">
            {t.process.title}
            <span className="text-cyan-neon">{t.process.titleHighlight}</span>
          </h2>
        </div>

        {/* Passos */}
        <div className="relative">
          {/* Ligação entre passos: atravessa a meia altura dos cartões e fica
              escondida por trás deles, à vista só nos intervalos. */}
          <div
            className={`hidden lg:block absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-neon/0 via-cyan-neon/30 to-cyan-neon/0 ${entrada}`}
            style={atraso(ATRASO_PASSOS)}
            aria-hidden="true"
          ></div>

          {/* Em ecrãs estreitos os passos empilham e a linha desce pelo lado */}
          <div
            className={`lg:hidden absolute top-4 bottom-4 left-[15px] w-[1px] bg-gradient-to-b from-cyan-neon/0 via-cyan-neon/30 to-cyan-neon/0 ${entrada}`}
            style={atraso(ATRASO_PASSOS)}
            aria-hidden="true"
          ></div>

          {/* pl-8 abre o corredor onde a linha desce; a partir de lg some */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pl-8 lg:pl-0">
            {t.process.steps.map((step, index) => (
              <div
                key={step.number}
                className={`group h-full ${entrada}`}
                style={atraso(ATRASO_PASSOS + index * ATRASO_ENTRE_PASSOS)}
              >
                <div className={`relative h-full p-6 md:p-7 rounded-2xl border border-white/10 ${FUNDO} group-hover:border-cyan-neon/30 transition-colors duration-500`}>
                  {/* Número do passo, dentro do cartão */}
                  <div className="w-12 h-12 rounded-full border border-cyan-neon/25 flex items-center justify-center mb-5 group-hover:border-cyan-neon/60 group-hover:shadow-[0_0_20px_rgba(0,209,255,0.15)] transition-all duration-500">
                    <span className="font-orbitron text-cyan-neon text-sm font-bold tracking-wider">
                      {step.number}
                    </span>
                  </div>

                  {/* Etapa */}
                  <h3 className="font-orbitron text-cyan-neon text-xs font-semibold tracking-[0.25em] uppercase mb-3">
                    {step.keyword}
                  </h3>

                  {/* Descrição */}
                  <p className="text-white/90 text-sm leading-relaxed text-justify">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Process;
