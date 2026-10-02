import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import Entrada from './Entrada';

/**
 * "Quem somos" e "Como trabalhamos", lado a lado.
 *
 * Até 02/10/2026 o "quem somos" era uma página à parte, o /sobre, e esta
 * secção tinha só os quatro passos, em cartões, com um título grande centrado
 * por cima. Juntaram-se: à esquerda a história, à direita os passos, cada
 * coluna com o seu título. No telemóvel empilham, com a história primeiro.
 *
 * A secção tem o id "sobre": é para lá que vão o SOBRE do menu e do rodapé, e
 * o /sobre antigo (App.js). A coluna dos passos ficou com o id "processo", que
 * é para onde vai o "Como trabalhamos" do rodapé.
 */

// Rótulo pequeno por cima de cada título, o mesmo que a secção já tinha
const ROTULO = 'font-display text-azul-medio text-sm font-semibold tracking-[0.3em] uppercase mb-4 block';
const TITULO = 'font-display text-azul-profundo text-3xl md:text-4xl font-bold tracking-[0.05em]';
const TEXTO = 'text-texto text-sm md:text-base leading-relaxed';

// O que fica entre [ ] no translations.js sai a azul e a negrito, sem os
// parênteses retos. Azul-médio, e não o azul-vivo do "andar sozinho" do
// título: o azul-vivo só passa o contraste em letra grande, e aqui é texto
// corrido (3,1 para 1 sobre o fundo neve, para um mínimo de 4,5). Decisão do
// Rui. O negrito é o semibold (600), o peso mais forte da Inter que o
// index.css declara; o realce do cartão do hero também sai com ele.
function comDestaques(texto) {
  return texto.split(/\[([^\]]+)\]/).map((parte, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold text-azul-medio">
        {parte}
      </span>
    ) : (
      parte
    )
  );
}

function Process() {
  const { t } = useLanguage();
  const historia = t.about.historia;
  const passos = t.process.steps;

  return (
    <section id="sobre" className="relative py-24 md:py-32 bg-neve overflow-hidden">
      {/* Linha divisória sutil no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-azul-claro to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2 xl:gap-24">
          {/* ---------------- Quem somos ---------------- */}
          <Entrada>
            <span className={ROTULO}>{t.about.subtitle}</span>
            <h2 className={`${TITULO} mb-8`}>{historia.titulo}</h2>
            <div className="space-y-5">
              {historia.paragrafos.map((paragrafo) => (
                <p key={paragrafo} className={TEXTO}>
                  {comDestaques(paragrafo)}
                </p>
              ))}
            </div>
          </Entrada>

          {/* ---------------- Como trabalhamos ---------------- */}
          {/* A margem de cima afasta a coluna do menu fixo quando se salta
              para ela pelo rodapé. */}
          <Entrada id="processo" className="scroll-mt-16 md:scroll-mt-20">
            <span className={ROTULO}>{t.process.subtitle}</span>
            <h2 className={`${TITULO} mb-10`}>
              {t.process.title}
              <span className="text-azul-vivo">{t.process.titleHighlight}</span>
            </h2>

            {/* Linha do tempo. Cada passo, menos o último, desenha o troço de
                linha que o liga ao seguinte, do fundo do seu círculo ao topo do
                próximo: assim a linha liga sempre os círculos, seja qual for a
                altura do texto de cada passo. */}
            <ol>
              {passos.map((passo, index) => (
                <li key={passo.number} className="relative flex gap-5 pb-8 last:pb-0 md:gap-6 md:pb-10">
                  {index < passos.length - 1 && (
                    <span
                      className="absolute left-6 top-12 bottom-0 w-[1px] -translate-x-1/2 bg-azul-claro"
                      aria-hidden="true"
                    />
                  )}

                  {/* Número do passo */}
                  <div className="w-12 h-12 shrink-0 rounded-full border border-azul-claro bg-white flex items-center justify-center">
                    <span className="font-display text-azul-medio text-sm font-bold tracking-wider">
                      {passo.number}
                    </span>
                  </div>

                  {/* O pt-4 põe o rótulo à altura do meio do círculo */}
                  <div className="min-w-0 flex-1 pt-4">
                    <h3 className="font-display text-azul-medio text-xs font-semibold tracking-[0.25em] uppercase mb-2">
                      {passo.keyword}
                    </h3>
                    <p className={TEXTO}>{passo.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Entrada>
        </div>
      </div>
    </section>
  );
}

export default Process;
