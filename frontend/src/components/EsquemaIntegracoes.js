import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Esquema de integrações do hero.
 *
 * Lê-se como uma frase, da esquerda para a direita: isto tudo entra, junta-se
 * aqui, e sai isto.
 *
 * As caixas e o cartão são HTML, não SVG. O texto vem do translations.js, muda
 * de comprimento entre PT e EN e tem de continuar a quebrar linha, a respeitar
 * o tamanho de letra do browser e a ser lido por um leitor de ecrã. Texto dentro
 * de SVG não faz nada disso.
 *
 * O SVG guarda só o que é desenho: as setas. As curvas usam as MESMAS medidas
 * das caixas (ALTURA_CAIXA, ESPACO), por isso caem sempre no meio de cada uma.
 * Se as medidas mudarem, as setas acompanham sozinhas.
 */

// Geometria da coluna de origens. O SVG das setas depende destes números.
const LG = { altura: 56, espaco: 16, largura: 176, nucleo: 96 };
const SM = { altura: 48, espaco: 12, nucleo: 76 };

const alturaColuna = (m) => m.altura * 4 + m.espaco * 3;
const centroCaixa = (m, i) => m.altura / 2 + i * (m.altura + m.espaco);

/* ---------------------------------------------------------------- símbolos */
/* Genéricos de propósito: não são marcas de ninguém. Traço em azul-medio. */

const tracos = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function IconeEnvelope() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-azul-medio" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" {...tracos} />
      <path d="M3.5 7.5 12 13.5 20.5 7.5" {...tracos} />
    </svg>
  );
}

function IconeFolha() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-azul-medio" aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="16" rx="2" {...tracos} />
      <path d="M3.5 9.5h17M9.5 4v16" {...tracos} />
    </svg>
  );
}

function IconeCaixa() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-azul-medio" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="2" {...tracos} />
      <path d="M7.5 10h9M7.5 14h6" {...tracos} />
    </svg>
  );
}

function IconeBalao() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-azul-medio" aria-hidden="true">
      <path d="M20 12.5a7 7 0 0 1-9.9 6.4L5 20l1.2-4.2A7 7 0 1 1 20 12.5Z" {...tracos} />
    </svg>
  );
}

const SIMBOLOS = {
  email: IconeEnvelope,
  excel: IconeFolha,
  erp: IconeCaixa,
  whatsapp: IconeBalao,
};

/* ------------------------------------------------------------------ peças */

function Caixa({ origem, altura }) {
  const Simbolo = SIMBOLOS[origem.id] || IconeCaixa;
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-linha bg-white px-3.5 shadow-azul"
      style={{ height: altura }}
    >
      <Simbolo />
      <span className="font-sans text-sm text-azul-profundo">{origem.nome}</span>
    </div>
  );
}

function Nucleo({ tamanho }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-linha bg-white shadow-azul-lg"
      style={{ width: tamanho, height: tamanho }}
    >
      {/* O logótipo é azul: o círculo fica branco para ele se ler. Um círculo
          cheio de azul, como na maqueta, engolia o N. */}
      <img
        src="/images/nexugal-n.png"
        alt=""
        aria-hidden="true"
        className="object-contain"
        style={{ width: tamanho * 0.5, height: tamanho * 0.5 }}
      />
    </div>
  );
}

/* Ponta de seta partilhada. Um id por cor, para não colidirem entre si. */
function Pontas() {
  return (
    <defs>
      <marker id="ponta-clara" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#4FA3DC" />
      </marker>
      <marker id="ponta-media" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#1B5AA8" />
      </marker>
    </defs>
  );
}

