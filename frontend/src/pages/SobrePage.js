import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import About from '../components/About';

/**
 * Página do "quem somos".
 *
 * Saiu da página inicial e passou a ter endereço próprio, /sobre e /us/about,
 * pelo mesmo padrão do contacto, da FAQ e da privacidade. A casca é a mesma
 * dessas: voltar ao início à esquerda, logótipo à direita, e o conteúdo por
 * baixo. O conteúdo em si é o mesmo componente de sempre, não foi tocado.
 */
function SobrePage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const irParaInicio = () => navigate(lang === 'pt' ? '/' : '/us');

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <main className="relative z-10 flex min-h-screen flex-col">
        <div className="px-6 pt-8 md:px-10 lg:px-16">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button
              onClick={irParaInicio}
              className="text-xs tracking-[0.15em] text-texto transition-colors duration-300 hover:text-azul-medio sm:text-sm"
            >
              {t.faq.back}
            </button>
            <a
              href={lang === 'pt' ? '/' : '/us'}
              className="font-orbitron text-lg font-bold tracking-[0.2em] text-azul-medio transition-colors duration-300 hover:text-azul-profundo"
              aria-label="Nexugal, ir para a página principal"
            >
              NEXUGAL
            </a>
          </div>
        </div>

        <div className="flex-1">
          <About />
        </div>

        <footer className="pb-8">
          <p className="text-center text-xs tracking-[0.15em] text-texto">
            © {new Date().getFullYear()} Nexugal
          </p>
        </footer>
      </main>
    </div>
  );
}

export default SobrePage;
