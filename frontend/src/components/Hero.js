import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTypewriter } from '../hooks/useTypewriter';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { classesEntrada, atrasoEntrada } from '../utils/entrada';
import { pedirDestaque } from '../utils/destaqueServico';

// Entrada faseada, em ms, a contar do momento em que o título fica escrito
const ATRASO_SUBTITULO = 0;
const ATRASO_BOTAO = 150;
const ATRASO_LISTA = 280;
const ATRASO_ENTRE_ITENS = 50;

function Hero() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const semAnimacao = usePrefersReducedMotion();

  // Texto completo para o typewriter (sem a parte highlight, que vem separada)
  const fullText = useMemo(
    () => t.hero.title_line1 + '\n' + t.hero.title_line2_start + t.hero.title_line2_highlight,
    [t.hero.title_line1, t.hero.title_line2_start, t.hero.title_line2_highlight]
  );

  const { displayedText, showCursor, isTypingDone } = useTypewriter(fullText, lang);

  // Calcula o que mostrar em cada parte com base no texto digitado até agora
  const line2StartFull = t.hero.title_line2_start;

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

  // Cada fase entra com fade e uma subida ligeira, uma vez só, no arranque.
  // Com animações reduzidas, tudo já está no sítio desde o primeiro instante.
  // Mesma entrada das restantes secções do site
  const entrada = classesEntrada(isTypingDone, semAnimacao);
  const atraso = (ms) => atrasoEntrada(ms, isTypingDone, semAnimacao);

  return (
    <section
      id="home"
      className="relative w-full min-h-screen flex items-center py-32 lg:py-28"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Coluna esquerda — título, subtítulo e CTA */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Título principal com Typewriter */}
            <h1 className="grid font-orbitron text-white text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-[0.06em]">
              {/* Cópia invisível: reserva desde o início o espaço do título
                  completo, para que nada salte enquanto as letras aparecem */}
              <span className="col-start-1 row-start-1 invisible" aria-hidden="true">
                {t.hero.title_line1}
                <br />
                {t.hero.title_line2_start}
                {t.hero.title_line2_highlight}
              </span>

              {/* Texto escrito letra a letra, por cima da cópia invisível */}
              <span className="col-start-1 row-start-1">
                {displayedLine1}
                <br />
                {displayedLine2Start}
                <span className="text-cyan-neon">{displayedHighlight}</span>
                {/* Cursor piscante */}
                {showCursor && (
                  <span className="inline-block w-[3px] h-[0.9em] bg-cyan-neon ml-1 align-middle animate-blink" />
                )}
              </span>
            </h1>

            {/* Fase 1 — subtítulo */}
            <p
              className={`texto-sobre-video text-white/90 text-sm md:text-base leading-relaxed max-w-md mt-6 ${entrada}`}
              style={atraso(ATRASO_SUBTITULO)}
            >
              {t.hero.subtitle}
            </p>

            {/* Fase 2 — botão Ghost CTA, leva ao formulário de contacto */}
            <button
              onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
              style={atraso(ATRASO_BOTAO)}
              className={`
                font-orbitron
                text-sm
                sm:text-base
                font-normal
                text-white
                tracking-[0.15em]
                px-10
                py-4
                mt-10
                border
                border-cyan-neon
                rounded-full
                bg-black/90
                cursor-pointer
                hover:shadow-neon-glow
                hover:text-cyan-neon
                hover:border-cyan-neon
                active:scale-95
                ${entrada}
              `}
            >
              {t.hero.cta}
            </button>
          </div>

          {/* Fase 3 — lista de serviços, em cadeia, liga aos cartões em #servicos */}
          <ul className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            {/* Os nomes vêm dos próprios cartões, para nunca ficarem desencontrados */}
            {t.services.items.map((service, index) => (
              <li
                key={service.id}
                className={entrada}
                style={atraso(ATRASO_LISTA + index * ATRASO_ENTRE_ITENS)}
              >
                <a
                  href={`#${service.id}`}
                  onClick={() => pedirDestaque(service.id)}
                  className="group flex items-center gap-4 py-4 border-b border-white/10 hover:border-cyan-neon/40 transition-colors duration-300"
                >
                  {/* Marcador */}
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon/40 group-hover:bg-cyan-neon group-hover:shadow-neon-glow transition-all duration-300 shrink-0" />

                  {/* Nome do serviço */}
                  <span className="texto-sobre-video font-orbitron text-white/90 text-xs sm:text-sm tracking-[0.06em] leading-relaxed group-hover:text-white transition-colors duration-300">
                    {service.title}
                  </span>

                  {/* Seta que surge no hover */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-auto w-4 h-4 text-cyan-neon opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Hero;
