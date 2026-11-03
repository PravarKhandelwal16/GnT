/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-main) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        card: 'rgb(var(--bg-card) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--accent-primary) / <alpha-value>)',
          hover: 'rgb(var(--accent-primary-hover) / <alpha-value>)',
        },
        onPrimary: 'rgb(var(--on-primary) / <alpha-value>)',
        gold: 'rgb(var(--accent-gold) / <alpha-value>)',
        success: 'rgb(var(--accent-success) / <alpha-value>)',
        warning: 'rgb(var(--accent-warning) / <alpha-value>)',
        danger: 'rgb(var(--accent-danger) / <alpha-value>)',
        textMain: {
          DEFAULT: 'rgb(var(--text-main) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / var(--border-alpha))',
      },
      borderRadius: { '2xl': '18px', '3xl': '26px' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / 0.05), 0 8px 24px -12px rgb(var(--shadow) / 0.14)',
        'soft-hover': '0 2px 4px rgb(var(--shadow) / 0.06), 0 20px 40px -18px rgb(var(--shadow) / 0.26)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
      },
      maxWidth: { page: '76rem' },
    },
  },
  plugins: [],
};
