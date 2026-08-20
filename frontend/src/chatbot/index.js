/**
 * Chatbot Module - Exportações principais
 * 
 * Este módulo exporta os componentes e hooks principais do chatbot
 * para facilitar as importações em outros arquivos.
 */

export { default as ChatWidget } from './components/ChatWidget';
export { ChatProvider, useChatContext } from './context/ChatContext';
export { useChat } from './hooks/useChat';
export { default as chatService } from './services/chatService';
