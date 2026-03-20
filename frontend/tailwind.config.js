/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#4facfe',
        'neon-purple': '#764ba2',
        'neon-pink': '#f093fb',
        'neon-green': '#43e97b',
        'neon-yellow': '#ffd700',
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'pulse-glow': 'pulseGlow 8s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-left': 'fadeInLeft 1s ease',
        'fade-in-right': 'fadeInRight 1s ease',
        'border-glow': 'borderGlow 3s linear infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        borderGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        'glass-bg': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(102, 126, 234, 0.4)',
        'neon-blue': '0 4px 15px rgba(79, 172, 254, 0.4)',
        'neon-green': '0 5px 20px rgba(67, 233, 123, 0.4)',
        'neon-yellow': '0 5px 20px rgba(255, 215, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
