import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ChatProvider, useChatContext } from '../context/ChatContext';
import ChatWindow from './ChatWindow';
import ChatButton from './ChatButton';
import '../styles/chatbot.css';

/**
 * Componente interno que usa o contexto
 */
const ChatWidgetContent = () => {
  const { lang } = useLanguage();
  const { isOpen, toggleChat, closeChat } = useChatContext();

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <ChatWindow 
          lang={lang} 
          onClose={closeChat}
        />
      )}
      <ChatButton 
        isOpen={isOpen} 
        onClick={toggleChat}
        lang={lang}
      />
    </div>
  );
};

/**
 * Componente principal do Chatbot
 * Widget flutuante que pode ser aberto/fechado
 */
const ChatWidget = () => {
  return (
    <ChatProvider>
      <ChatWidgetContent />
    </ChatProvider>
  );
};

export default ChatWidget;
