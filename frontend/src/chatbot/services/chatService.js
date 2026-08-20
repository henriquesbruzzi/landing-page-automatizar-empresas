/**
 * Chat Service - Serviço de comunicação com API do chatbot
 * Usa tecnologia moderna com suporte a streaming e contexto inteligente
 */

class ChatService {
  constructor() {
    // Em produção, isso viria de variáveis de ambiente
    this.apiUrl = process.env.REACT_APP_CHAT_API_URL || '/api/chat';
    this.conversationHistory = [];
  }

  /**
   * Envia mensagem para o chatbot
   * @param {string} message - Mensagem do usuário
   * @param {string} lang - Idioma (pt/en)
   * @param {Array} context - Contexto adicional da conversa
   * @returns {Promise} Resposta do chatbot
   */
  async sendMessage(message, lang = 'pt', context = {}) {
    try {
      // Simula uma API moderna - em produção, isso seria uma chamada real
      // Pode ser integrado com OpenAI, Anthropic, ou uma API própria
      
      const response = await this.simulateAIResponse(message, lang, context);
      
      // Adiciona ao histórico
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
      
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return {
        success: false,
        message: lang === 'pt' 
          ? 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
          : 'Sorry, an error occurred. Please try again.',
        error: error.message
      };
    }
  }

  /**
   * Simula resposta de IA (substituir por API real em produção)
   * Em produção, isso seria uma chamada para OpenAI, Anthropic, etc.
   */
  async simulateAIResponse(message, lang, context) {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowerMessage = message.toLowerCase();
    
    // Respostas inteligentes baseadas em contexto
    if (lowerMessage.includes('serviço') || lowerMessage.includes('service')) {
      return lang === 'pt'
        ? 'Oferecemos uma gama completa de serviços: Desenvolvimento Web, Cibersegurança, Soluções Cloud, Consultoria em IA, Análise de Dados e Suporte & Manutenção. Qual área mais te interessa?'
        : 'We offer a complete range of services: Web Development, Cybersecurity, Cloud Solutions, AI Consulting, Data Analytics, and Support & Maintenance. Which area interests you most?';
    }

    if (lowerMessage.includes('preço') || lowerMessage.includes('custo') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return lang === 'pt'
        ? 'Cada projeto é único e o custo depende dos requisitos específicos. Oferecemos uma consulta gratuita onde apresentamos um orçamento personalizado. Gostaria de agendar?'
        : 'Each project is unique and the cost depends on specific requirements. We offer a free consultation where we present a personalized quote. Would you like to schedule one?';
    }

    if (lowerMessage.includes('contacto') || lowerMessage.includes('contato') || lowerMessage.includes('contact')) {
      return lang === 'pt'
        ? 'Pode entrar em contacto connosco através do email info@sbruzzi.it ou pelo telefone +351 912 345 678. Também pode preencher o formulário de contacto na nossa página. Como prefere?'
        : 'You can contact us via email at info@sbruzzi.it or by phone at +351 912 345 678. You can also fill out the contact form on our page. How would you prefer?';
    }

    if (lowerMessage.includes('tempo') || lowerMessage.includes('prazo') || lowerMessage.includes('time') || lowerMessage.includes('deadline')) {
      return lang === 'pt'
        ? 'O prazo varia conforme a complexidade. Um site institucional pode estar pronto em 2-4 semanas, enquanto aplicações mais complexas podem levar 2-6 meses. Na fase de diagnóstico, definimos um roadmap claro com prazos detalhados.'
        : 'The timeframe varies depending on complexity. A corporate website can be ready in 2-4 weeks, while more complex applications can take 2-6 months. During the discovery phase, we define a clear roadmap with detailed deadlines.';
    }

    if (lowerMessage.includes('sobre') || lowerMessage.includes('about')) {
      return lang === 'pt'
        ? 'Somos a Acrobatic IT, uma consultoria tecnológica focada em transformação digital. Combinamos expertise técnica com visão estratégica para entregar soluções que fazem a diferença. Temos 10+ anos de experiência e 200+ projetos entregues.'
        : 'We are Acrobatic IT, a technology consultancy focused on digital transformation. We combine technical expertise with strategic vision to deliver solutions that make a difference. We have 10+ years of experience and 200+ projects delivered.';
    }

    // Resposta padrão inteligente
    return lang === 'pt'
      ? 'Obrigado pela sua mensagem! Sou o assistente virtual da Acrobatic IT. Posso ajudar com informações sobre os nossos serviços, processos, prazos e preços. Sobre o que gostaria de saber mais?'
      : 'Thank you for your message! I\'m Acrobatic IT\'s virtual assistant. I can help with information about our services, processes, timelines and prices. What would you like to know more about?';
  }

  /**
   * Limpa o histórico da conversa
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Retorna o histórico da conversa
   */
  getHistory() {
    return this.conversationHistory;
  }
}

// Exporta instância singleton
export default new ChatService();
