/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0D14',
          light: '#F8FAFC',
          dark: '#0B0D14',
        },
        surface: {
          DEFAULT: '#131722',
          light: '#FFFFFF',
          dark: '#131722',
        },
        card: {
          DEFAULT: '#171C29',
          light: '#FFFFFF',
          dark: '#171C29',
        },
        primary: {
          DEFAULT: '#5B7CFA',
          hover: '#6C8BFF',
          light: '#5B7CFA',
          dark: '#5B7CFA',
        },
        success: {
          DEFAULT: '#22C55E',
        },
        warning: {
          DEFAULT: '#F59E0B',
        },
        textMain: {
          DEFAULT: '#FFFFFF',
          secondary: '#94A3B8',
          light: '#0F172A',
          dark: '#FFFFFF',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          light: '#E2E8F0',
          dark: 'rgba(255, 255, 255, 0.08)',
        }
      },
      borderRadius: {
        '2xl': '20px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
        'soft-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
