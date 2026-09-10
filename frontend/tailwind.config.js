/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Texto corrido, formulários, menu e rodapé
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Títulos e subtítulos de secção
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        // Só o logótipo NEXUGAL
        orbitron: ['Orbitron', 'sans-serif'],
      },
      // Texto corrido um pouco maior e mais arejado
      fontSize: {
        sm: ['0.9375rem', { lineHeight: '1.65' }],
        base: ['1.0625rem', { lineHeight: '1.7' }],
      },
      // PALETA DO SITE, fonte única de verdade.
      // Quem escrever uma cor à mão num componente está a criar dívida:
      // usar sempre estes nomes. O index.css tem os mesmos valores em
      // variáveis CSS, para o pouco estilo que não passa pelo Tailwind
      // (chatbot.css e keyframes). Mudar aqui obriga a mudar lá.
      colors: {
        azul: {
          profundo: '#0F2E5C', // títulos e texto forte
          medio: '#1B5AA8',    // botões e ligações
          vivo: '#1595DC',     // acentos
          claro: '#4FA3DC',    // apoio, linhas, setas
        },
        // Cor de alerta. Entra só onde alguma coisa está mal: as duas linhas
        // que não batem certo no exemplo do stock, e o artigo a dar prejuízo
        // no da margem. Se aparecer em mais algum sítio, está a mentir.
        alerta: {
          DEFAULT: '#C2410C', // 5,16 para 1 sobre branco
          fundo: '#FFF4EE',   // preenchimento da linha assinalada
          linha: '#F0C9B3',   // contorno da linha assinalada
        },
        neve: '#F4F7FB',  // fundos suaves e faixas
        linha: '#DCE5EF', // contornos e separadores
        texto: '#42506A', // texto corrido
        suave: '#5C6B85', // texto secundário e legendas
      },
      boxShadow: {
        // Relevo discreto, sempre em azul-profundo diluído. Substitui o
        // brilho de néon que o fundo preto pedia e o branco não aceita.
        azul: '0 1px 2px rgba(15, 46, 92, 0.06), 0 8px 24px rgba(15, 46, 92, 0.08)',
        'azul-lg': '0 2px 4px rgba(15, 46, 92, 0.08), 0 16px 40px rgba(15, 46, 92, 0.12)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'blink-fade': {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        blink: 'blink 0.8s step-end infinite',
        'blink-fade': 'blink-fade 0.8s step-end infinite',
      },
    },
  },
  plugins: [],
};
