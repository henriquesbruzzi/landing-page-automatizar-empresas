import { useState, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// NOTA: ninguém usa este hook neste momento. A entrada ao scroll foi
// retirada a pedido. Fica aqui, já regulado, caso volte a ser precisa.

// Encolhe o fundo do ecrã 8%, para o bloco começar a entrar já dentro da
// vista e não ainda no rebordo de baixo.
const MARGEM_POR_OMISSAO = '0px 0px -8% 0px';

// Quanto do bloco tem de estar à vista para a entrada arrancar
const FRACAO_VISIVEL = 0.15;

/**
 * Marca um bloco como visível quando ele começa a entrar no ecrã.
 * Corre uma só vez: depois de visível, deixa de observar.
 * Com animações reduzidas, fica visível desde o primeiro instante.
 *
 * @returns {{ ref: object, visivel: boolean, semAnimacao: boolean }}
 */
export function useRevealOnScroll(margem = MARGEM_POR_OMISSAO) {
  const semAnimacao = usePrefersReducedMotion();
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (semAnimacao) {
      setVisivel(true);
      return undefined;
    }

    const elemento = ref.current;
    if (!elemento) return undefined;

    // Browser sem IntersectionObserver: mostra tudo, sem animação.
    if (typeof IntersectionObserver === 'undefined') {
      setVisivel(true);
      return undefined;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { root: null, rootMargin: margem, threshold: FRACAO_VISIVEL }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, [semAnimacao, margem]);

  return { ref, visivel, semAnimacao };
}
