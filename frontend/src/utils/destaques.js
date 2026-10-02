import React from 'react';

/**
 * Destaques no texto corrido.
 *
 * O que fica entre [ ] no translations.js sai a azul e a negrito, sem os
 * parênteses retos. Serve a coluna "Quem somos" (Process.js) e as respostas da
 * FAQ (FAQPage.js).
 *
 * Azul-médio, e não o azul-vivo dos títulos: o azul-vivo só passa o contraste
 * em letra grande, e isto é texto corrido (3,1 para 1 sobre o fundo neve, para
 * um mínimo de 4,5). Decisão do Rui. O negrito é o semibold (600), o peso mais
 * forte da Inter que o index.css declara.
 */
const MARCA = /\[([^\]]+)\]/;

export function comDestaques(texto) {
  return texto.split(MARCA).map((parte, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold text-azul-medio">
        {parte}
      </span>
    ) : (
      parte
    )
  );
}

// O mesmo texto sem as marcas, para onde não há desenho: os dados da FAQ que o
// Google lê (SEO.js) têm de receber o texto simples.
export function semDestaques(texto) {
  return texto.replace(/\[([^\]]+)\]/g, '$1');
}
