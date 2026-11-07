/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn standard tokens (mapped to ReLoop theme)
        background: 'var(--color-bg-primary)',
        foreground: 'var(--color-text-primary)',
        muted: {
          DEFAULT: 'var(--color-bg-secondary)',
          foreground: 'var(--color-muted)',
        },
        card: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-primary)',
        },
        popover: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-primary)',
        },
        primary: {
          DEFAULT: 'var(--color-accent)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--color-bg-secondary)',
          foreground: 'var(--color-text-secondary)',
        },
        border: 'var(--color-border)',
        input: 'var(--color-border)',
        ring: 'var(--color-accent)',

        // ReLoop Brand Palette
        cream: {
          50: '#fdfcf8',
          100: '#faf8f0',
          200: '#f5f0e0',
          300: '#ede4c8',
        },
        charcoal: {
          900: '#1a1a1a',
          800: '#2d2d2d',
          700: '#404040',
          600: '#525252',
          500: '#737373',
          400: '#a3a3a3',
        },
        sage: {
          50: '#f2f7f4',
          100: '#e0ede6',
          200: '#c1dbcc',
          300: '#94c0a8',
          400: '#5f9e7f',
          500: '#3d7f60',
          600: '#2d634a',
          700: '#24503c',
          800: '#1e4031',
          900: '#193529',
        },
        // Status colors
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.04)',
        'modal': '0 20px 60px 0 rgba(0,0,0,0.12), 0 4px 16px 0 rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
