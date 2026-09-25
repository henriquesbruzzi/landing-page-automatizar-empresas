import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { CHAVE_CONSENTIMENTO, anunciarAviso, consentimentoDado } from '../utils/avisoCookies';

function CookieBanner() {
  const { lang, t } = useLanguage();
  const cb = t.cookieBanner;
  // Aparece logo, com o resto da página, sem esperar nem deslizar. Até
  // 21/09/2026 esperava 1,2 s e entrava a deslizar meio segundo: no telemóvel
  // é o maior bloco do ecrã, e a Google só dava a página por composta (LCP)
  // quando ele acabava de entrar, aos 4,1 s em 4G lenta.
  const [visible, setVisible] = useState(() => !consentimentoDado());

  // Quem partilha o canto de baixo precisa de saber que este aviso está lá
  useEffect(() => {
    anunciarAviso(visible);
    return () => anunciarAviso(false);
  }, [visible]);

  const accept = (type) => {
    try {
      localStorage.setItem(CHAVE_CONSENTIMENTO, type);
    } catch (erro) {
      // Armazenamento bloqueado (navegação privada, cookies desligados):
      // não fica guardado, mas o aviso fecha na mesma.
    }
    setVisible(false);
  };

  if (!visible) return null;

  const privacyHref = lang === 'pt' ? '/privacidade' : '/us/privacy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={cb.title}
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
    >
      {/* Sem desfoque por trás (backdrop-blur): o fundo é branco sólido e o
          desfoque não se via, mas custava ~50 ms à primeira imagem da página.
          O relative faz o que o desfoque fazia sem se dar por isso: segura o
          fio decorativo do topo dentro do cartão. Sem ele, o fio salta para o
          topo da faixa de fora e atravessa o ecrã todo. */}
      <div className="relative max-w-4xl mx-auto bg-white border border-linha rounded-2xl p-6 md:p-8 shadow-azul-lg">
        {/* Glow decorativo */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-azul-claro to-transparent rounded-t-2xl" />

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Ícone + Texto */}
          <div className="flex gap-4 flex-1">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-azul-vivo/10 border border-azul-claro flex items-center justify-center mt-0.5">
              <svg className="w-5 h-5 text-azul-medio" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-azul-profundo text-sm font-semibold tracking-[0.1em] mb-2">
                {cb.title}
              </h2>
              <p className="text-texto text-xs md:text-sm leading-relaxed">
                {cb.description}{' '}
                <Link
                  to={privacyHref}
                  className="text-azul-medio underline underline-offset-2 hover:text-azul-profundo transition-colors duration-200"
                  onClick={() => setVisible(false)}
                >
                  {cb.learnMore}
                </Link>
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => accept('essential')}
              className="text-xs tracking-[0.1em] px-5 py-3 rounded-full border border-linha text-texto hover:border-azul-medio hover:text-azul-profundo transition-all duration-300"
            >
              {cb.acceptEssential}
            </button>
            <button
              onClick={() => accept('all')}
              className="rounded-full bg-azul-medio px-5 py-3 text-xs font-semibold tracking-[0.1em] text-white shadow-azul transition-colors duration-300 hover:bg-azul-profundo active:scale-95"
            >
              {cb.acceptAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
