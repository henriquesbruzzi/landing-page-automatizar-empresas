import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * Campo de input para enviar mensagens
 */
const MessageInput = () => {
  const { lang } = useLanguage();
  const { sendMessage, isLoading } = useChatContext();
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chatbot-input" onSubmit={handleSubmit}>
      <div className="chatbot-input__wrapper">
        <textarea
          ref={inputRef}
          className="chatbot-input__field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            lang === 'pt'
              ? 'Digite sua mensagem...'
              : 'Type your message...'
          }
          rows="1"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chatbot-input__send"
          disabled={!input.trim() || isLoading}
          aria-label={lang === 'pt' ? 'Enviar mensagem' : 'Send message'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
