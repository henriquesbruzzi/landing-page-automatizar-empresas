import React from 'react';
import { useChatContext } from '../context/ChatContext';
import Message from './Message';

/**
 * Lista de mensagens do chat
 */
const MessageList = ({ lang }) => {
  const { messages, isLoading, messagesEndRef } = useChatContext();

  return (
    <div className="chatbot-messages">
      <div className="chatbot-messages__container">
        {messages.map((message) => (
          <Message key={message.id} message={message} lang={lang} />
        ))}
        {isLoading && (
          <div className="chatbot-message chatbot-message--assistant">
            <div className="chatbot-message__content">
              <div className="chatbot-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
