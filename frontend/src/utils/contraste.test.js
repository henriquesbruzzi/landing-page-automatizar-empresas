/**
 * Auditoria de contraste WCAG 2.1 dos pares de cor que o hero usa.
 *
 * Corre com:  npm test -- contraste
 *
 * Os valores vêm do tailwind.config.js. Se lá mudarem, mudam aqui: este
 * ficheiro é a rede que apanha uma cor bonita que ninguem consegue ler.
 *
 * Limiares (texto sobre fundo):
 *   AA  normal  4.5:1     AA  grande (>=24px, ou >=18.66px a bold)  3:1
 *   AAA normal  7:1       AAA grande                                4.5:1
 * Contornos e elementos gráficos: 3:1 (nao se aplica a separadores
 * decorativos, que nao carregam informacao).
 */

const COR = {
  branco: '#FFFFFF',
  azulProfundo: '#0F2E5C',
  azulMedio: '#1B5AA8',
  azulVivo: '#1595DC',
  azulClaro: '#4FA3DC',
  neve: '#F4F7FB',
  linha: '#DCE5EF',
  texto: '#42506A',
  suave: '#5C6B85',
};

function canal(v) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminancia(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(a, b) {
  const la = luminancia(a);
  const lb = luminancia(b);
  const claro = Math.max(la, lb);
  const escuro = Math.min(la, lb);
  return (claro + 0.05) / (escuro + 0.05);
}

/* Onde cada par aparece no hero, e que limiar tem de cumprir. */
const PARES = [
  { onde: 'titulo (azul-profundo sobre branco)', fg: COR.azulProfundo, bg: COR.branco, minimo: 3, nota: 'texto grande' },
  { onde: 'destaque do titulo (azul-vivo sobre branco)', fg: COR.azulVivo, bg: COR.branco, minimo: 3, nota: 'texto grande' },
  { onde: 'subtitulo (texto sobre branco)', fg: COR.texto, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'nome do servico (texto sobre branco)', fg: COR.texto, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'nome do servico em hover (azul-profundo sobre branco)', fg: COR.azulProfundo, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'botao CTA (azul-medio sobre branco)', fg: COR.azulMedio, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'contorno do botao CTA (azul-medio sobre branco)', fg: COR.azulMedio, bg: COR.branco, minimo: 3, nota: 'contorno' },
  { onde: 'texto secundario (suave sobre branco)', fg: COR.suave, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'texto secundario (suave sobre neve)', fg: COR.suave, bg: COR.neve, minimo: 4.5, nota: 'texto normal' },
];

describe('contraste do hero', () => {
  PARES.forEach(({ onde, fg, bg, minimo, nota }) => {
    test(`${onde} cumpre ${minimo}:1 (${nota})`, () => {
      const r = contraste(fg, bg);
      expect(Number(r.toFixed(2))).toBeGreaterThanOrEqual(minimo);
    });
  });

  test('tabela', () => {
    const linhas = PARES.map(({ onde, fg, bg, minimo }) => {
      const r = contraste(fg, bg);
      return `${r.toFixed(2).padStart(6)}:1  min ${String(minimo).padStart(3)}  ${r >= minimo ? 'passa' : 'FALHA'}  ${onde}`;
    });
    // eslint-disable-next-line no-console
    console.log('\n' + linhas.join('\n') + '\n');
    expect(linhas.length).toBe(PARES.length);
  });
});

module.exports = { contraste, luminancia, COR };
