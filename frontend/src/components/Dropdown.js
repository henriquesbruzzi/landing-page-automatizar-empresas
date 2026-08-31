import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

// Lista de escolha própria, no lugar do <select> do sistema. O <select> nativo
// abre um bloco cinzento com as opções coladas umas às outras e não aceita
// estilo nenhum, por isso desenhamos a lista à mão.
//
// O valor que sai daqui é exatamente o mesmo texto que o <select> enviava,
// por isso o backend continua a receber o que sempre recebeu.

const NENHUMA = -1;

function Dropdown({ value, options, placeholder, onChange, campoClasses, labelId, erro, erroId }) {
  const [aberta, setAberta] = useState(false);
  const [ativo, setAtivo] = useState(NENHUMA);
  const raiz = useRef(null);
  const botao = useRef(null);
  const itens = useRef([]);
  const id = useId();
  const idBotao = `${id}-botao`;
  const idLista = `${id}-lista`;
  const idOpcao = (i) => `${id}-opcao-${i}`;

  const fechar = useCallback((devolverFoco = true) => {
    setAberta(false);
    setAtivo(NENHUMA);
    if (devolverFoco && botao.current) botao.current.focus();
  }, []);

  // Abre já com o cursor em cima da opção escolhida, ou na primeira
  const abrir = useCallback(() => {
    const escolhida = options.indexOf(value);
    setAtivo(escolhida >= 0 ? escolhida : 0);
    setAberta(true);
  }, [options, value]);

  // Fecha ao carregar fora da lista
  useEffect(() => {
    if (!aberta) return undefined;

    const fora = (evento) => {
      if (raiz.current && !raiz.current.contains(evento.target)) {
        setAberta(false);
        setAtivo(NENHUMA);
      }
    };

    document.addEventListener('mousedown', fora);
    document.addEventListener('touchstart', fora);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('touchstart', fora);
    };
  }, [aberta]);

  // Mantém à vista a opção onde o teclado está
  useEffect(() => {
    if (!aberta || ativo < 0) return;
    const item = itens.current[ativo];
    if (item) item.scrollIntoView({ block: 'nearest' });
  }, [aberta, ativo]);

  const escolher = (indice) => {
    const escolha = options[indice];
    if (escolha === undefined) return;
    onChange(escolha);
    fechar();
  };

  const mover = (passo) => {
    setAtivo((atual) => {
      const seguinte = (atual < 0 ? 0 : atual) + passo;
      if (seguinte < 0) return options.length - 1;
      if (seguinte >= options.length) return 0;
      return seguinte;
    });
  };

  const aoTeclado = (evento) => {
    switch (evento.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        evento.preventDefault();
        if (aberta) mover(evento.key === 'ArrowDown' ? 1 : -1);
        else abrir();
        break;
      case 'Home':
        if (aberta) { evento.preventDefault(); setAtivo(0); }
        break;
      case 'End':
        if (aberta) { evento.preventDefault(); setAtivo(options.length - 1); }
        break;
      case 'Enter':
      case ' ':
        evento.preventDefault();
        if (aberta) escolher(ativo);
        else abrir();
        break;
      case 'Escape':
        if (aberta) { evento.preventDefault(); fechar(); }
        break;
      case 'Tab':
        // Sai do campo sem escolher nada
        if (aberta) { setAberta(false); setAtivo(NENHUMA); }
        break;
      default:
        break;
    }
  };

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        id={idBotao}
        ref={botao}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberta}
        aria-controls={aberta ? idLista : undefined}
        aria-activedescendant={aberta && ativo >= 0 ? idOpcao(ativo) : undefined}
        aria-labelledby={`${labelId} ${idBotao}`}
        aria-invalid={erro ? 'true' : 'false'}
        aria-describedby={erro ? erroId : undefined}
        onClick={() => (aberta ? fechar() : abrir())}
        onKeyDown={aoTeclado}
        className={`${campoClasses} flex items-center justify-between gap-3 text-left cursor-pointer ${
          aberta ? 'border-cyan-neon shadow-[0_0_20px_rgba(0,209,255,0.25)]' : ''
        } ${erro ? 'ring-1 ring-red-400/70' : ''}`}
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <svg
          className={`w-5 h-5 shrink-0 text-cyan-neon transition-transform duration-300 ${aberta ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {aberta && (
        <ul
          id={idLista}
          role="listbox"
          aria-labelledby={labelId}
          // Fundo opaco de propósito: o vídeo de fundo passa por trás e a lista
          // tem de se ler. #0f0f0f é o tom que bg-white/[0.06] dá sobre preto,
          // o mesmo dos outros campos.
          className="absolute left-0 right-0 top-full mt-2 z-30 max-h-[26rem] overflow-y-auto rounded-xl border border-white/20 bg-[#0f0f0f] shadow-[0_20px_45px_rgba(0,0,0,0.75)] py-1"
        >
          {options.map((opcao, i) => (
            <li
              key={opcao}
              id={idOpcao(i)}
              ref={(elemento) => { itens.current[i] = elemento; }}
              role="option"
              aria-selected={opcao === value}
              onMouseEnter={() => setAtivo(i)}
              // Não deixa o rato tirar o foco ao botão antes do clique contar
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={() => escolher(i)}
              className={`px-5 py-3 text-sm tracking-wide leading-snug cursor-pointer transition-colors duration-150 ${
                i > 0 ? 'border-t border-white/10' : ''
              } ${
                i === ativo
                  ? 'bg-cyan-neon/20 text-white'
                  : opcao === value
                    ? 'text-cyan-neon'
                    : 'text-gray-200'
              }`}
            >
              {opcao}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
