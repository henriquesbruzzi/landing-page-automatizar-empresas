import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTypewriter } from '../hooks/useTypewriter';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import EsquemaIntegracoes from './EsquemaIntegracoes';

// Só o título se escreve. O subtítulo, os botões e o esquema aparecem logo:
// até 21/09/2026 esperavam que o título acabasse de se escrever (1,3 s, mais
// num telemóvel lento), e a Google só dava a página por composta depois disso.
// A entrada antiga (fade com subida) está em utils/entrada.js, sem uso.

/**
 * Mancha azul do canto superior direito.
 *
 * Tem máscara e desfoque de propósito. Antes era uma forma de contorno nítido
 * e o cartão de resultado apanhava-lhe a borda pelo lado direito, o que criava
 * uma linha dura mesmo ao lado da coisa que tem de ser mais legível do ecrã.
 * A máscara apaga a mancha na direcção do cartão, em baixo e à esquerda, e o
 * desfoque tira-lhe a aresta: o cartão fica sempre sobre branco.
 */
function MancaFundo() {
  const dissolver = 'radial-gradient(circle at 74% 26%, #000 26%, rgba(0,0,0,0.45) 52%, transparent 74%)';
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-56 -top-64 h-[40rem] w-[40rem] opacity-50 blur-[70px]"
      style={{
        borderRadius: '47% 53% 38% 62% / 55% 40% 60% 45%',
        background: 'linear-gradient(150deg, #1595DC 0%, #1B5AA8 48%, #0F2E5C 100%)',
        WebkitMaskImage: dissolver,
        maskImage: dissolver,
      }}
    />
  );
}

function Hero() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const semAnimacao = usePrefersReducedMotion();

  // Texto completo para o typewriter (sem a parte highlight, que vem separada)
  const fullText = useMemo(
    () => t.hero.title_line1 + '\n' + t.hero.title_line2_start + t.hero.title_line2_highlight,
    [t.hero.title_line1, t.hero.title_line2_start, t.hero.title_line2_highlight]
  );

  const { displayedText, showCursor } = useTypewriter(fullText, lang);

  const line2StartFull = t.hero.title_line2_start;

  const parts = displayedText.split('\n');
  const displayedLine1 = parts[0] || '';
  const displayedLine2Full = parts[1] || '';

  let displayedLine2Start = '';
  let displayedHighlight = '';

  if (displayedLine2Full.length <= line2StartFull.length) {
    displayedLine2Start = displayedLine2Full;
  } else {
    displayedLine2Start = line2StartFull;
    displayedHighlight = displayedLine2Full.substring(line2StartFull.length);
  }

  const irParaExemplos = () => {
    const alvo = document.getElementById('exemplos');
    if (alvo) alvo.scrollIntoView({ behavior: semAnimacao ? 'auto' : 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden bg-white pb-12 pt-28 lg:pb-16 lg:pt-32"
    >
      <MancaFundo />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        {/* A partir de xl o esquema deita-se da esquerda para a direita e
            precisa de mais linha do que a coluna do texto: daí a fatia mudar
            de 0.9/1.1 para 0.72/1.28. Abaixo de xl o esquema está empilhado e
            as duas colunas voltam a ficar quase iguais. */}
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          {/* ---------------- esquerda: título, subtítulo e acções ------------- */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="grid font-display text-3xl font-bold leading-tight tracking-[0.04em] text-azul-profundo sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl">
              {/* Cópia invisível: reserva desde o início o espaço do título
                  completo, para que nada salte enquanto as letras aparecem */}
              <span className="invisible col-start-1 row-start-1" aria-hidden="true">
                {t.hero.title_line1}
                <br />
                {t.hero.title_line2_start}
                {t.hero.title_line2_highlight}
              </span>

              <span className="col-start-1 row-start-1">
                {displayedLine1}
                <br />
                {displayedLine2Start}
                <span className="text-azul-vivo">{displayedHighlight}</span>
                {showCursor && (
                  <span className="ml-1 inline-block h-[0.9em] w-[3px] animate-blink bg-azul-medio align-middle" />
                )}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-texto md:text-base">
              {t.hero.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              {/* Cheio de propósito. Vazado, perdia a atenção para o botão do
                  aviso de cookies, que é o oposto do que se quer. */}
              <button
                id="cta-hero"
                onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
                className="rounded-full bg-azul-medio px-9 py-4 text-sm font-semibold tracking-[0.06em] text-white shadow-azul transition-colors duration-300 hover:bg-azul-profundo active:scale-95 sm:text-base"
              >
                {t.hero.cta}
              </button>

              <button
                onClick={irParaExemplos}
                className="border-b-2 border-azul-claro pb-1 text-sm font-semibold text-azul-medio transition-colors duration-300 hover:border-azul-medio sm:text-base"
              >
                {t.hero.ctaSecundario}
              </button>
            </div>
          </div>

          {/* ---------------- direita: esquema de integrações ------------------ */}
          <div>
            <EsquemaIntegracoes esquema={t.hero.esquema} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
