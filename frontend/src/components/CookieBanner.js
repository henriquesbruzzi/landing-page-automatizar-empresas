import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const CONSENT_KEY = 'nexugal_cookie_consent';

function CookieBanner() {
  const { lang, t } = useLanguage();
  const cb = t.cookieBanner;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Pequeno atraso para não aparecer durante a animação de entrada da página
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (type) => {
    localStorage.setItem(CONSENT_KEY, type);
    setVisible(false);
  };

  if (!visible) return null;

  const privacyHref = lang === 'pt' ? '/privacidade' : '/us/privacy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={cb.title}
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-slide-up"
      style={{ animation: 'slideUpBanner 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}
    >
      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_-4px_60px_rgba(0,0,0,0.8)] backdrop-blur-md">
        {/* Glow decorativo */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/40 to-transparent rounded-t-2xl" />

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Ícone + Texto */}
          <div className="flex gap-4 flex-1">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-cyan-neon/10 border border-cyan-neon/20 flex items-center justify-center mt-0.5">
              <svg className="w-5 h-5 text-cyan-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <h2 className="font-orbitron text-white text-sm font-semibold tracking-[0.1em] mb-2">
                {cb.title}
              </h2>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                {cb.description}{' '}
                <Link
                  to={privacyHref}
                  className="text-cyan-neon underline underline-offset-2 hover:text-white transition-colors duration-200"
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
              className="font-orbitron text-xs tracking-[0.1em] px-5 py-3 rounded-full border border-white/20 text-gray-200 hover:border-white/50 hover:text-white transition-all duration-300"
            >
              {cb.acceptEssential}
            </button>
            <button
              onClick={() => accept('all')}
              className="font-orbitron text-xs tracking-[0.1em] px-5 py-3 rounded-full border border-cyan-neon text-white bg-cyan-neon/15 hover:bg-cyan-neon/25 hover:shadow-[0_0_20px_rgba(0,209,255,0.25)] transition-all duration-300"
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
