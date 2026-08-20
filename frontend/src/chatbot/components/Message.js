import React from 'react';

/**
 * Componente de mensagem individual
 */
const Message = ({ message, lang }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={`chatbot-message ${
        isUser ? 'chatbot-message--user' : 'chatbot-message--assistant'
      } ${isError ? 'chatbot-message--error' : ''}`}
    >
      <div className="chatbot-message__content">
        <p>{message.content}</p>
        {message.timestamp && (
          <span className="chatbot-message__time">
            {new Date(message.timestamp).toLocaleTimeString(lang === 'pt' ? 'pt-PT' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
      </div>
    </div>
  );
};

export default Message;
