import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTypewriter } from '../hooks/useTypewriter';

function Hero() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // Texto completo para o typewriter (sem a parte highlight, que vem separada)
  const fullText = useMemo(
    () => t.hero.title_line1 + '\n' + t.hero.title_line2_start + t.hero.title_line2_highlight,
    [t.hero.title_line1, t.hero.title_line2_start, t.hero.title_line2_highlight]
  );

  const { displayedText, showCursor, isTypingDone } = useTypewriter(fullText, lang);

  // Calcula o que mostrar em cada parte com base no texto digitado até agora
  const line1Full = t.hero.title_line1;
  const line2StartFull = t.hero.title_line2_start;
  const highlightFull = t.hero.title_line2_highlight;

  // Separa o texto exibido nas partes correspondentes
  const parts = displayedText.split('\n');
  const displayedLine1 = parts[0] || '';
  const displayedLine2Full = parts[1] || '';

  // Dentro da linha 2, separa a parte normal da parte em destaque
  let displayedLine2Start = '';
  let displayedHighlight = '';

  if (displayedLine2Full.length <= line2StartFull.length) {
    displayedLine2Start = displayedLine2Full;
  } else {
    displayedLine2Start = line2StartFull;
    displayedHighlight = displayedLine2Full.substring(line2StartFull.length);
  }

  return (
    <section
      id="home"
      className="relative w-full h-screen flex items-center justify-center"
    >
      {/* Conteúdo centralizado */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        {/* Título principal com Typewriter */}
        <h1 className="font-orbitron text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-[0.08em] mb-10 min-h-[2.5em] sm:min-h-[2.8em]">
          {displayedLine1}
          <br />
          {displayedLine2Start}
          <span className="text-cyan-neon">{displayedHighlight}</span>
          {/* Cursor piscante */}
          {showCursor && (
            <span className="inline-block w-[3px] h-[0.9em] bg-cyan-neon ml-1 align-middle animate-blink" />
          )}
        </h1>

        {/* Botão Ghost CTA - aparece com fade após digitação */}
        <button
          onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
          className={`
            font-orbitron
            text-sm
            sm:text-base
            font-normal
            text-white
            tracking-[0.15em]
            px-10
            py-4
            border
            border-cyan-neon
            rounded-full
            bg-black/90
            cursor-pointer
            transition-all
            duration-700
            hover:shadow-neon-glow
            hover:text-cyan-neon
            hover:border-cyan-neon
            active:scale-95
            ${isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {t.hero.cta}
        </button>
      </div>
    </section>
  );
}

export default Hero;
