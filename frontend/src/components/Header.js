import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, t, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trava o scroll do body enquanto o menu mobile está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Se estiver em PT, mostra bandeira dos EUA para trocar para EN
  // Se estiver em EN, mostra bandeira de Portugal para trocar para PT
  const flagIcon = lang === 'pt' ? '/icons/united-states-120.png' : '/icons/portugal-120.png';
  const flagAlt = lang === 'pt' ? 'Switch to English' : 'Mudar para Português';

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isMenuOpen
          ? 'bg-white h-screen overflow-hidden'
          : isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-linha'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 relative z-50">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href={lang === 'pt' ? '/' : '/us'}
            className="font-orbitron text-azul-medio text-lg md:text-xl font-bold tracking-[0.2em] hover:text-azul-profundo transition-colors duration-300 relative z-50"
            aria-label="Nexugal, ir para a página principal"
          >
            NEXUGAL
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Navegação principal">
            <a
              href="#home"
              className="text-texto text-sm tracking-[0.15em] hover:text-azul-profundo transition-all duration-300 relative group"
            >
              {t.nav.home}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-azul-medio group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#exemplos"
              className="text-texto text-sm tracking-[0.15em] hover:text-azul-profundo transition-all duration-300 relative group"
            >
              {t.nav.services}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-azul-medio group-hover:w-full transition-all duration-300"></span>
            </a>
            <button
              onClick={() => navigate(lang === 'pt' ? '/sobre' : '/us/about')}
              className="text-texto text-sm tracking-[0.15em] hover:text-azul-profundo transition-all duration-300 relative group cursor-pointer"
            >
              {t.nav.about}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-azul-medio group-hover:w-full transition-all duration-300"></span>
            </button>
            <button
              onClick={() => navigate(lang === 'pt' ? '/faq' : '/us/faq')}
              className="text-texto text-sm tracking-[0.15em] hover:text-azul-profundo transition-all duration-300 relative group cursor-pointer"
            >
              {t.nav.faq}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-azul-medio group-hover:w-full transition-all duration-300"></span>
            </button>

            {/* Mesmo destino do "Falar connosco" do hero */}
            <button
              onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
              className="text-texto text-sm tracking-[0.15em] hover:text-azul-profundo transition-all duration-300 relative group cursor-pointer"
            >
              {t.nav.contact}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-azul-medio group-hover:w-full transition-all duration-300"></span>
            </button>

            {/* Bandeira para trocar idioma */}
            <button
              onClick={toggleLanguage}
              className="w-8 h-8 rounded-full overflow-hidden border border-linha hover:border-azul-medio transition-all duration-300 cursor-pointer flex-shrink-0 hover:scale-110"
              title={flagAlt}
            >
              <img
                src={flagIcon}
                alt={flagAlt}
                className="w-full h-full object-cover"
              />
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px] group z-50 relative"
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-[2px] bg-azul-profundo transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-[8px]' : ''
              }`}
            ></span>
            <span
              className={`block w-6 h-[2px] bg-azul-profundo transition-all duration-300 ${
                isMenuOpen ? 'opacity-0 scale-0' : ''
              }`}
            ></span>
            <span
              className={`block w-6 h-[2px] bg-azul-profundo transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 w-screen h-screen bg-white z-40 transition-all duration-300 flex flex-col justify-center items-center ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col items-center justify-center gap-10">
          <a
            href="#home"
            onClick={() => setIsMenuOpen(false)}
            className="text-texto text-xl tracking-widest text-center sm:text-2xl sm:tracking-[0.2em] hover:text-azul-medio transition-all duration-300"
          >
            {t.nav.home}
          </a>
          <a
            href="#exemplos"
            onClick={() => setIsMenuOpen(false)}
            className="text-texto text-xl tracking-widest text-center sm:text-2xl sm:tracking-[0.2em] hover:text-azul-medio transition-all duration-300"
          >
            {t.nav.services}
          </a>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              navigate(lang === 'pt' ? '/sobre' : '/us/about');
            }}
            className="text-texto text-xl tracking-widest text-center sm:text-2xl sm:tracking-[0.2em] hover:text-azul-medio transition-all duration-300 cursor-pointer"
          >
            {t.nav.about}
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              navigate(lang === 'pt' ? '/faq' : '/us/faq');
            }}
            className="text-texto text-xl tracking-widest text-center sm:text-2xl sm:tracking-[0.2em] hover:text-azul-medio transition-all duration-300 cursor-pointer"
          >
            {t.nav.faq}
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              navigate(lang === 'pt' ? '/contacto' : '/us/contact');
            }}
            className="text-texto text-xl tracking-widest text-center sm:text-2xl sm:tracking-[0.2em] hover:text-azul-medio transition-all duration-300 cursor-pointer"
          >
            {t.nav.contact}
          </button>

          {/* Bandeira para trocar idioma - Mobile */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              toggleLanguage();
            }}
            className="w-10 h-10 rounded-full overflow-hidden border border-linha hover:border-azul-medio mt-4 transition-all duration-300"
            title={flagAlt}
          >
            <img
              src={flagIcon}
              alt={flagAlt}
              className="w-full h-full object-cover"
            />
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
