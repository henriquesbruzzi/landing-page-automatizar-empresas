import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';

/**
 * Janela principal do chat
 */
const ChatWindow = ({ lang, onClose }) => {
  return (
    <div className="chatbot-window">
      <ChatHeader lang={lang} onClose={onClose} />
      <MessageList lang={lang} />
      <MessageInput lang={lang} />
    </div>
  );
};

export default ChatWindow;
