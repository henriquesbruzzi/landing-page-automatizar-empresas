import { useState, useCallback, useRef, useEffect } from 'react';
import chatService from '../services/chatService';

/**
 * Hook customizado para gerenciar o estado do chat
 * Usa React Hooks modernos para gerenciamento de estado
 */
export const useChat = (lang = 'pt') => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll automático para a última mensagem
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mensagem de boas-vindas inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: lang === 'pt'
          ? 'Olá! 👋 Sou o assistente virtual da NEXUGAL. Como posso ajudar hoje?'
          : 'Hello! 👋 I\'m NEXUGAL\'s virtual assistant. How can I help you today?',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, lang, messages.length]);

  /**
   * Envia uma mensagem
   */
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(content, lang);
      
      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.message,
          timestamp: response.timestamp
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(response.message);
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMsg = lang === 'pt'
        ? 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
        : 'Sorry, an error occurred. Please try again.';
      setError(errorMsg);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [lang, isLoading]);

  /**
   * Limpa o histórico de mensagens
   */
  const clearMessages = useCallback(() => {
    chatService.clearHistory();
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Abre/fecha o chat
   */
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  /**
   * Fecha o chat
   */
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Abre o chat
   */
  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    error,
    sendMessage,
    clearMessages,
    toggleChat,
    closeChat,
    openChat,
    messagesEndRef
  };
};
