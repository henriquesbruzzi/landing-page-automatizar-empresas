import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import EsquemaIntegracoes from './EsquemaIntegracoes';

/**
 * Secção de exemplos.
 *
 * Substituiu a grelha de seis cartões que aqui estava. Os cartões diziam o que
 * fazemos por categorias; estes blocos mostram uma situação concreta de cada
 * vez, começando pela dor e acabando no que passa a chegar sozinho.
 *
 * O desenho de cada bloco é o mesmo do hero, e é o mesmo componente: texto à
 * esquerda, esquema à direita, empilhados no telemóvel. A ordem dos blocos vem
 * do translations.js e é deliberada, o mais forte abre e o mais forte fecha.
 */

// Afasta o alvo do menu fixo quando se salta pelo índice
const FOLGA_DO_MENU = 'scroll-mt-28';

function Bloco({ bloco, par }) {
  return (
    <div
      id={bloco.id}
      className={`${FOLGA_DO_MENU} ${par ? 'bg-neve' : 'bg-white'}`}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10 md:py-20 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
          <div>
            <span className="mb-3 block font-display text-xs font-semibold uppercase tracking-[0.22em] text-azul-medio">
              {bloco.rotulo}
            </span>
            {/* A dor é o título. O nome da linha de serviço não aparece em
                lado nenhum: quem lê reconhece-se no problema, não na categoria. */}
            <h3 className="font-display text-2xl font-bold leading-snug tracking-[0.02em] text-azul-profundo md:text-3xl">
              {bloco.dor}
            </h3>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-texto md:text-base">
              {bloco.explicacao}
            </p>
          </div>

          <EsquemaIntegracoes esquema={bloco.esquema} />
        </div>
      </div>
    </div>
  );
}

/**
 * Tira de ferramentas.
 *
 * Por agora só nomes. Cada entrada aceita `logo` no translations.js e passa a
 * imagem sem a tira mudar de forma: o nome fica como texto alternativo, que é
 * o que um leitor de ecrã precisa de ouvir de qualquer maneira.
 */
function Tira({ tira }) {
  return (
    <div className="border-t border-linha bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 lg:px-16">
        <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.22em] text-suave">
          {tira.texto}
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {tira.ferramentas.map((ferramenta) => (
            <li key={ferramenta.id}>
              {ferramenta.logo ? (
                <img
                  src={ferramenta.logo}
                  alt={ferramenta.nome}
                  className="h-6 w-auto opacity-60 grayscale"
                />
              ) : (
                <span className="font-sans text-sm text-texto">{ferramenta.nome}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Exemplos() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const semAnimacao = usePrefersReducedMotion();
  const e = t.exemplos;

  const saltarPara = (id) => {
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: semAnimacao ? 'auto' : 'smooth' });
  };

  return (
    <section id="exemplos" className="relative bg-white" aria-labelledby="exemplos-titulo">
      <div className="absolute left-1/2 top-0 h-[1px] w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-azul-claro to-transparent" />

      {/* ---------------- cabeçalho e índice ---------------- */}
      <div className="mx-auto w-full max-w-7xl px-6 pb-4 pt-16 md:px-10 md:pt-20 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 block font-display text-xs font-semibold uppercase tracking-[0.3em] text-azul-medio">
            {e.rotulo}
          </span>
          <h2
            id="exemplos-titulo"
            className="font-display text-3xl font-bold tracking-[0.04em] text-azul-profundo md:text-4xl lg:text-5xl"
          >
            {e.titulo}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-texto md:text-base">{e.subtitulo}</p>
        </div>

        {/* Índice. Em fila no computador, e a passar à linha no telemóvel: seis
            etiquetas não cabem numa fila de 380px, e uma barra que se arrasta
            para o lado esconde metade delas sem avisar. A passar à linha, vê-se
            tudo de uma vez. */}
        <nav aria-label={e.indiceTitulo} className="mt-10">
          <ul className="flex flex-wrap items-center justify-center gap-2.5">
            {e.blocos.map((bloco) => (
              <li key={bloco.id}>
                <button
                  type="button"
                  onClick={() => saltarPara(bloco.id)}
                  className="rounded-full border border-linha bg-white px-4 py-2 text-xs font-medium text-texto transition-colors duration-300 hover:border-azul-medio hover:text-azul-profundo sm:text-sm"
                >
                  {bloco.indice}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ---------------- os seis blocos ---------------- */}
      <div className="mt-12">
        {e.blocos.map((bloco, i) => (
          <Bloco key={bloco.id} bloco={bloco} par={i % 2 === 1} />
        ))}
      </div>

      {/* ---------------- convite a fechar ---------------- */}
      <div className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 text-center md:px-10 md:py-20 lg:px-16">
          <p className="mx-auto max-w-xl text-base leading-relaxed text-azul-profundo md:text-lg">
            {e.convite.frase}
          </p>
          <button
            type="button"
            onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
            className="mt-8 rounded-full bg-azul-medio px-9 py-4 text-sm font-semibold tracking-[0.06em] text-white shadow-azul transition-colors duration-300 hover:bg-azul-profundo active:scale-95 sm:text-base"
          >
            {e.convite.botao}
          </button>
        </div>
      </div>

      <Tira tira={e.tira} />
    </section>
  );
}

export default Exemplos;
