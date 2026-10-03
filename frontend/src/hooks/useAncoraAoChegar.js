import { useLayoutEffect } from 'react';

// Gestos com que o visitante mexe na página. Depois do primeiro, a posição é
// dele, e o acerto do fim do carregamento já não lhe toca.
const GESTOS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

/**
 * Leva a página até à secção que vem no endereço, quando se chega com uma:
 * /#sobre, /us#exemplos. É assim que o /sobre antigo cai na secção certa
 * (App.js).
 *
 * O browser só o faz sozinho se a secção já existir quando a página abre, e
 * aqui não existe: quem a desenha é o React, depois.
 *
 * Só ao chegar. Dentro da página, o menu e o rodapé descem sozinhos, com o
 * scroll suave e a folga do menu fixo do index.css; se isto corresse também
 * aí, cortava-lhes a animação a meio.
 */
export function useAncoraAoChegar() {
  useLayoutEffect(() => {
    // O split protege de um endereço como /#sobre?fbclid=..., que pode
    // aparecer se o redirecionamento da Vercel juntar a query depois do #
    // (a documentação não diz onde a põe).
    const id = window.location.hash.slice(1).split('?')[0];
    if (!id) return undefined;

    const saltar = () => {
      const alvo = document.getElementById(id);
      if (!alvo) return;
      // Salto seco: com o scroll suave do index.css a página descia por cima
      // de tudo o que está antes. A folga do menu fixo (scroll-padding-top)
      // conta na mesma, igual à dos cliques no menu.
      const html = document.documentElement;
      const antes = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      alvo.scrollIntoView();
      html.style.scrollBehavior = antes;
    };

    saltar();

    // As letras e as imagens que chegam depois mudam a altura do que está por
    // cima da secção. O Chrome e o Firefox compensam sozinhos; o Safari não.
    // Quando acabam de chegar, acerta-se outra vez, se o visitante ainda não
    // tiver mexido na página.
    let ativa = true;
    let mexeu = false;
    const marcar = () => {
      mexeu = true;
    };
    const acertar = () => {
      if (ativa && !mexeu) saltar();
    };

    GESTOS.forEach((gesto) => window.addEventListener(gesto, marcar, { passive: true }));
    if (document.readyState !== 'complete') window.addEventListener('load', acertar);
    if (document.fonts) document.fonts.ready.then(acertar);

    return () => {
      ativa = false;
      GESTOS.forEach((gesto) => window.removeEventListener(gesto, marcar));
      window.removeEventListener('load', acertar);
    };
  }, []);
}
