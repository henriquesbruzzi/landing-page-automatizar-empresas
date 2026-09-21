// Entrada partilhada por todo o site: fade com uma subida ligeira.
// O elemento ocupa sempre o mesmo espaço, por isso nada salta durante a entrada.
//
// SEM USO desde 21/09/2026. O último a usá-la era o hero, que punha o
// subtítulo, os botões e o esquema à espera do título escrito; isso atrasava a
// página composta (LCP) em 1,5 s num telemóvel. Fica para o dia em que alguma
// entrada voltar. Se voltar no topo da página, não a pôr a esperar por nada.

/**
 * Classes da entrada de um elemento.
 * @param {boolean} visivel - já entrou no ecrã?
 * @param {boolean} semAnimacao - o sistema pede animações reduzidas?
 */
export function classesEntrada(visivel, semAnimacao) {
  if (semAnimacao) return 'opacity-100 translate-y-0';

  return `transition-all duration-300 ease-out ${
    visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
  }`;
}

/**
 * Atraso de um elemento dentro da cadeia da sua secção, em milissegundos.
 */
export function atrasoEntrada(ms, visivel, semAnimacao) {
  return { transitionDelay: !semAnimacao && visivel ? `${ms}ms` : '0ms' };
}
