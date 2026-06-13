/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // 中式传统配色
        'china-red': '#8b1a1a',
        'china-red-light': '#c41e3a',
        'china-red-dark': '#6b1414',
        'china-gold': '#d4af37',
        'china-gold-light': '#f4e4c1',
        'china-gold-dark': '#b8941f',
        'china-beige': '#f7f3e9',
        'china-beige-light': '#fffdf9',
        'china-ink': '#2c1810',
        'china-ink-light': '#5c4033',
      },
      fontFamily: {
        'serif': ['Noto Serif SC', 'serif'],
        'calligraphy': ['Ma Shan Zheng', 'cursive'],
        'sans': ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        'china': '12px',
        'china-lg': '16px',
      },
      boxShadow: {
        'china': '0 4px 20px rgba(44, 24, 16, 0.08)',
        'china-lg': '0 8px 30px rgba(44, 24, 16, 0.12)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'slide-in-left': 'slideInLeft 0.3s ease forwards',
        'slide-out-left': 'slideOutLeft 0.3s ease forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-china-header': 'linear-gradient(180deg, #8b1a1a 0%, #6b1414 100%)',
        'gradient-china-card': 'linear-gradient(135deg, #fffdf9, #f7f3e9)',
      },
    },
  },
  plugins: [],
}
