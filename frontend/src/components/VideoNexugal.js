import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Secção do vídeo, logo a seguir ao hero.
 *
 * O vídeo não arranca sozinho. Mostra a capa, que já traz o botão de play
 * desenhado, e a caixa inteira é um botão. Ao clicar, toca do início, com som,
 * e aparecem os controlos do browser.
 *
 * Os ficheiros estão em public/video, fora do src, para não entrarem no
 * JavaScript do site. Com preload="none" o browser não descarrega nada do vídeo
 * até alguém clicar: só a capa.
 *
 * Versões: hoje há só a vertical (9:16). Quando houver uma deitada (16:9),
 * entra em `video.versoes.larga` no translations.js e passa a ser a dos ecrãs
 * a partir de 1024px; a vertical fica para os mais estreitos. Sem `larga`, a
 * vertical serve todas as larguras.
 */

const ECRA_LARGO = '(min-width: 1024px)';

function useEcraLargo(precisa) {
  const [largo, setLargo] = useState(() => {
    if (!precisa || typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(ECRA_LARGO).matches;
  });

  useEffect(() => {
    if (!precisa || typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(ECRA_LARGO);
    const aoMudar = (evento) => setLargo(evento.matches);
    setLargo(mql.matches);
    mql.addEventListener('change', aoMudar);
    return () => mql.removeEventListener('change', aoMudar);
  }, [precisa]);

  return largo;
}

// Classes escritas por extenso: o Tailwind só gera as que encontra no código.
const DISPOSICAO = {
  vertical: {
    grelha: 'lg:grid-cols-[380px_minmax(0,1fr)]',
    caixa: 'max-w-[400px] lg:max-w-[380px]',
  },
  larga: {
    grelha: 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]',
    caixa: 'max-w-3xl',
  },
};

export default function VideoNexugal() {
  const { t } = useLanguage();
  const v = t.video;
  const { vertical, larga } = v.versoes;

  const ecraLargo = useEcraLargo(Boolean(larga));
  const tipo = larga && ecraLargo ? 'larga' : 'vertical';
  const versao = tipo === 'larga' ? larga : vertical;
  const disposicao = DISPOSICAO[tipo];

  const videoRef = useRef(null);
  const [aTocar, setATocar] = useState(false);

  // Se a versão mudar (a janela passou o corte), volta à capa da nova.
  useEffect(() => {
    setATocar(false);
  }, [versao.ficheiro]);

  // Com o vídeo a tocar, o foco passa para ele: quem usa o teclado fica logo
  // nos controlos, em vez de perdido no botão que desapareceu.
  useEffect(() => {
    if (aTocar && videoRef.current) videoRef.current.focus();
  }, [aTocar]);

  const tocar = () => {
    const video = videoRef.current;
    if (!video) return;
    setATocar(true);
    video.currentTime = 0;
    const promessa = video.play();
    // Se o browser recusar, os controlos já estão à vista para tentar outra vez
    if (promessa && typeof promessa.catch === 'function') promessa.catch(() => {});
  };

  return (
    <section id="video" className="bg-neve" aria-labelledby="video-titulo">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10 md:py-20 lg:px-16">
        <div
          className={`mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:gap-16 ${disposicao.grelha}`}
        >
          {/* No telemóvel o texto vem primeiro, como nos exemplos: quem lê
              percebe o que vai ver antes de carregar no play. */}
          <div className="text-center lg:order-2 lg:text-left">
            <h2
              id="video-titulo"
              className="font-display text-3xl font-bold leading-tight tracking-[0.02em] text-azul-profundo md:text-4xl"
            >
              {v.titulo}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-texto md:text-lg lg:mx-0">
              {v.frase}
            </p>
          </div>

          <div
            className={`group relative isolate mx-auto w-full overflow-hidden rounded-3xl bg-azul-profundo shadow-azul lg:order-1 lg:mx-0 ${disposicao.caixa}`}
            style={{ aspectRatio: `${versao.largura} / ${versao.altura}` }}
          >
            <video
              ref={videoRef}
              key={versao.ficheiro}
              className={`block h-full w-full object-cover ${
                aTocar
                  ? ''
                  : 'transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100'
              }`}
              src={versao.ficheiro}
              poster={versao.capa}
              preload="none"
              playsInline
              controls={aTocar}
              aria-label={v.rotuloVideo}
            />
            {!aTocar && (
              <button
                type="button"
                onClick={tocar}
                aria-label={v.aria}
                className="absolute inset-0 h-full w-full cursor-pointer rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-azul-vivo"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