/** Quatro curvas que saem do meio de cada caixa e convergem no núcleo. */
function SetasConvergentes({ largura = 96 }) {
  const h = alturaColuna(LG);
  const destino = { x: largura - 4, y: h / 2 };
  return (
    <svg
      width={largura}
      height={h}
      viewBox={`0 0 ${largura} ${h}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <Pontas />
      {[0, 1, 2, 3].map((i) => {
        const y = centroCaixa(LG, i);
        // Sai na horizontal da caixa e só depois curva, para se ver de onde vem
        const c1 = { x: largura * 0.46, y };
        const c2 = { x: largura * 0.6, y: destino.y + (y - destino.y) * 0.12 };
        return (
          <path
            key={i}
            d={`M0,${y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${destino.x},${destino.y + (y - destino.y) * 0.03}`}
            fill="none"
            stroke="#4FA3DC"
            strokeWidth="1.8"
            markerEnd="url(#ponta-clara)"
          />
        );
      })}
    </svg>
  );
}

/** Seta única, do núcleo para o cartão. */
function SetaSaida({ largura = 52 }) {
  return (
    <svg
      width={largura}
      height="16"
      viewBox={`0 0 ${largura} 16`}
      className="shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      <Pontas />
      <path
        d={`M0,8 L${largura - 6},8`}
        fill="none"
        stroke="#1B5AA8"
        strokeWidth="2.2"
        markerEnd="url(#ponta-media)"
      />
    </svg>
  );
}

/** Seta vertical, só no telemóvel. */
function SetaBaixo({ altura = 44, cor = '#4FA3DC', ponta = 'ponta-clara' }) {
  return (
    <svg
      width="16"
      height={altura}
      viewBox={`0 0 16 ${altura}`}
      className="shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      <Pontas />
      <path
        d={`M8,0 L8,${altura - 6}`}
        fill="none"
        stroke={cor}
        strokeWidth="2"
        markerEnd={`url(#${ponta})`}
      />
    </svg>
  );
}

/* ----------------------------------------------------------------- cartão */

/* Os números ganham peso sozinhos: Space Grotesk bold por cima do Inter do
   texto corrido. Sem isto o cartão lê-se plano. Apanha "47", "2" e também
   "18 420 €", que é um número só.

   Onde o que leva peso não é um número solto mas uma expressão, uma data como
   8/09 ou um número colado à unidade como "2 dias", marca-se no translations.js
   entre asteriscos. É o mesmo tratamento, só que decidido por quem escreve o
   texto em vez de adivinhado aqui: adivinhar obrigava esta função a conhecer as
   palavras de cada língua, e são duas. */
const REALCE = /\*([^*]+)\*/g;
const PARTIR = /(\d+(?:[\s\u00a0]\d{3})*(?:\s?€)?)/g;
const SO_NUMERO = /^\d+(?:[\s\u00a0]\d{3})*(?:\s?€)?$/;

function Forte({ cor, children }) {
  return <span className={`font-display font-bold ${cor}`}>{children}</span>;
}

function comNumeros(texto, corNumero) {
  // split com grupo de captura devolve o que está entre asteriscos nos índices
  // ímpares. Esses saem realçados inteiros; no resto procuram-se os números.
  return texto.split(REALCE).map((pedaco, i) =>
    i % 2 === 1 ? (
      <Forte key={i} cor={corNumero}>
        {pedaco}
      </Forte>
    ) : (
      <React.Fragment key={i}>
        {pedaco.split(PARTIR).map((parte, j) =>
          SO_NUMERO.test(parte) ? (
            <Forte key={j} cor={corNumero}>
              {parte}
            </Forte>
          ) : (
            <React.Fragment key={j}>{parte}</React.Fragment>
          )
        )}
      </React.Fragment>
    )
  );
}

function Cartao({ resumo }) {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-linha bg-white shadow-azul-lg">
        <div className="bg-azul-profundo px-5 py-3.5">
          <p className="font-sans text-sm font-semibold leading-snug text-white">{resumo.titulo}</p>
          <p className="mt-0.5 font-sans text-xs leading-snug text-white/80">{resumo.entrega}</p>
        </div>

        <ul>
          {resumo.linhas.map((linha, i) => (
            <li
              key={i}
              className={`px-5 py-3 font-sans text-sm leading-snug text-texto ${
                i > 0 ? 'border-t border-linha' : ''
              }`}
            >
              {comNumeros(linha.texto, 'text-azul-profundo')}
              {linha.destaque && (
                <>
                  {' '}
                  {/* A única parte realçada do cartão: é a que pede acção */}
                  <strong className="font-sans font-bold text-azul-medio">
                    {comNumeros(linha.destaque, 'text-azul-medio')}
                  </strong>
                </>
              )}
              {/* Continua a mesma linha, mais pequena, em vez de abrir uma
                  quinta: o cartão tem de ficar com uma linha por cada caixa
                  do esquema. Lê-se como consequência do que está por cima. */}
              {linha.nota && (
                <span className="mt-1 block font-sans text-xs leading-snug text-texto">
                  {comNumeros(linha.nota, 'text-azul-profundo')}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-center font-sans text-xs text-suave">{resumo.rodape}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ tudo */

function EsquemaIntegracoes() {
  const { t } = useLanguage();
  const { descricao, origens, resumo } = t.hero.esquema;

  return (
    <div className="w-full">
      {/* Só o desenho é que é imagem. Marcar o bloco todo como role="img"
          punha o leitor de ecrã a ler esta frase e a saltar o resto, e o
          resto é o cartão: os números são conteúdo, não decoração. Assim,
          a frase explica o que as setas mostram e o texto continua a ser
          lido. Das duas versões abaixo só uma está visível de cada vez, e
          `hidden` tira a outra da árvore de acessibilidade, por isso nada
          é anunciado a dobrar. */}
      <p className="sr-only">{descricao}</p>

      {/* ---------- ecrã largo: da esquerda para a direita ---------- */}
      <div className="hidden lg:flex lg:items-center">
        <div
          className="flex shrink-0 flex-col"
          style={{ width: LG.largura, gap: LG.espaco }}
        >
          {origens.map((origem) => (
            <Caixa key={origem.id} origem={origem} altura={LG.altura} />
          ))}
        </div>

        <SetasConvergentes />
        <Nucleo tamanho={LG.nucleo} />
        <SetaSaida />

        <div className="min-w-0 flex-1">
          <Cartao resumo={resumo} />
        </div>
      </div>

      {/* ---------- telemóvel e tablet: de cima para baixo ----------
          As origens ficam empilhadas pela mesma ordem, e não em grelha de
          dois por dois: é a ordem vertical que emparelha cada origem com a
          sua linha no cartão, e numa grelha essa ordem deixa de se ver. */}
      <div className="flex flex-col items-center lg:hidden">
        {/* Mesma largura máxima do cartão, para a coluna toda assentar no
            mesmo alinhamento em vez de as caixas ficarem mais estreitas */}
        <div
          className="flex w-full max-w-sm flex-col"
          style={{ gap: SM.espaco }}
        >
          {origens.map((origem) => (
            <Caixa key={origem.id} origem={origem} altura={SM.altura} />
          ))}
        </div>

        <SetaBaixo altura={40} />
        <Nucleo tamanho={SM.nucleo} />
        <SetaBaixo altura={36} cor="#1B5AA8" ponta="ponta-media" />

        <div className="w-full max-w-sm">
          <Cartao resumo={resumo} />
        </div>
      </div>
    </div>
  );
}

export default EsquemaIntegracoes;
