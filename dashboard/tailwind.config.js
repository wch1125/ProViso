/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // =================================================================
      // TYPOGRAPHY — v2.4 Design System
      // Crimson Pro (serif) for headings/display
      // Inter (sans) for UI/body
      // JetBrains Mono for code
      // =================================================================
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        display: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },

      // =================================================================
      // COLORS — v2.4 Design System
      // Navy/Gold core palette with semantic colors
      // =================================================================
      colors: {
        // Industry Theme Colors (CSS variable-based, set by IndustryThemeProvider)
        industry: {
          pageBg: 'var(--industry-page-bg)',
          headerBg: 'var(--industry-header-bg)',
          cardBg: 'var(--industry-card-bg)',
          cardBgHover: 'var(--industry-card-bg-hover)',
          primary: 'var(--industry-primary)',
          primaryHover: 'var(--industry-primary-hover)',
          primaryLight: 'var(--industry-primary-light)',
          secondary: 'var(--industry-secondary)',
          borderDefault: 'var(--industry-border-default)',
          borderStrong: 'var(--industry-border-strong)',
          textPrimary: 'var(--industry-text-primary)',
          textSecondary: 'var(--industry-text-secondary)',
          textMuted: 'var(--industry-text-muted)',
        },

        // Phase-aware colors (CSS variable-based)
        phase: {
          accent: 'var(--phase-accent)',
          badgeBg: 'var(--phase-badge-bg)',
          badgeText: 'var(--phase-badge-text)',
        },

        // Primary: Gold
        gold: {
          50: '#FDF8E8',
          100: '#FAF0D1',
          200: '#F5E1A3',
          300: '#EFD175',
          400: '#E8C147',
          500: '#D4AF37',  // v2.4 Gold Primary
          600: '#BF9B30',  // v2.4 Gold Muted / hover
          700: '#8B7028',  // v2.4 Gold Dark / pressed
          800: '#745407',
          900: '#523B05',
        },

        // Secondary: Navy
        navy: {
          50: '#E8EBF0',
          100: '#C5CCD9',
          200: '#9EABC2',
          300: '#7789AB',
          400: '#506894',
          500: '#2D3F5F',
          600: '#1A2744',
          700: '#152238',  // v2.4 Navy Medium (card bg)
          800: '#111827',
          900: '#0A1628',  // v2.4 Navy Deep (page bg)
          950: '#060E1A',
        },

        // Surfaces — mapped to navy scale for v2.4 cohesion
        surface: {
          0: '#0A1628',   // Page background (= navy-900)
          1: '#152238',   // Card background (= navy-700)
          2: '#1E2F47',   // Elevated card / borders (= navy-light)
          3: '#2D4260',   // Hover state
          4: '#3A5578',   // Active state
        },

        // Text
        text: {
          primary: '#F9FAFB',    // v2.4 headings, important data
          secondary: '#D1D5DB',  // v2.4 body text, descriptions
          tertiary: '#9CA3AF',   // v2.4 metadata, timestamps
          muted: '#6B7280',      // v2.4 disabled text
        },

        // Borders
        border: {
          subtle: '#152238',     // v2.4 very light separation
          DEFAULT: '#1E2F47',    // v2.4 card borders, dividers
          strong: '#2D4260',     // v2.4 focused elements, hover borders
        },

        // Semantic Colors — v2.4 aligned
        success: {
          light: 'rgba(16, 185, 129, 0.1)',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        warning: {
          light: 'rgba(245, 158, 11, 0.1)',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        danger: {
          light: 'rgba(239, 68, 68, 0.1)',
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
        info: {
          light: 'rgba(6, 182, 212, 0.1)',
          DEFAULT: '#06B6D4',
          dark: '#0891B2',
        },

        // Progress blue (active timelines, in-progress items)
        progress: {
          light: 'rgba(59, 130, 246, 0.1)',
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },

        // Status colors (used by dashboard components)
        status: {
          compliant: '#10B981',
          breach: '#EF4444',
          warning: '#F59E0B',
          suspended: '#6B7280',
        },

        // Legacy compatibility
        slate: {
          850: '#1a1f2e',
          925: '#0f1219',
          950: '#080a0e',
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

      // =================================================================
      // SPACING — 4px base unit
      // =================================================================
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
      },

      // =================================================================
      // BORDER RADIUS — v2.4 scale
      // =================================================================
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },

      // =================================================================
      // BOX SHADOWS — v2.4 scale + gold glow
      // =================================================================
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.4)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.5)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.6)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-gold-sm': '0 0 10px rgba(212, 175, 55, 0.15)',
        // Named elevation scale (alias)
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.35)',
        'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.4)',
        'elevation-4': '0 16px 32px rgba(0, 0, 0, 0.45)',
        // Gold accent shadows
        'gold-sm': '0 0 0 2px rgba(212, 175, 55, 0.2)',
        'gold': '0 0 0 4px rgba(212, 175, 55, 0.15), 0 4px 12px rgba(212, 175, 55, 0.2)',
        'gold-lg': '0 0 0 6px rgba(212, 175, 55, 0.1), 0 8px 24px rgba(212, 175, 55, 0.25)',
        'inner-gold': 'inset 0 0 0 1px rgba(212, 175, 55, 0.5)',
        // Legacy
        'glow': '0 0 20px rgba(14, 165, 233, 0.15)',
      },

      // =================================================================
      // ANIMATIONS
      // =================================================================
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
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 0.8s linear infinite',
      },
      keyframes: {
        iconPulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)',
          },
          '50%': {
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 12px rgba(212, 175, 55, 0)',
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

      // Grid templates
      gridTemplateColumns: {
        'dashboard': 'repeat(auto-fit, minmax(320px, 1fr))',
      },
    },
  },
  plugins: [],
}
