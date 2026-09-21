import React, { useId } from 'react';

/**
 * Esquema de integrações.
 *
 * Serve só o hero. Os quatro blocos da secção de exemplos têm cada um o seu
 * desenho, em VisuaisExemplos.js: o leque de setas a convergir no N é a
 * assinatura da primeira dobra e não se repete mais abaixo. Recebe os dados por
 * `esquema` e não os vai buscar a lado nenhum.
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
 * das caixas (LG, e FILA na versão empilhada), por isso caem sempre no meio de
 * cada uma. Se as medidas mudarem, as setas acompanham sozinhas.
 */

// Geometria da coluna de origens. O SVG das setas depende destes números.
//
// As medidas de LG são apertadas de propósito. Da esquerda para a direita o
// esquema gasta largura fixa (caixas, setas, núcleo) e o cartão fica com o que
// sobra, dentro de um contentor que para de crescer aos 1280px. Cada pixel que
// se tire aqui é um pixel que o cartão ganha, e é o cartão que tem de se ler.
const LG = { altura: 56, espaco: 16, largura: 164, nucleo: 88 };

/**
 * Medidas da fila de peças, a versão empilhada.
 *
 * Estão todas aqui, e só aqui, porque mudam em bloco: mexer no tamanho da peça
 * sem mexer no espaço e no corpo do nome desalinha o leque, que é desenhado a
 * partir destes mesmos números.
 *
 * AVISO, para quem vier depois. Acima de quatro origens esta disposição fica no
 * limite. Com cinco, a peça desce para 57px e o nome para 10px, e "WhatsApp"
 * ocupa 51 desses 57. Um nome mais comprido, "Transportadora" por exemplo, não
 * cabe. Quando isso acontecer, a saída não é encolher mais: é mudar de
 * disposição, provavelmente para uma coluna de caixas com o leque ao lado, que
 * aguenta qualquer número de origens e qualquer comprimento de nome.
 */
const FILA = {
  ate4: { peca: 66, altura: 56, espaco: 12, nome: 11 },
  de5: { peca: 57, altura: 52, espaco: 8, nome: 10 },
  nucleo: 76,
  leque: 62,
  saida: 34,
};

/** As medidas mudam de patamar aos cinco. Ver o aviso em FILA. */
const medidasFila = (n) => (n > 4 ? FILA.de5 : FILA.ate4);

/** Largura que a fila ocupa, e é também a do SVG do leque. */
const larguraFila = (n, m) => n * m.peca + (n - 1) * m.espaco;

const alturaColuna = (m, n) => m.altura * n + m.espaco * (n - 1);
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
        src="/images/nexugal-n-132.png"
        alt=""
        aria-hidden="true"
        className="object-contain"
        style={{ width: tamanho * 0.5, height: tamanho * 0.5 }}
      />
    </div>
  );
}

/* Ponta de seta.
 *
 * Os ids TÊM de ser únicos por SVG. Eram fixos, e como cada seta traz as suas
 * definições havia quatro `ponta-clara` no documento. O url(#...) resolve
 * sempre para a primeira, que vive no layout de ecrã largo: em telemóvel esse
 * layout está em display:none e as setas ficavam sem ponta, riscos soltos.
 * O useId dá um sufixo diferente a cada montagem e o problema não volta. */
function usePontas() {
  const id = useId().replace(/:/g, '');
  const clara = `clara-${id}`;
  const media = `media-${id}`;

  const defs = (
    <defs>
      <marker id={clara} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#4FA3DC" />
      </marker>
      <marker id={media} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#1B5AA8" />
      </marker>
    </defs>
  );

  return { defs, clara, media };
}

/** Quatro curvas que saem do meio de cada caixa e convergem no núcleo. */
function SetasConvergentes({ n, largura = 76 }) {
  const { defs, clara } = usePontas();
  const h = alturaColuna(LG, n);
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
      {defs}
      {Array.from({ length: n }, (_, i) => {
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
            markerEnd={`url(#${clara})`}
          />
        );
      })}
    </svg>
  );
}

