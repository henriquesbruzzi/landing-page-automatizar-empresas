import React, { createContext, useContext } from 'react';
import { useChat } from '../hooks/useChat';
import { useLanguage } from '../../i18n/LanguageContext';

const ChatContext = createContext(null);

/**
 * Provider do contexto do chat
 */
export const ChatProvider = ({ children }) => {
  const { lang } = useLanguage();
  const chat = useChat(lang);

  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
};

/**
 * Hook para usar o contexto do chat
 */
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};
