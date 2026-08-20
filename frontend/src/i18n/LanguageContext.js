import React, { createContext, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import translations from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Detecta o idioma com base no endpoint
  const isEnglish = location.pathname.startsWith('/us');
  const lang = isEnglish ? 'en' : 'pt';
  const t = translations[lang];

  const toggleLanguage = () => {
    if (lang === 'pt') {
      navigate('/us');
    } else {
      navigate('/');
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
}
