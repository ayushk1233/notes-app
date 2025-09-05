/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      colors: {
        light: {
          bg: '#e0f2fe',
          card: 'rgba(255, 255, 255, 0.9)',
          text: '#1e293b',
        },
        dark: {
          bg: '#141E30',
          card: '#331a2f',
          text: '#ffffff',
        },
        'dark-card': '#331a2f',
        'light-blue': '#e0f2fe',
        'light-teal': '#ccfbf1',
        'light-sky': '#dbeafe',
        'light-green': '#f0fdf4',
        'dark-pink': '#4a2844',
        'light-text': '#1e293b',
        'dark-text': '#ffffff',
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(-45deg, #e0f2fe, #ccfbf1, #dbeafe, #f0fdf4)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
