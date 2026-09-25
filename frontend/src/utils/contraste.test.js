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
 * Elementos gráficos que carregam informação: 3:1. As setas do esquema
 * contam, porque é delas que se percebe o sentido do desenho.
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

function paraRGB(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function luminancia(hex) {
  const [r, g, b] = paraRGB(hex);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(a, b) {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Cor com transparência por cima de um fundo opaco, resolvida na cor real
 * que o olho vê. O subtítulo do cabeçalho do cartão é branco a 80% sobre
 * azul-profundo: sem isto media-se um branco que não está lá.
 */
function sobrepor(hex, alfa, fundoHex) {
  const f = paraRGB(hex);
  const t = paraRGB(fundoHex);
  const m = f.map((c, i) => Math.round(alfa * c + (1 - alfa) * t[i]));
  return '#' + m.map((c) => c.toString(16).padStart(2, '0')).join('');
}

const BRANCO_80_SOBRE_PROFUNDO = sobrepor(COR.branco, 0.8, COR.azulProfundo);

/* Onde cada par aparece no hero, e que limiar tem de cumprir. */
const PARES = [
  // coluna esquerda
  { onde: 'título (azul-profundo sobre branco)', fg: COR.azulProfundo, bg: COR.branco, minimo: 3, nota: 'texto grande' },
  { onde: 'destaque do título (azul-vivo sobre branco)', fg: COR.azulVivo, bg: COR.branco, minimo: 3, nota: 'texto grande' },
  { onde: 'subtítulo (texto sobre branco)', fg: COR.texto, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'botão cheio (branco sobre azul-medio)', fg: COR.branco, bg: COR.azulMedio, minimo: 4.5, nota: 'texto normal' },
  { onde: 'ligação Ver exemplos (azul-medio sobre branco)', fg: COR.azulMedio, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'sublinhado da ligação (azul-claro sobre branco)', fg: COR.azulClaro, bg: COR.branco, minimo: 3, nota: 'elemento gráfico', divida: true },

  // esquema
  { onde: 'nome da origem (azul-profundo sobre branco)', fg: COR.azulProfundo, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'símbolo da origem (azul-medio sobre branco)', fg: COR.azulMedio, bg: COR.branco, minimo: 3, nota: 'elemento gráfico' },
  { onde: 'setas convergentes (azul-claro sobre branco)', fg: COR.azulClaro, bg: COR.branco, minimo: 3, nota: 'elemento gráfico', divida: true },
  { onde: 'seta de saída (azul-medio sobre branco)', fg: COR.azulMedio, bg: COR.branco, minimo: 3, nota: 'elemento gráfico' },

  // cartão de resultado
  { onde: 'cartão, título do cabeçalho (branco sobre azul-profundo)', fg: COR.branco, bg: COR.azulProfundo, minimo: 4.5, nota: 'texto normal' },
  { onde: 'cartão, hora de entrega (branco a 80% sobre azul-profundo)', fg: BRANCO_80_SOBRE_PROFUNDO, bg: COR.azulProfundo, minimo: 4.5, nota: 'texto normal' },
  { onde: 'cartão, números (azul-profundo sobre branco)', fg: COR.azulProfundo, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'cartão, texto corrido (texto sobre branco)', fg: COR.texto, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'cartão, linha destacada (azul-medio sobre branco)', fg: COR.azulMedio, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
  { onde: 'nota sob o cartão (suave sobre branco)', fg: COR.suave, bg: COR.branco, minimo: 4.5, nota: 'texto normal' },
];

describe('contraste do hero', () => {
  PARES.filter((p) => !p.divida).forEach(({ onde, fg, bg, minimo, nota }) => {
    test(`${onde} cumpre ${minimo}:1 (${nota})`, () => {
      const r = contraste(fg, bg);
      expect(Number(r.toFixed(2))).toBeGreaterThanOrEqual(minimo);
    });
  });

  /**
   * Dívida conhecida, à espera de decisão do Rui.
   *
   * O azul-claro (#4FA3DC) dá 2.76:1 sobre branco e o mínimo para um
   * elemento gráfico que carrega informação é 3:1. É a cor das setas, e são
   * as setas que dizem que aquilo tudo converge num sítio só.
   *
   * Não se muda a cor por iniciativa própria: é escolha de desenho e está
   * escrita no pedido. Mas também não se finge que passa. Estes testes
   * travam a PIORA e imprimem o número, para não cair no esquecimento.
   *
   * Sair daqui é escolher uma de duas: escurecer o azul-claro 5%, para
   * #4B9BD1, que dá 3.04:1 e é indistinguível a olho, ou passar as setas
   * para azul-medio, que já dá 6.83:1.
   */
  PARES.filter((p) => p.divida).forEach(({ onde, fg, bg, minimo }) => {
    test(`DIVIDA CONHECIDA, nao piora: ${onde} (minimo ${minimo}:1)`, () => {
      const r = contraste(fg, bg);
      expect(Number(r.toFixed(2))).toBeGreaterThanOrEqual(2.76);
    });
  });

  test('o destaque do cartão não depende só da cor', () => {
    // O azul-medio do destaque e o texto corrido têm quase a mesma
    // luminosidade (1.19:1): quem não distinga matizes não vê ali cor
    // nenhuma a mudar. O que faz a linha saltar é o peso da letra, e é
    // por isso que ela tem de continuar a bold. Colorir sem engrossar
    // deixaria o destaque invisível para essas pessoas.
    const soCor = contraste(COR.azulMedio, COR.texto);
    expect(soCor).toBeLessThan(1.5);
  });

  test('tabela', () => {
    const linhas = PARES.map(({ onde, fg, bg, minimo, divida }) => {
      const r = contraste(fg, bg);
      const estado = r >= minimo ? 'passa' : divida ? 'DIVIDA' : 'FALHA';
      return `${r.toFixed(2).padStart(6)}:1  min ${String(minimo).padStart(3)}  ${estado.padEnd(6)}  ${onde}`;
    });
    // eslint-disable-next-line no-console
    console.log('\n' + linhas.join('\n') + '\n');
    expect(linhas.length).toBe(PARES.length);
  });
});

module.exports = { contraste, luminancia, sobrepor, COR };
