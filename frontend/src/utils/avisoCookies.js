// Ponte entre o aviso de cookies e quem precise de saber que ele está no ecrã.
//
// Hoje só o botão flutuante de contacto precisa: os dois vivem no mesmo canto
// de baixo no telemóvel e não podem estar no ecrã ao mesmo tempo.

export const CHAVE_CONSENTIMENTO = 'nexugal_cookie_consent';
export const EVENTO_AVISO = 'nexugal:aviso-cookies';

/**
 * Já houve resposta ao aviso? Se já houve, ele nunca chega a aparecer.
 * Em navegação privada o localStorage pode rebentar: aí assume-se que o aviso
 * vai aparecer, que é o lado seguro para quem partilha o canto com ele.
 */
export function consentimentoDado() {
  try {
    return !!window.localStorage.getItem(CHAVE_CONSENTIMENTO);
  } catch (erro) {
    return false;
  }
}

/** O aviso diz que entrou no ecrã, ou que saiu. */
export function anunciarAviso(visivel) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENTO_AVISO, { detail: visivel }));
}
