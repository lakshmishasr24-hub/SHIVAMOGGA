/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#071611',
          900: '#0F2C23',
          800: '#143D30',
          700: '#1E4D3E',
          600: '#2A6653',
          500: '#38836C',
          400: '#52A389',
          300: '#7AC4AB',
          200: '#A9E0CD',
          100: '#D5F2E7',
          50: '#F0F9F5',
        },
        charcoal: {
          950: '#0B0F0E',
          900: '#121816',
          800: '#1A2321',
          700: '#263330',
          600: '#384844',
          500: '#50635F',
        },
        earth: {
          900: '#4A3E2D',
          800: '#64543E',
          700: '#8B7E66',
          600: '#A69880',
          500: '#D4A373',
          400: '#E6C594',
        },
        gold: {
          500: '#D4AF37',
          400: '#E6B800',
          300: '#F2C94C',
          200: '#F7DC6F',
        },
        cream: {
          50: '#FCFDFB',
          100: '#F4F6F4',
          200: '#E8ECE9',
          300: '#D6DDD8',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
