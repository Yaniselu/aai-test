/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: { 950: '#050505', 900: '#0B0B10', 800: '#12121A', 700: '#1B1B24' },
        blood: { DEFAULT: '#E10600', bright: '#FF2A24', deep: '#8F0000' },
        cyan: { DEFAULT: '#00E5FF', soft: 'rgba(0,229,255,.14)' },
        steel: { 100: '#F2F2F2', 300: '#C7C7C7', 500: '#8A8A8A', 700: '#4A4A4A' }
      },
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        heading: ['Orbitron', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '24px',
        soft: '16px'
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pulseRing: { '0%': { transform: 'scale(.9)', opacity: '.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } }
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
        'marquee-slow': 'marquee 45s linear infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite'
      }
    }
  },
  plugins: []
};
