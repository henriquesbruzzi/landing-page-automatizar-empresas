import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * O vídeo da Nexugal, à direita do cabeçalho dos exemplos (Exemplos.js).
 *
 * O vídeo não arranca sozinho. Mostra a capa, que já traz o botão de play
 * desenhado, e a caixa inteira é um botão. Ao clicar, toca do início, com som,
 * e aparecem os controlos do browser.
 *
 * Os ficheiros estão em public/video, fora do src, para não entrarem no
 * JavaScript do site. Com preload="none" o browser não descarrega nada do vídeo
 * até alguém clicar: só a capa.
 *
 * Tamanho: a partir de 1024px o vídeo tem a altura do texto que está ao lado
 * (pedido do Rui: nunca maior do que ele). Quem mede é o Exemplos.js, que passa
 * a medida em `altura`; a largura sai da proporção do vídeo. Enquanto não
 * houver medida, fica com a largura de LARGURA. No telemóvel empilha, e aí
 * manda LARGURA.
 *
 * Versões: hoje há só a vertical (9:16). Quando houver uma deitada (16:9),
 * entra em `video.versoes.larga` no translations.js e passa a ser a dos ecrãs
 * a partir de 1024px; a vertical fica para os mais estreitos. Sem `larga`, a
 * vertical serve todas as larguras.
 */

const ECRA_LARGO = '(min-width: 1024px)';

function useEcraLargo() {
  const [largo, setLargo] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(ECRA_LARGO).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(ECRA_LARGO);
    const aoMudar = (evento) => setLargo(evento.matches);
    setLargo(mql.matches);
    mql.addEventListener('change', aoMudar);
    return () => mql.removeEventListener('change', aoMudar);
  }, []);

  return largo;
}

// Classes escritas por extenso: o Tailwind só gera as que encontra no código.
// A versão larga só se usa a partir de 1024px, por isso só tem medida para lá.
const LARGURA = {
  vertical: 'w-full max-w-[240px] lg:w-[160px]',
  larga: 'lg:w-[380px]',
};

export default function VideoNexugal({ altura = null, className = '' }) {
  const { t } = useLanguage();
  const v = t.video;
  const { vertical, larga } = v.versoes;

  const ecraLargo = useEcraLargo();
  const tipo = larga && ecraLargo ? 'larga' : 'vertical';
  const versao = tipo === 'larga' ? larga : vertical;

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
    <div
      className={`group relative isolate overflow-hidden rounded-2xl bg-azul-profundo shadow-azul ${LARGURA[tipo]} ${className}`}
      style={{
        aspectRatio: `${versao.largura} / ${versao.altura}`,
        ...(ecraLargo && altura ? { height: altura, width: 'auto', maxWidth: 'none' } : {}),
      }}
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
          className="absolute inset-0 h-full w-full cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-azul-vivo"
        />
      )}
    </div>
  );
}
