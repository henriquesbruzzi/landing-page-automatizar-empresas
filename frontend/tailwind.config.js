/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
      colors: {
        cyan: {
          neon: '#00D1FF',
        },
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(0, 209, 255, 0.6)',
        'neon-glow-lg': '0 0 30px rgba(0, 209, 255, 0.8)',
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
