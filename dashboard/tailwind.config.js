/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Typography
      fontFamily: {
        display: ['EB Garamond', 'Georgia', 'Times New Roman', 'serif'],
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      // Colors - Premium Legal Tech Palette
      colors: {
        // Primary: Gold (Lion's Mane)
        gold: {
          50: '#FDF8E8',
          100: '#FAF0D1',
          200: '#F5E1A3',
          300: '#EFD175',
          400: '#E8C147',
          500: '#D4A84B',
          600: '#B8860B', // Primary gold
          700: '#966D09',
          800: '#745407',
          900: '#523B05',
        },

        // Secondary: Navy (Authority)
        navy: {
          50: '#E8EBF0',
          100: '#C5CCD9',
          200: '#9EABC2',
          300: '#7789AB',
          400: '#506894',
          500: '#2D3F5F',
          600: '#1A2744', // Primary navy
          700: '#141D33',
          800: '#111827',
          900: '#0A0F17',
        },

        // Surfaces (Dark Theme)
        surface: {
          0: '#0F0F0F',   // Page background
          1: '#151515',   // Card background
          2: '#1C1C1A',   // Elevated card
          3: '#242422',   // Hover state
          4: '#2C2C2A',   // Active state
        },

        // Text
        text: {
          primary: '#E8E8E4',
          secondary: '#B8B8B2',
          tertiary: '#8A8A82',
          muted: '#5A5A55',
        },

        // Borders
        border: {
          subtle: '#2A2A28',
          DEFAULT: '#3A3A35',
          strong: '#4A4A45',
        },

        // Semantic Colors
        success: {
          light: 'rgba(22, 163, 74, 0.1)',
          DEFAULT: '#16A34A',
          dark: '#15803D',
        },
        warning: {
          light: 'rgba(202, 138, 4, 0.1)',
          DEFAULT: '#CA8A04',
          dark: '#A16207',
        },
        danger: {
          light: 'rgba(220, 38, 38, 0.1)',
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
        },
        info: {
          light: 'rgba(37, 99, 235, 0.1)',
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },

        // Legacy compatibility (keeping existing colors that dashboard uses)
        slate: {
          850: '#1a1f2e',
          925: '#0f1219',
          950: '#080a0e',
        },
        status: {
          compliant: '#10b981',
          breach: '#ef4444',
          warning: '#f59e0b',
          suspended: '#6b7280',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        hub: {
          bg: '#0A1628',
          card: '#152238',
          secondary: '#1C2433',
          tertiary: '#2A3544',
          border: '#2D3748',
        },
      },

      // Spacing (4px base)
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
      },

      // Border radius
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },

      // Box shadows
      boxShadow: {
        'gold-sm': '0 0 0 2px rgba(184, 134, 11, 0.2)',
        'gold': '0 0 0 4px rgba(184, 134, 11, 0.15), 0 4px 12px rgba(184, 134, 11, 0.2)',
        'gold-lg': '0 0 0 6px rgba(184, 134, 11, 0.1), 0 8px 24px rgba(184, 134, 11, 0.25)',
        'inner-gold': 'inset 0 0 0 1px rgba(184, 134, 11, 0.5)',
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.35)',
        'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.4)',
        'elevation-4': '0 16px 32px rgba(0, 0, 0, 0.45)',
        // Legacy
        'glow': '0 0 20px rgba(14, 165, 233, 0.15)',
        'glow-sm': '0 0 10px rgba(14, 165, 233, 0.1)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.15)',
        'glow-gold-sm': '0 0 10px rgba(212, 175, 55, 0.1)',
      },

      // Animations
      animation: {
        'icon-pulse': 'iconPulse 2s ease-in-out infinite',
        'brand-reveal': 'brandReveal 0.8s ease-out forwards',
        'loading-progress': 'loadingProgress 1.5s ease-out forwards',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'count-up': 'countUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        iconPulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(184, 134, 11, 0.4)',
          },
          '50%': {
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 12px rgba(184, 134, 11, 0)',
          },
        },
        brandReveal: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        loadingProgress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },

      // Transitions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'snap': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },

      // Typography scale
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '1rem' }],       // 10px
        'display-sm': ['2.25rem', { lineHeight: '1.2' }],  // 36px
        'display-md': ['3rem', { lineHeight: '1.1' }],     // 48px
        'display-lg': ['3.75rem', { lineHeight: '1.1' }],  // 60px
      },

      // Max widths
      maxWidth: {
        'prose': '65ch',
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
}
