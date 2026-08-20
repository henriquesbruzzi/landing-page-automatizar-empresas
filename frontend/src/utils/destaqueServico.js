// Ponte entre a lista do hero e os cartões da secção de serviços.
// O link continua a ser um endereço normal (#servico-xxx), o que faz o salto
// e mantém o endereço partilhável. Este aviso serve só para acender o cartão,
// e permite repetir o destaque quando se clica duas vezes no mesmo item.

export const EVENTO_DESTAQUE = 'nexugal:destacar-servico';

/** Pede à secção de serviços que acenda o cartão com este id. */
export function pedirDestaque(id) {
  if (typeof window === 'undefined' || !id) return;
  window.dispatchEvent(new CustomEvent(EVENTO_DESTAQUE, { detail: id }));
}
