import { useEffect, useLayoutEffect } from 'react';

// O useLayoutEffect corre antes de o browser pintar, e é o sítio certo para
// acertar o que depende do ecrã (largura, preferências, o que ficou guardado).
// Em Node, onde se desenha o HTML das páginas no fim do build
// (scripts/pre-renderizar.js), não há ecrã nem pintura e o React avisa: aí
// usa-se o useEffect, que o servidor simplesmente ignora.
export const useAntesDePintar = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
