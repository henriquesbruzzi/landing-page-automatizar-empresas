import { useState, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Margem por omissão: alarga o ecrã 12% para baixo, para o conteúdo já estar
// no sítio quando chega à vista, em vez de aparecer em cima do nariz.
const MARGEM_POR_OMISSAO = '0px 0px 12% 0px';

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
      { root: null, rootMargin: margem, threshold: 0 }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, [semAnimacao, margem]);

  return { ref, visivel, semAnimacao };
}
