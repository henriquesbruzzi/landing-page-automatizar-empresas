# Chatbot Module

Módulo de chatbot moderno desenvolvido com tecnologia de ponta para auxiliar a experiência do usuário.

## Estrutura

```
chatbot/
├── components/          # Componentes React do chatbot
│   ├── ChatWidget.js   # Componente principal (widget flutuante)
│   ├── ChatWindow.js   # Janela do chat
│   ├── ChatButton.js   # Botão para abrir/fechar
│   ├── ChatHeader.js   # Cabeçalho da janela
│   ├── MessageList.js  # Lista de mensagens
│   ├── Message.js      # Componente de mensagem individual
│   └── MessageInput.js # Campo de input
├── hooks/              # React Hooks customizados
│   └── useChat.js      # Hook principal para gerenciar estado do chat
├── context/            # Context API
│   └── ChatContext.js  # Contexto do chat
├── services/           # Serviços e APIs
│   └── chatService.js  # Serviço de comunicação com API
├── styles/             # Estilos CSS
│   └── chatbot.css    # Estilos do chatbot
├── utils/             # Utilitários
└── index.js           # Exportações principais
```

## Tecnologias Utilizadas

- **React Hooks**: Gerenciamento de estado moderno
- **Context API**: Compartilhamento de estado entre componentes
- **CSS Moderno**: Animações suaves, gradientes, responsividade
- **Arquitetura Modular**: Componentes reutilizáveis e bem organizados

## Funcionalidades

- ✅ Interface moderna e responsiva
- ✅ Suporte a múltiplos idiomas (PT/EN)
- ✅ Animações suaves
- ✅ Indicador de digitação
- ✅ Histórico de conversa
- ✅ Integração com sistema de i18n
- ✅ Design adaptável (mobile-first)

## Uso

O chatbot já está integrado ao App.js e aparece em todas as páginas. Para usar em outros lugares:

```jsx
import { ChatWidget } from './chatbot';

function MyComponent() {
  return (
    <div>
      {/* Seu conteúdo */}
      <ChatWidget />
    </div>
  );
}
```

## Personalização

### Modificar o serviço de API

Edite `services/chatService.js` para integrar com sua API real (OpenAI, Anthropic, etc.):

```javascript
async sendMessage(message, lang, context) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, lang, context })
  });
  return response.json();
}
```

### Modificar estilos

Edite `styles/chatbot.css` para personalizar cores, tamanhos e animações.

## Próximos Passos

- [ ] Integração com API real (OpenAI, Anthropic, etc.)
- [ ] Suporte a streaming de mensagens
- [ ] Persistência de histórico (localStorage)
- [ ] Suporte a anexos/imagens
- [ ] Sugestões de mensagens rápidas
- [ ] Analytics e métricas
