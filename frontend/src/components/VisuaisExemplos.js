import React from 'react';

/**
 * Os quatro desenhos da secção de exemplos.
 *
 * Cada um é moldado à história que conta. Nenhum é o esquema de convergência
 * do hero: seis blocos com o mesmo desenho liam-se como um só repetido, e a
 * unidade passa a vir da paleta, da letra e do estilo das caixas.
 *
 * SVG para o que é desenho, HTML para o que é texto. É a mesma regra que o
 * EsquemaIntegracoes já seguia, e pelo mesmo motivo: o texto vem do
 * translations.js, muda de comprimento entre português e inglês, e tem de
 * quebrar linha, respeitar o tamanho de letra do browser e ser lido por um
 * leitor de ecrã. Texto dentro de SVG não faz nada disso, e a 380px partia-se.
 *
 * Cada desenho tem a sua forma de empilhar no telemóvel, escrita ao lado.
 */

/* ------------------------------------------------------------------ setas */

/** Seta que muda de direção: para a direita em ecrã largo, para baixo abaixo disso. */
function Seta({ classeLarga = 'hidden lg:block' }) {
  return (
    <>
      <svg
        className={`${classeLarga} h-4 w-12 shrink-0 text-azul-medio`}
        viewBox="0 0 48 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M0 8h38" stroke="currentColor" strokeWidth="2.2" />
        <path d="M36 2.5 44 8l-8 5.5z" fill="currentColor" />
      </svg>
      <svg
        className={`${classeLarga === 'hidden lg:block' ? 'lg:hidden' : 'hidden'} mx-auto h-10 w-4 shrink-0 text-azul-medio`}
        viewBox="0 0 16 40"
        fill="none"
        aria-hidden="true"
      >
        <path d="M8 0v30" stroke="currentColor" strokeWidth="2.2" />
        <path d="M2.5 28 8 36l5.5-8z" fill="currentColor" />
      </svg>
    </>
  );
}

/* ------------------------------------------------- 1. papel a virar dados */

/** A pilha é puro desenho, por isso é SVG. */
function PilhaDePapeis({ etiqueta }) {
  const folha = { fill: '#fff', stroke: '#DCE5EF' };
  const risco = { stroke: '#E3EAF3', strokeWidth: 5 };
  return (
    <svg viewBox="0 0 168 210" className="h-auto w-full" aria-hidden="true">
      <rect x="6" y="16" width="120" height="150" rx="5" {...folha} transform="rotate(-7 66 91)" />
      <rect x="18" y="10" width="120" height="150" rx="5" {...folha} transform="rotate(4 78 85)" />
      <rect x="12" y="6" width="120" height="150" rx="5" fill="#fff" stroke="#C9D6E6" />
      <text x="24" y="30" fontFamily="Inter, sans-serif" fontSize="9.5" fill="#8FA0B8">
        {etiqueta}
      </text>
      <line x1="24" y1="44" x2="108" y2="44" {...risco} />
      <line x1="24" y1="58" x2="92" y2="58" {...risco} />
      <line x1="24" y1="72" x2="108" y2="72" {...risco} />
      <line x1="24" y1="98" x2="76" y2="98" {...risco} />
      <line x1="24" y1="130" x2="108" y2="130" stroke="#D5E0EC" strokeWidth="7" />
    </svg>
  );
}

/**
 * Telemóvel: a pilha sobe para cima, encolhida e centrada, e a tabela fica por
 * baixo com a largura toda. Lado a lado a tabela ficava com 150px e as três
 * colunas colavam-se.
 */
