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
          DEFAULT: 'rgb(var(--bg-main) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--bg-surface) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--bg-card) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--accent-primary) / <alpha-value>)',
          hover: '#6C8BFF',
        },
        success: {
          DEFAULT: 'rgb(var(--accent-success) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--accent-warning) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--accent-danger) / <alpha-value>)',
        },
        textMain: {
          DEFAULT: 'rgb(var(--text-main) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
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