/** Seta única, do núcleo para o cartão. */
function SetaSaida({ largura = 40 }) {
  const { defs, media } = usePontas();
  return (
    <svg
      width={largura}
      height="16"
      viewBox={`0 0 ${largura} 16`}
      className="shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      {defs}
      <path
        d={`M0,8 L${largura - 6},8`}
        fill="none"
        stroke="#1B5AA8"
        strokeWidth="2.2"
        markerEnd={`url(#${media})`}
      />
    </svg>
  );
}

/**
 * Peça da fila: símbolo dentro de um quadrado, nome por baixo.
 *
 * O nome não quebra linha de propósito. Se quebrasse, as peças ficavam com
 * alturas diferentes e o leque deixava de assentar. Um nome que não caiba
 * transborda, e transbordar é para dar nas vistas: ver o aviso em FILA.
 */
function Peca({ origem, m }) {
  const Simbolo = SIMBOLOS[origem.id] || IconeCaixa;
  return (
    <div style={{ width: m.peca }} className="text-center">
      <div
        style={{ height: m.altura }}
        className="flex items-center justify-center rounded-lg border border-linha bg-white shadow-azul"
      >
        <Simbolo />
      </div>
      <span
        style={{ fontSize: m.nome }}
        className="mt-1.5 block whitespace-nowrap font-sans leading-tight text-azul-profundo"
      >
        {origem.nome}
      </span>
    </div>
  );
}

/**
 * Leque que desce: uma seta por origem, do meio de cada peça até ao núcleo.
 *
 * As curvas saem daqui com as mesmas medidas que desenham a fila, por isso
 * caem sempre no meio de cada peça, com três origens ou com cinco.
 */
function LequeDescendente({ n, m }) {
  const { defs, clara } = usePontas();
  const largura = larguraFila(n, m);
  const altura = FILA.leque;
  const meio = largura / 2;
  const fim = altura - 10;

  return (
    <svg
      width={largura}
      height={altura}
      viewBox={`0 0 ${largura} ${altura}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      {defs}
      {Array.from({ length: n }, (_, i) => {
        const x = m.peca / 2 + i * (m.peca + m.espaco);
        // Desce a direito da peça e só depois fecha, para se ver de onde vem
        return (
          <path
            key={i}
            d={`M${x},0 C${x},${altura * 0.46} ${meio},${altura * 0.4} ${meio},${fim}`}
            fill="none"
            stroke="#4FA3DC"
            strokeWidth="1.8"
            markerEnd={`url(#${clara})`}
          />
        );
      })}
    </svg>
  );
}

