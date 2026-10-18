// Ponte entre o menu de telemóvel e quem precise de saber que ele está aberto.
//
// Hoje só o aviso de cookies precisa: está numa camada acima de tudo e,
// com o menu aberto, tapava os itens e apanhava os toques (num telemóvel
// deitado, os seis). Enquanto o menu estiver aberto, o aviso sai do ecrã, e
// volta igual quando o menu fecha.

export const EVENTO_MENU = 'nexugal:menu-telemovel';

/** O menu diz que abriu, ou que fechou. */
export function anunciarMenu(aberto) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENTO_MENU, { detail: aberto }));
}
