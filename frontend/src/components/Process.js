import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import Entrada from './Entrada';

// O cartão é opaco de propósito: a linha que liga os passos corre por trás e
// só aparece nos intervalos. Branco sobre a faixa neve da secção, para o
// cartão se destacar sem precisar de contorno forte.
const FUNDO = 'bg-white group-hover:shadow-azul';

// Espera entre passos da mesma fila, para entrarem em cadeia
const ATRASO_ENTRE_PASSOS = 90;
const PASSOS_POR_FILA = 4;

function Process() {
  const { t } = useLanguage();

  return (
    <section id="processo" className="relative py-24 md:py-32 bg-neve overflow-hidden" aria-labelledby="process-title">
      {/* Linha divisória sutil no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-azul-claro to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Header da secção */}
        <Entrada className="text-center mb-20">
          <span className="font-display text-azul-medio text-sm font-semibold tracking-[0.3em] uppercase mb-4 block">
            {t.process.subtitle}
          </span>
          <h2 id="process-title" className="font-display text-azul-profundo text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em]">
            {t.process.title}
            <span className="text-azul-vivo">{t.process.titleHighlight}</span>
          </h2>
        </Entrada>

        {/* Passos */}
        <div className="relative">
          {/* Ligação entre passos: atravessa a meia altura dos cartões e fica
              escondida por trás deles, à vista só nos intervalos. */}
          <Entrada
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-azul-claro to-transparent"
            aria-hidden="true"
          />

          {/* Em ecrãs estreitos os passos empilham e a linha desce pelo lado */}
          <Entrada
            className="lg:hidden absolute top-4 bottom-4 left-[15px] w-[1px] bg-gradient-to-b from-transparent via-azul-claro to-transparent"
            aria-hidden="true"
          />

          {/* pl-8 abre o corredor onde a linha desce; a partir de lg some */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pl-8 lg:pl-0">
            {t.process.steps.map((step, index) => (
              <Entrada
                key={step.number}
                className="group h-full"
                atraso={(index % PASSOS_POR_FILA) * ATRASO_ENTRE_PASSOS}
              >
                <div className={`relative h-full p-6 md:p-7 rounded-2xl border border-linha ${FUNDO} group-hover:border-azul-claro transition-all duration-500`}>
                  {/* Número do passo, dentro do cartão */}
                  <div className="w-12 h-12 rounded-full border border-azul-claro flex items-center justify-center mb-5 group-hover:border-azul-medio transition-colors duration-500">
                    <span className="font-display text-azul-medio text-sm font-bold tracking-wider">
                      {step.number}
                    </span>
                  </div>

                  {/* Etapa */}
                  <h3 className="font-display text-azul-medio text-xs font-semibold tracking-[0.25em] uppercase mb-3">
                    {step.keyword}
                  </h3>

                  {/* Descrição */}
                  <p className="text-texto text-sm font-medium leading-relaxed text-justify">
                    {step.description}
                  </p>
                </div>
              </Entrada>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Process;
