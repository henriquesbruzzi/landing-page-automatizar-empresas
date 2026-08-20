import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

function FAQPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const goHome = () => {
    navigate(lang === 'pt' ? '/' : '/us');
  };

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Vídeo de fundo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-20"
        aria-hidden="true"
      >
        <source src="/videos/landingpage.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black z-[1]"></div>

      {/* Conteúdo */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Header simples */}
        <div className="px-6 md:px-10 lg:px-16 pt-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={goHome}
              className="font-orbitron text-white/50 text-xs sm:text-sm tracking-[0.15em] hover:text-cyan-neon transition-colors duration-300"
            >
              {t.faq.back}
            </button>
            <a
              href={lang === 'pt' ? '/' : '/us'}
              className="font-orbitron text-white/70 text-lg font-bold tracking-[0.2em] hover:text-cyan-neon transition-colors duration-300"
              aria-label="Nexugal — Ir para a página principal"
            >
              Nexugal
            </a>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="flex-1 flex items-start justify-center px-6 py-16">
          <div className="w-full max-w-3xl">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="font-orbitron text-cyan-neon text-xs tracking-[0.3em] uppercase mb-4 block">
                {t.faq.subtitle}
              </span>
              <h1 id="faq-title" className="font-orbitron text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em] mb-4">
                {t.faq.title}
                <span className="text-cyan-neon">{t.faq.titleHighlight}</span>
              </h1>
              <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                {t.faq.description}
              </p>
            </div>

            {/* Accordion FAQ */}
            <div className="space-y-4" role="list" aria-labelledby="faq-title">
              {t.faq.items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    role="listitem"
                    className={`rounded-2xl border transition-all duration-500 ${
                      isOpen
                        ? 'border-cyan-neon/30 bg-white/[0.04] shadow-[0_0_30px_rgba(0,209,255,0.05)]'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full flex items-center justify-between p-6 md:p-8 text-left group cursor-pointer"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <h2 className={`font-orbitron text-sm md:text-base font-semibold tracking-[0.03em] pr-6 leading-relaxed transition-colors duration-300 ${
                        isOpen ? 'text-cyan-neon' : 'text-white/80 group-hover:text-white'
                      }`}>
                        {item.question}
                      </h2>

                      {/* Ícone +/- */}
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
                        isOpen
                          ? 'border-cyan-neon/50 bg-cyan-neon/10 rotate-45'
                          : 'border-white/10 bg-white/[0.02] group-hover:border-white/20'
                      }`}>
                        <svg
                          className={`w-4 h-4 transition-colors duration-300 ${
                            isOpen ? 'text-cyan-neon' : 'text-white/40'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </span>
                    </button>

                    {/* Resposta com animação */}
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      className={`overflow-hidden transition-all duration-500 ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8">
                        <div className="h-[1px] bg-gradient-to-r from-cyan-neon/20 via-cyan-neon/10 to-transparent mb-5"></div>
                        <p className="text-white/50 text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA após FAQ */}
            <div className="mt-16 text-center">
              <p className="text-white/30 text-sm mb-6">
                {lang === 'pt'
                  ? 'Não encontrou a resposta que procura?'
                  : "Didn't find the answer you're looking for?"}
              </p>
              <button
                onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
                className="
                  font-orbitron
                  text-sm
                  font-normal
                  text-white
                  tracking-[0.15em]
                  px-10
                  py-4
                  border
                  border-cyan-neon
                  rounded-full
                  bg-cyan-neon/10
                  cursor-pointer
                  transition-all
                  duration-500
                  hover:bg-cyan-neon/20
                  hover:shadow-[0_0_25px_rgba(0,209,255,0.15)]
                  hover:text-cyan-neon
                  active:scale-95
                "
              >
                {lang === 'pt' ? 'Fale Connosco' : 'Contact Us'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pb-8">
          <p className="text-center text-white/15 text-xs tracking-[0.15em] font-orbitron">
            © {new Date().getFullYear()} Nexugal
          </p>
        </footer>
      </main>
    </div>
  );
}

export default FAQPage;
