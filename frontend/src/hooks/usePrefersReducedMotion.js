import { useState } from 'react';
import { useAntesDePintar } from '../utils/antesDePintar';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Devolve true quando o sistema do visitante pede animações reduzidas.
 * Nesse caso o hero mostra tudo de imediato, sem escrita nem fades.
 *
 * Começa sempre em false e acerta antes de o browser pintar. A página inicial
 * já vem desenhada no HTML (scripts/pre-renderizar.js), sem saber o que o
 * visitante pediu, e o primeiro desenho do React tem de ser igual a esse HTML.
 */
export function usePrefersReducedMotion() {
  const [reduzido, setReduzido] = useState(false);

  useAntesDePintar(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mql = window.matchMedia(QUERY);
    setReduzido(mql.matches);
    const aoMudar = (evento) => setReduzido(evento.matches);

    mql.addEventListener('change', aoMudar);
    return () => mql.removeEventListener('change', aoMudar);
  }, []);

  return reduzido;
}
