import React from 'react';

/**
 * Bloco de conteúdo. Já teve uma entrada animada ao chegar ao ecrã, mas o
 * efeito foi retirado a pedido: o conteúdo aparece de imediato, sem fade nem
 * movimento.
 *
 * Fica como está, e não como um simples <div>, para as secções não terem de
 * ser todas remexidas se um dia se quiser a entrada de volta. Por isso também
 * aceita e ignora o `atraso`.
 */
function Entrada({ children, atraso, className = '', ...resto }) {
  return (
    <div className={className} {...resto}>
      {children}
    </div>
  );
}

export default Entrada;
