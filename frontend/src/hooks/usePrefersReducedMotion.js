import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Devolve true quando o sistema do visitante pede animações reduzidas.
 * Nesse caso o hero mostra tudo de imediato, sem escrita nem fades.
 */
export function usePrefersReducedMotion() {
  const [reduzido, setReduzido] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mql = window.matchMedia(QUERY);
    const aoMudar = (evento) => setReduzido(evento.matches);

    mql.addEventListener('change', aoMudar);
    return () => mql.removeEventListener('change', aoMudar);
  }, []);

  return reduzido;
}
