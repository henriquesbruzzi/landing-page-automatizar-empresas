import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { comDestaques } from '../utils/destaques';
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

// Uma entrada dos parágrafos é uma frase ou uma lista de frases. A lista sai
// num parágrafo só, com cada frase na sua linha e um pequeno espaço entre elas:
// sem o espaço, no telemóvel uma frase que passa à linha seguinte parecia uma
// frase nova.
function comLinhas(entrada) {
  if (!Array.isArray(entrada)) return comDestaques(entrada);
  return entrada.map((linha, i) => (
    <span key={linha} className={i > 0 ? 'mt-2 block' : 'block'}>
      {comDestaques(linha)}
    </span>
  ));
}

function Process() {
  const { t } = useLanguage();
  const historia = t.about.historia;
  const [primeiro, ...resto] = historia.paragrafos;
  const passos = t.process.steps;
  // Só conta no telemóvel: a partir de md a história vê-se sempre inteira
  const [historiaAberta, setHistoriaAberta] = useState(false);

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

            {/* No telemóvel (abaixo de md) vê-se só o primeiro parágrafo, com o
                fim a desvanecer para o fundo, e o resto abre com "Ler mais". O
                resto não sai da página: fica lá, escondido, e o Google lê-o na
                mesma. A partir de md vê-se tudo, sem botão, como antes. */}
            <div className="relative">
              <p className={TEXTO}>{comLinhas(primeiro)}</p>
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-neve/0 to-neve transition-opacity duration-500 motion-reduce:transition-none md:hidden ${
                  historiaAberta ? 'opacity-0' : 'opacity-100'
                }`}
                aria-hidden="true"
              />
            </div>

            {/* A altura abre e fecha como nas respostas da FAQ: a linha da
                grelha passa de 0fr a 1fr. Fechado, o resto fica invisível para
                os leitores de ecrã também (o invisible só entra no fim da
                animação de fechar). */}
            <div
              id="historia-resto"
              className={`grid transition-all duration-500 motion-reduce:transition-none md:visible md:grid-rows-[1fr] ${
                historiaAberta ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-5 pt-5">
                  {resto.map((paragrafo) => (
                    <p key={[].concat(paragrafo).join(' ')} className={TEXTO}>
                      {comLinhas(paragrafo)}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Mesmo desenho do "Ver exemplos" do hero */}
            <button
              type="button"
              onClick={() => setHistoriaAberta(!historiaAberta)}
              aria-expanded={historiaAberta}
              aria-controls="historia-resto"
              className="mt-6 border-b-2 border-azul-claro pb-1 text-sm font-semibold text-azul-medio transition-colors duration-300 hover:border-azul-medio md:hidden"
            >
              {historiaAberta ? t.about.lerMenos : t.about.lerMais}
            </button>
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
