import React from 'react';

/**
 * Cabeçalho da janela do chat
 */
const ChatHeader = ({ lang, onClose }) => {
  return (
    <div className="chatbot-header">
      <div className="chatbot-header__content">
        <div className="chatbot-header__avatar">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="chatbot-header__info">
          <h3 className="chatbot-header__title">
            {lang === 'pt' ? 'Assistente Virtual' : 'Virtual Assistant'}
          </h3>
          <p className="chatbot-header__subtitle">
            {lang === 'pt' ? 'NEXUGAL' : 'NEXUGAL'}
          </p>
        </div>
      </div>
      <button
        className="chatbot-header__close"
        onClick={onClose}
        aria-label={lang === 'pt' ? 'Fechar chat' : 'Close chat'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;