function VisualPapel({ arte }) {
  return (
    <div>
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="w-40 shrink-0 lg:w-44">
          <PilhaDePapeis etiqueta={arte.papelEtiqueta} />
          <p className="mt-3 text-center font-sans text-xs text-suave">{arte.papelLegenda}</p>
        </div>

        <Seta />

        <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-linha bg-white shadow-azul">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 bg-azul-profundo px-4 py-2.5 font-sans text-[11px] font-semibold tracking-wide text-white">
            {arte.colunas.map((coluna) => (
              <span key={coluna}>{coluna}</span>
            ))}
          </div>

          {arte.linhas.map((linha) => (
            <div
              key={linha.doc}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-b border-linha px-4 py-2.5 font-sans text-[12.5px] text-texto"
            >
              <span className="truncate">{linha.fornecedor}</span>
              <span className="whitespace-nowrap">{linha.doc}</span>
              <span className="whitespace-nowrap text-right font-display font-bold text-azul-profundo">
                {linha.valor}
              </span>
            </div>
          ))}

          {/* Linhas ainda por preencher. São barras e não texto de propósito:
              mostram que o trabalho continua depois de a imagem ficar parada. */}
          {Array.from({ length: arte.porPreencher }, (_, i) => (
            <div
              key={`vazia-${i}`}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-b border-linha px-4 py-3.5 last:border-b-0"
              aria-hidden="true"
            >
              <span className={`h-2.5 rounded-full ${i === 0 ? 'w-24 bg-[#E8EEF6]' : 'w-16 bg-[#EFF4F9]'}`} />
              <span className={`h-2.5 w-14 rounded-full ${i === 0 ? 'bg-[#E8EEF6]' : 'bg-[#EFF4F9]'}`} />
              <span className={`h-2.5 w-12 rounded-full ${i === 0 ? 'bg-[#E8EEF6]' : 'bg-[#EFF4F9]'}`} />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 font-sans text-[13px] text-texto">
        <strong className="font-display text-[15px] font-bold text-azul-profundo">{arte.resumo.total}</strong>{' '}
        {arte.resumo.totalTexto}{' '}
        <strong className="font-display text-[15px] font-bold text-azul-medio">{arte.resumo.rever}</strong>{' '}
        {arte.resumo.reverTexto}
      </p>
    </div>
  );
}

/* --------------------------------------------- 2. conversa e o que rendeu */

/**
 * Telemóvel: a conversa fica em cima e os números por baixo, e a linha que os
 * separa deixa de ser vertical e passa a horizontal. Lado a lado a 380px as
 * bolhas ficavam com 170px e o texto partia-se a cada duas palavras.
 */
function VisualConversa({ arte }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl border border-linha bg-white px-5 py-4 shadow-azul">
          <p className="font-sans text-[13px] leading-relaxed text-texto">{arte.pergunta}</p>
        </div>
        <p className="mt-2 font-sans text-[11.5px] text-suave">{arte.perguntaOrigem}</p>

        <div className="mt-5 ml-6 rounded-2xl bg-azul-profundo px-5 py-4">
          <p className="font-sans text-[13px] leading-relaxed text-white">{arte.resposta}</p>
        </div>
        {/* O selo é deliberado: mostra que a resposta espera por uma pessoa */}
        <span className="mt-3 ml-6 inline-block rounded-full bg-[#E4EDF7] px-3 py-1 font-sans text-[11px] font-semibold text-azul-medio">
          {arte.selo}
        </span>
      </div>

      <div className="h-px w-full bg-linha lg:h-44 lg:w-px" aria-hidden="true" />

      <div className="shrink-0 lg:w-52">
        {arte.contadores.map((contador) => (
          <div key={contador.legenda} className="mb-6 last:mb-0">
            <p
              className={`font-display text-[40px] font-bold leading-none ${
                contador.realce ? 'text-azul-medio' : 'text-azul-profundo'
              }`}
            >
              {contador.numero}
            </p>
            <p className="mt-1.5 font-sans text-[13px] text-texto">{contador.legenda}</p>
          </div>
        ))}
        <p className="mt-5 font-sans text-[12.5px] text-suave">{arte.nota}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------- 3. duas listas que discordam */

/**
 * Telemóvel: as duas colunas de fichas ficam lado a lado, porque a comparação
 * é toda a razão de o desenho existir e empilhá-las desfazia-a. Cabem: são
 * estreitas e as referências são curtas. O que desce é o cartão de resultado,
 * e a seta passa a apontar para baixo.
 */
function VisualDiscordancia({ arte }) {
  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
        <div className="min-w-0 flex-1">
          <div className="mb-2 grid grid-cols-2 gap-2.5">
            {arte.colunas.map((coluna) => (
              <span
                key={coluna}
                className="font-sans text-[11px] font-semibold tracking-wide text-suave"
              >
                {coluna}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {arte.artigos.map((artigo) => (
              <div key={artigo.ref} className="grid grid-cols-2 gap-2.5">
                {[artigo.esquerda, artigo.direita].map((quantidade, lado) => (
                  <div
                    key={lado}
                    className={`flex items-center justify-between rounded-md border px-2.5 py-2 ${
                      artigo.bate
                        ? 'border-linha bg-white'
                        : 'border-alerta-linha bg-alerta-fundo'
                    }`}
                  >
                    <span className="truncate font-sans text-[12.5px] text-texto">{artigo.ref}</span>
                    <span
                      className={`ml-2 font-display text-[13px] font-bold ${
                        artigo.bate ? 'text-azul-profundo' : 'text-alerta'
                      }`}
                    >
                      {quantidade}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Seta />

        <div className="shrink-0 overflow-hidden rounded-lg border border-linha bg-white shadow-azul lg:w-60">
          <p className="bg-azul-profundo px-4 py-2.5 font-sans text-[11.5px] font-semibold text-white">
            {arte.cartao.titulo}
          </p>
          <div className="px-4 py-3">
            {arte.cartao.linhas.map((linha, i) => (
              <div key={linha.texto} className={i > 0 ? 'mt-3 border-t border-linha pt-3' : ''}>
                {linha.proprioBloco ? (
                  <>
                    <p className="font-display text-[20px] font-bold leading-none text-azul-profundo">
                      {linha.numero}
                    </p>
                    <p className="mt-1 font-sans text-[12.5px] text-texto">{linha.texto}</p>
                  </>
                ) : (
                  <p className="font-sans text-[12.5px] text-texto">
                    <strong
                      className={`mr-1.5 font-display text-[20px] font-bold ${
                        linha.destaque ? 'text-azul-medio' : 'text-azul-profundo'
                      }`}
                    >
                      {linha.numero}
                    </strong>
                    {linha.texto}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 font-sans text-[12.5px] text-suave">{arte.rodape}</p>
    </div>
  );
}

/* --------------------------------------------------- 4. margem por artigo */

// Onde fica o zero, em percentagem da área das barras. A negativa cresce para
// a esquerda deste ponto, as positivas para a direita.
const ZERO = 24;

// Espaço guardado nas pontas para as etiquetas. Sem isto a barra maior ia até
// ao fim da área e o "38%" saía do ecrã a 380px, cortado pela direita. A
// etiqueta faz parte do desenho, e o desenho tem de caber inteiro.
const FOLGA_DIR = 16;
const FOLGA_ESQ = 10;
const ZONA_POSITIVA = 100 - ZERO - FOLGA_DIR;
const ZONA_NEGATIVA = ZERO - FOLGA_ESQ;

// A área das barras começa depois do nome e da folga entre os dois, e é sobre
// ELA que os 24% contam. O eixo e a etiqueta do zero têm de usar esta mesma
// conta, senão ficam ao lado das barras em vez de em cima delas.
const NOME = '4.5rem';
const FOLGA = '0.75rem';
const NO_ZERO = `calc(${NOME} + ${FOLGA} + (100% - ${NOME} - ${FOLGA}) * ${ZERO / 100})`;

/**
 * Telemóvel: fica como está. Os nomes são curtos e a barra continua legível a
 * 380px, com o nome à esquerda, a barra ao meio e o valor à direita. Empilhar
 * o nome por cima da barra só ganhava altura e perdia a leitura de tabela.
 */
function VisualMargem({ arte }) {
  const maiorPositivo = Math.max(...arte.barras.map((b) => b.valor));
  const maiorNegativo = Math.min(...arte.barras.map((b) => b.valor));
  const larguraPositiva = (valor) => (ZONA_POSITIVA * valor) / maiorPositivo;
  const larguraNegativa = (valor) => (ZONA_NEGATIVA * valor) / maiorNegativo;

  return (
    <div>
      <p className="mb-4 font-sans text-[11px] font-semibold tracking-wide text-suave">{arte.titulo}</p>

      <div className="relative">
        {/* Eixo do zero, a correr por trás das barras todas */}
        <div
          className="absolute top-0 bottom-6 w-px bg-linha"
          style={{ left: NO_ZERO }}
          aria-hidden="true"
        />

        {arte.barras.map((barra) => {
          const negativa = barra.valor < 0;
          return (
            <div key={barra.nome} className="mb-3 flex items-center gap-3 last:mb-0">
              <span
                style={{ width: NOME }}
                className="shrink-0 truncate font-sans text-[12.5px] text-texto"
              >
                {barra.nome}
              </span>

              <div className="relative h-[18px] min-w-0 flex-1">
                <div
                  className={`absolute top-0 h-full rounded-sm ${
                    negativa ? 'bg-alerta' : barra.valor >= 25 ? 'bg-azul-medio' : 'bg-azul-claro'
                  }`}
                  style={
                    negativa
                      ? { right: `${100 - ZERO}%`, width: `${larguraNegativa(barra.valor)}%` }
                      : { left: `${ZERO}%`, width: `${larguraPositiva(barra.valor)}%` }
                  }
                />
                <span
                  className={`absolute top-1/2 -translate-y-1/2 font-display text-[13px] font-bold ${
                    negativa ? 'text-alerta' : 'text-azul-profundo'
                  }`}
                  style={
                    negativa
                      ? { right: `calc(${100 - ZERO}% + ${larguraNegativa(barra.valor)}% + 8px)` }
                      : { left: `calc(${ZERO}% + ${larguraPositiva(barra.valor)}% + 8px)` }
                  }
                >
                  {barra.etiqueta}
                </span>
              </div>
            </div>
          );
        })}

        <p
          className="mt-1 font-sans text-[11px] text-suave"
          style={{ marginLeft: `calc(${NO_ZERO} - 0.6rem)` }}
        >
          {arte.zero}
        </p>
      </div>

      <p className="mt-4 border-t border-linha pt-4 font-sans text-[13px] text-texto">{arte.remate}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ porta */

const VISUAIS = {
  papel: VisualPapel,
  conversa: VisualConversa,
  discordancia: VisualDiscordancia,
  margem: VisualMargem,
};

/**
 * Escolhe o desenho pelo nome que vem no translations.js. Um bloco novo obriga
 * a um desenho novo, e é de propósito: não há aqui um molde que sirva para
 * tudo. Se o nome não existir, não desenha nada em vez de rebentar.
 */
function VisualExemplo({ visual, arte }) {
  const Desenho = VISUAIS[visual];
  if (!Desenho) return null;
  return (
    <div>
      <p className="sr-only">{arte.descricao}</p>
      <Desenho arte={arte} />
    </div>
  );
}

export default VisualExemplo;
