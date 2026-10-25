/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: { 950: '#050505', 900: '#0B0B10', 800: '#12121A', 700: '#1B1B24' },
        blood: { DEFAULT: '#FF0019', bright: '#FF2D3F', deep: '#8A0010' },
        cyan: { DEFAULT: '#FFFFFF', soft: 'rgba(255,255,255,.14)' },
        steel: { 100: '#F2F2F2', 300: '#C7C7C7', 500: '#8A8A8A', 700: '#4A4A4A' }
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'system-ui', 'sans-serif'],
        heading: ['Oswald', 'system-ui', 'sans-serif'],
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
