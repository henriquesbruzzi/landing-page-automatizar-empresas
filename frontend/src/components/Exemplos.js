import React, { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import VisualExemplo from './VisuaisExemplos';
import VideoNexugal from './VideoNexugal';

/**
 * Secção de exemplos.
 *
 * Substituiu a grelha de cartões que aqui estava. Os cartões diziam o que
 * fazemos por categorias; estes blocos mostram uma situação concreta de cada
 * vez, começando pela dor e acabando no que passa a chegar sozinho.
 *
 * Cada bloco tem o SEU desenho, não o esquema de setas do hero. Quatro blocos
 * com o mesmo esquema liam-se como um só repetido quatro vezes, e o primeiro
 * repetia o hero. A unidade vem da paleta, da letra e do estilo das caixas.
 *
 * O lado alterna de bloco para bloco e as alturas dos desenhos são diferentes
 * de propósito, para o olho não se instalar.
 */

// Afasta o alvo do menu fixo quando se salta pelo índice
const FOLGA_DO_MENU = 'scroll-mt-28';

// Folga entre o vídeo e o que está à volta: em cima e em baixo (o fio do topo
// da secção e o primeiro bloco) e dos lados (o texto e a margem direita).
const VIDEO_FOLGA_VERTICAL = 24;
const VIDEO_FOLGA_LADOS = 24;

/**
 * Tamanho do vídeo ao lado do cabeçalho, a partir de 1024px.
 *
 * O Rui pediu o vídeo tão grande quanto possível (perto do esquema do hero)
 * sem passar por cima de nada nem empurrar a página. O vídeo está fora do
 * fluxo (absoluto, centrado na sua coluna e na altura do texto), por isso não
 * empurra; esta conta garante que também não passa por cima:
 *
 * - em altura: o texto e o índice, mais o espaço vazio por cima (até ao topo
 *   da secção) e por baixo (até ao primeiro bloco), o menor dos dois de cada
 *   lado, porque o vídeo está centrado, e menos a folga. Na versão deitada
 *   (3:2), no máximo a altura do texto e do índice (pedido do Rui: "mais ou
 *   menos com a altura do bloco de texto"), com `ajustarAoTexto`;
 * - em largura: a coluna do vídeo, menos a folga dos dois lados.
 *
 * Fica o menor dos dois, com a largura em píxeis inteiros (meio píxel deixava
 * uma linha escura no lado direito). Mede-se cada peça do texto pela sua
 * altura natural (lg:self-start), nunca a coluna. Volta a medir quando alguma
 * coisa muda de tamanho (letras a chegar, outra largura, outra língua).
 */
function useTamanhoDoVideo({
  ativo,
  proporcao,
  ajustarAoTexto,
  cabecalhoRef,
  textoRef,
  indiceRef,
  celulaRef,
  blocosRef,
}) {
  const [tamanho, setTamanho] = useState(null);

  useLayoutEffect(() => {
    const pecas = [cabecalhoRef, textoRef, indiceRef, celulaRef, blocosRef].map((r) => r.current);
    if (!ativo || pecas.some((p) => !p)) return undefined;
    const [cabecalho, texto, indice, celula, blocos] = pecas;

    const medir = () => {
      const caixaTexto = texto.getBoundingClientRect();
      const alturaTexto =
        caixaTexto.height +
        (parseFloat(window.getComputedStyle(indice).marginTop) || 0) +
        indice.getBoundingClientRect().height;
      const acima = caixaTexto.top - cabecalho.getBoundingClientRect().top;
      const abaixo = blocos.getBoundingClientRect().top - (caixaTexto.top + alturaTexto);
      const alturaComFolgas = alturaTexto + 2 * (Math.min(acima, abaixo) - VIDEO_FOLGA_VERTICAL);
      const alturaMaxima = ajustarAoTexto ? Math.min(alturaTexto, alturaComFolgas) : alturaComFolgas;
      const larguraMaxima = celula.getBoundingClientRect().width - 2 * VIDEO_FOLGA_LADOS;

      const largura = Math.floor(Math.min(larguraMaxima, alturaMaxima * proporcao));
      if (largura <= 0) return;
      setTamanho({ largura, altura: Math.round(largura / proporcao) });
    };

    medir();
    const observador = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    if (observador) pecas.forEach((p) => observador.observe(p));
    window.addEventListener('resize', medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);

    return () => {
      if (observador) observador.disconnect();
      window.removeEventListener('resize', medir);
    };
  }, [ativo, proporcao, ajustarAoTexto, cabecalhoRef, textoRef, indiceRef, celulaRef, blocosRef]);

  return tamanho;
}

function Bloco({ bloco, par }) {
  // Nos ímpares o desenho vem primeiro. Em coluna única o texto fica sempre
  // por cima: quem lê precisa da história antes do desenho.
  const desenhoAEsquerda = par;

  return (
    <div
      id={bloco.id}
      className={`${FOLGA_DO_MENU} ${par ? 'bg-neve' : 'bg-white'}`}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10 md:py-20 lg:px-16">
        <div
          className={`grid grid-cols-1 items-center gap-10 lg:gap-14 ${
            desenhoAEsquerda
              ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]'
              : 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'
          }`}
        >
          <div className={desenhoAEsquerda ? 'lg:order-2' : ''}>
            <span className="mb-3 block font-display text-xs font-semibold uppercase tracking-[0.22em] text-azul-medio">
              {bloco.rotulo}
            </span>
            {/* A dor é o título. O nome da linha de serviço não aparece em
                lado nenhum: quem lê reconhece-se no problema, não na categoria. */}
            <h3 className="font-display text-2xl font-bold leading-snug tracking-[0.02em] text-azul-profundo md:text-3xl">
              {bloco.dor}
            </h3>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-texto md:text-base">
              {bloco.explicacao}
            </p>
          </div>

          <div className={desenhoAEsquerda ? 'lg:order-1' : ''}>
            <VisualExemplo visual={bloco.visual} arte={bloco.arte} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Tira de ferramentas.
 *
 * Cada entrada com `logo` no translations.js sai como imagem, a cinzento; a
 * que não tiver sai como nome escrito, com a mesma folga à volta. O nome fica
 * sempre como texto alternativo, que é o que um leitor de ecrã precisa de ouvir.
 */
function Tira({ tira }) {
  return (
    <div className="border-t border-linha bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 lg:px-16">
        <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.22em] text-suave">
          {tira.texto}
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {tira.ferramentas.map((ferramenta) => (
            <li key={ferramenta.id}>
              {ferramenta.logo ? (
                <img
                  src={ferramenta.logo}
                  alt={ferramenta.nome}
                  className="h-6 w-auto opacity-60 grayscale"
                />
              ) : (
                <span className="font-sans text-sm text-texto">{ferramenta.nome}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Exemplos() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const semAnimacao = usePrefersReducedMotion();
  const e = t.exemplos;
  const comVideo = t.video.mostrar;
  const { vertical, larga } = t.video.versoes;
  const cabecalhoRef = useRef(null);
  const textoRef = useRef(null);
  const indiceRef = useRef(null);
  const celulaRef = useRef(null);
  const blocosRef = useRef(null);
  // Qual das versões está em uso: quem escolhe é o VideoNexugal.js (pela
  // largura, e só com o vídeo na capa), e avisa por aoEscolherTipo.
  const [tipoVideo, setTipoVideo] = useState(null);
  const deitado = tipoVideo === 'larga' && Boolean(larga);
  const versaoEmUso = deitado ? larga : vertical;
  const tamanhoDoVideo = useTamanhoDoVideo({
    ativo: comVideo,
    proporcao: versaoEmUso.largura / versaoEmUso.altura,
    ajustarAoTexto: deitado,
    cabecalhoRef,
    textoRef,
    indiceRef,
    celulaRef,
    blocosRef,
  });

  const saltarPara = (id) => {
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: semAnimacao ? 'auto' : 'smooth' });
  };

  return (
    <section id="exemplos" className="relative bg-white" aria-labelledby="exemplos-titulo">
      <div className="absolute left-1/2 top-0 h-[1px] w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-azul-claro to-transparent" />

      {/* ---------------- cabeçalho e índice ---------------- */}
      {/* O texto à esquerda e o vídeo à direita, a partir de 1024px. Com o
          vídeo vertical, a coluna do texto tem a largura que o cabeçalho
          tinha quando estava centrado (42rem); com o deitado (3:2), as duas
          colunas são iguais, senão a 1024px o vídeo ficava com 190px de
          largura. O vídeo fica centrado no espaço que sobra até à margem
          direita, com o tamanho de useTamanhoDoVideo. Abaixo de 1024px
          empilham: texto, vídeo (o deitado com a largura da coluna) e, por
          fim, o índice, que fica assim logo antes dos blocos para onde salta.
          Sem vídeo nesta língua (video.mostrar), o texto fica sozinho. */}
      <div
        ref={cabecalhoRef}
        className={`mx-auto grid w-full max-w-7xl grid-cols-1 gap-y-10 px-6 pb-4 pt-16 md:px-10 md:pt-20 lg:gap-y-0 lg:px-16 ${
          !comVideo
            ? ''
            : deitado
              ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
              : 'lg:grid-cols-[minmax(0,42rem)_minmax(15rem,1fr)]'
        }`}
      >
        <div ref={textoRef} className="lg:col-start-1 lg:row-start-1 lg:max-w-2xl lg:self-start">
          <span className="mb-4 block font-display text-xs font-semibold uppercase tracking-[0.3em] text-azul-medio">
            {e.rotulo}
          </span>
          <h2
            id="exemplos-titulo"
            className="font-display text-3xl font-bold tracking-[0.04em] text-azul-profundo md:text-4xl lg:text-5xl"
          >
            {e.titulo}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-texto md:text-base">{e.subtitulo}</p>
        </div>

        {comVideo && (
          <div ref={celulaRef} className="lg:relative lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="flex justify-center lg:absolute lg:inset-0 lg:items-center">
              <VideoNexugal tamanho={tamanhoDoVideo} aoEscolherTipo={setTipoVideo} />
            </div>
          </div>
        )}

        {/* Índice. Em fila no computador, e a passar à linha no telemóvel:
            quatro etiquetas não cabem numa fila de 380px, e uma barra que se
            arrasta para o lado esconde as de trás sem avisar. A passar à linha
            vê-se tudo de uma vez. */}
        <nav
          ref={indiceRef}
          aria-label={e.indiceTitulo}
          className="lg:col-start-1 lg:row-start-2 lg:mt-10 lg:max-w-2xl lg:self-start"
        >
          <ul className="flex flex-wrap items-center gap-2.5">
            {e.blocos.map((bloco) => (
              <li key={bloco.id}>
                <button
                  type="button"
                  onClick={() => saltarPara(bloco.id)}
                  className="rounded-full border border-linha bg-white px-4 py-2 text-xs font-medium text-texto transition-colors duration-300 hover:border-azul-medio hover:text-azul-profundo sm:text-sm"
                >
                  {bloco.indice}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ---------------- os quatro blocos ---------------- */}
      <div ref={blocosRef} className="mt-12">
        {e.blocos.map((bloco, i) => (
          <Bloco key={bloco.id} bloco={bloco} par={i % 2 === 1} />
        ))}
      </div>

      {/* ---------------- convite a fechar ---------------- */}
      <div className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 text-center md:px-10 md:py-20 lg:px-16">
          <p className="mx-auto max-w-xl text-base leading-relaxed text-azul-profundo md:text-lg">
            {e.convite.frase}
          </p>
          <button
            type="button"
            onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
            className="mt-8 rounded-full bg-azul-medio px-9 py-4 text-sm font-semibold tracking-[0.06em] text-white shadow-azul transition-colors duration-300 hover:bg-azul-profundo active:scale-95 sm:text-base"
          >
            {e.convite.botao}
          </button>
        </div>
      </div>

      <Tira tira={e.tira} />
    </section>
  );
}

export default Exemplos;
