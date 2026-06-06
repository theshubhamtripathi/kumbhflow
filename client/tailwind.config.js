module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff8f0',
          100: '#ffedcc',
          200: '#ffd999',
          300: '#ffc166',
          400: '#ffa833',
          500: '#ff8f00',
          600: '#e67800',
          700: '#b35e00',
          800: '#804400',
          900: '#4d2900',
        },
        kumbh: {
          dark: '#0a0e1a',
          darker: '#060810',
          surface: '#0f1628',
          border: '#1e2d4a',
          accent: '#ff6b00',
          gold: '#f0a500',
          glow: '#ff8c00',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(255, 107, 0, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.8)' },
        },
        slideIn: {
          from: { transform: 'translateX(-10px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};