/** Seta vertical, na versão empilhada. */
function SetaBaixo({ altura = 44, forte = false }) {
  const { defs, clara, media } = usePontas();
  const cor = forte ? '#1B5AA8' : '#4FA3DC';
  return (
    <svg
      width="16"
      height={altura}
      viewBox={`0 0 16 ${altura}`}
      className="shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      {defs}
      <path
        d={`M8,0 L8,${altura - 6}`}
        fill="none"
        stroke={cor}
        strokeWidth="2"
        markerEnd={`url(#${forte ? media : clara})`}
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
// Apanha as duas escritas de dinheiro que o site usa: "18 420 €" em português,
// com espaço a separar os milhares e o símbolo atrás, e "€18,420" em inglês,
// com o símbolo à frente e vírgula. A vírgula só conta como separador quando vem
// seguida de três dígitos, por isso "lançadas, 2 por rever" não se cola.
const MOEDA = String.raw`(?:€\s?)?\d+(?:[\s\u00a0,]\d{3})*(?:\s?€)?`;
const PARTIR = new RegExp(`(${MOEDA})`, 'g');
const SO_NUMERO = new RegExp(`^${MOEDA}$`);

/* whitespace-nowrap: "2 dias" e "3 à espera de si" são um bloco. Sem isto a
   linha partia entre o número e a unidade e sobrava uma palavra órfã. */
function Forte({ cor, children }) {
  return <span className={`whitespace-nowrap font-display font-bold ${cor}`}>{children}</span>;
}

function comNumeros(texto, corNumero) {
  // Quem marca, manda. Se a linha traz asteriscos, só o que está marcado leva
  // peso e o resto fica quieto. É a única forma de escrever "1 repetida, já
  // lançada a 12/08" com o 1 em negrito e a data não: a procura automática
  // não sabe distinguir um número que interessa de uma data que não interessa,
  // e ainda partia o "12/08" em dois pedaços.
  if (REALCE.test(texto)) {
    REALCE.lastIndex = 0;
    return texto.split(REALCE).map((pedaco, i) =>
      i % 2 === 1 ? (
        <Forte key={i} cor={corNumero}>
          {pedaco}
        </Forte>
      ) : (
        <React.Fragment key={i}>{pedaco}</React.Fragment>
      )
    );
  }

  // Sem marcas, procuram-se os números
  return texto.split(PARTIR).map((parte, j) =>
    SO_NUMERO.test(parte) ? (
      <Forte key={j} cor={corNumero}>
        {parte}
      </Forte>
    ) : (
      <React.Fragment key={j}>{parte}</React.Fragment>
    )
  );
}

function Cartao({ resumo }) {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-linha bg-white shadow-azul-lg">
        <div className="bg-azul-profundo px-5 py-3.5">
          <p className="font-sans text-sm font-semibold leading-snug text-white">{resumo.titulo}</p>
          {/* Só o fecho de contas é que segue para alguém. Os outros resumos
              não têm destinatário, e uma linha vazia abria buraco no cabeçalho. */}
          {resumo.entrega && (
            <p className="mt-0.5 font-sans text-xs leading-snug text-white/80">{resumo.entrega}</p>
          )}
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
                  <strong className="whitespace-nowrap font-sans font-bold text-azul-medio">
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

      <p className="mt-4 text-center font-sans text-[13px] text-suave">{resumo.rodape}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ tudo */

function EsquemaIntegracoes({ esquema }) {
  const { descricao, origens, resumo } = esquema;
  const medidas = medidasFila(origens.length);

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

      {/* ---------- ecrã largo: da esquerda para a direita ----------
          A partir de xl, não de lg. Da esquerda para a direita o esquema ocupa
          420px fixos (caixas, setas, núcleo) e o cartão fica com o que sobra.
          Entre 1024 e 1280 sobrava quase nada: a 1152 o cartão ficava com
          117px de largura e 720 de altura, uma fita, e a legenda saía do ecrã.
          Nessa faixa passa a valer a versão empilhada, onde o cartão tem
          sempre a largura toda da coluna. */}
      <div className="hidden xl:flex xl:items-center">
        <div
          className="flex shrink-0 flex-col"
          style={{ width: LG.largura, gap: LG.espaco }}
        >
          {origens.map((origem) => (
            <Caixa key={origem.id} origem={origem} altura={LG.altura} />
          ))}
        </div>

        <SetasConvergentes n={origens.length} />
        <Nucleo tamanho={LG.nucleo} />
        <SetaSaida />

        <div className="min-w-0 flex-1">
          <Cartao resumo={resumo} />
        </div>
      </div>

      {/* ---------- telemóvel, tablet e portátil pequeno: de cima para baixo ----------
          As origens ficam numa fila, e cada uma tem a sua seta a descer até ao
          núcleo. Já estiveram empilhadas à largura toda, encostadas umas às
          outras, e aí só cabia uma seta: lia-se "o WhatsApp entra no N" em vez
          de "estas quatro entram no N", que é o argumento do esquema. A fila
          devolve o leque, que é o mesmo gesto do ecrã largo.

          A ordem da fila é a mesma das linhas do cartão, da esquerda para a
          direita, e é ela que emparelha cada origem com o seu resultado. */}
      <div className="flex flex-col items-center xl:hidden">
        <div className="flex" style={{ gap: medidas.espaco }}>
          {origens.map((origem) => (
            <Peca key={origem.id} origem={origem} m={medidas} />
          ))}
        </div>

        <LequeDescendente n={origens.length} m={medidas} />
        <Nucleo tamanho={FILA.nucleo} />
        <SetaBaixo altura={FILA.saida} forte />

        <div className="w-full max-w-sm">
          <Cartao resumo={resumo} />
        </div>
      </div>
    </div>
  );
}

export default EsquemaIntegracoes;
