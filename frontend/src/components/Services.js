import React, { useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import Entrada from './Entrada';
import { EVENTO_DESTAQUE } from '../utils/destaqueServico';

// Espera antes de acender o cartão, para o destaque começar quando o visitante
// lá chega e não enquanto a página ainda desce.
const ESPERA_ATE_CHEGAR = 500;

// Espera entre cartões da mesma fila, para entrarem em cadeia e não em bloco
const ATRASO_ENTRE_CARTOES = 90;
const CARTOES_POR_FILA = 3;

// Ícones SVG inline para cada serviço
const icons = {
  // Setas em ciclo: trabalho que se repete e passa a andar sozinho
  ciclo: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356m0 4.992-3.181-3.183a8.25 8.25 0 0 0-13.803 3.7M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7" />
    </svg>
  ),
  // Elo: sistemas ligados uns aos outros
  elo: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  code: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
  cloud: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
    </svg>
  ),
  brain: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  ),
  chart: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  support: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
};

function Services() {
  const { t } = useLanguage();
  const semAnimacao = usePrefersReducedMotion();
  const cartoes = useRef({});
  const temporizador = useRef(null);

  // Acende o cartão. Tira e volta a pôr a classe para a animação recomeçar,
  // mesmo quando se clica duas vezes seguidas no mesmo item.
  const destacar = useCallback((id) => {
    const cartao = id ? cartoes.current[id] : null;
    if (!cartao) return;

    cartao.classList.remove('destaque-servico');
    void cartao.offsetWidth;
    cartao.classList.add('destaque-servico');
    cartao.addEventListener(
      'animationend',
      () => cartao.classList.remove('destaque-servico'),
      { once: true }
    );
  }, []);

  useEffect(() => {
    // Com animações reduzidas, o visitante salta para o cartão sem destaque.
    if (semAnimacao) return undefined;

    const agendar = (id) => {
      if (!id || !cartoes.current[id]) return;
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => destacar(id), ESPERA_ATE_CHEGAR);
    };

    const pelaAncora = () => agendar(window.location.hash.slice(1));
    const peloAviso = (evento) => agendar(evento.detail);

    window.addEventListener('hashchange', pelaAncora);
    window.addEventListener(EVENTO_DESTAQUE, peloAviso);

    // A página pode abrir já com um cartão no endereço.
    pelaAncora();

    return () => {
      clearTimeout(temporizador.current);
      window.removeEventListener('hashchange', pelaAncora);
      window.removeEventListener(EVENTO_DESTAQUE, peloAviso);
    };
  }, [destacar, semAnimacao]);

  return (
    <section id="servicos" className="relative py-24 md:py-32 bg-black" aria-labelledby="services-title">
      {/* Linha divisória sutil no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Header da secção */}
        <Entrada className="text-center mb-20">
          <span className="font-display text-cyan-neon text-xs tracking-[0.3em] uppercase mb-4 block">
            {t.services.subtitle}
          </span>
          <h2 id="services-title" className="font-display text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em] mb-6">
            {t.services.title}
            <span className="text-cyan-neon">{t.services.titleHighlight}</span>
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {t.services.description}
          </p>
        </Entrada>

        {/* Grelha de serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {t.services.items.map((service, index) => (
            <Entrada
              key={service.id}
              className="h-full"
              atraso={(index % CARTOES_POR_FILA) * ATRASO_ENTRE_CARTOES}
            >
              {/* scroll-mt afasta o cartão do menu fixo quando é alvo de um link */}
              <div
                id={service.id}
                ref={(elemento) => { cartoes.current[service.id] = elemento; }}
                className="group relative h-full scroll-mt-32 p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-cyan-neon/30 hover:bg-white/[0.04] transition-colors duration-500"
              >
                {/* Glow sutil no hover */}
                <div className="absolute inset-0 rounded-2xl bg-cyan-neon/0 group-hover:bg-cyan-neon/[0.02] transition-all duration-500"></div>

                <div className="relative z-10">
                  {/* Ícone */}
                  <div className="text-cyan-neon mb-6 group-hover:scale-110 transition-transform duration-300">
                    {icons[service.icon]}
                  </div>

                  {/* Título do serviço */}
                  <h3 className="font-display text-white text-base md:text-lg font-semibold tracking-[0.05em] mb-4">
                    {service.title}
                  </h3>

                  {/* Descrição */}
                  <p className="text-white/90 text-sm font-medium leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Linha inferior decorativa */}
                <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/0 group-hover:via-cyan-neon/20 to-transparent transition-all duration-500"></div>
              </div>
            </Entrada>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
