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
        // =================================================================
        // SEMANTIC TOKENS
        // Meaning is separable from brand: amber is caution only, gold is
        // brand only, charts draw from the categorical set. Every token
        // resolves in both light and dark — see index.css.
        // =================================================================
        status: {
          safe: 'rgb(var(--status-safe) / <alpha-value>)',
          safeTint: 'var(--status-safe-tint)',
          caution: 'rgb(var(--status-caution) / <alpha-value>)',
          cautionTint: 'var(--status-caution-tint)',
          // Compliant but with no cushion left — not a breach.
          attention: 'rgb(var(--status-attention) / <alpha-value>)',
          attentionTint: 'var(--status-attention-tint)',
          breach: 'rgb(var(--status-breach) / <alpha-value>)',
          breachTint: 'var(--status-breach-tint)',
        },

        brand: {
          gold: 'rgb(var(--brand-gold) / <alpha-value>)',
          goldHover: 'rgb(var(--brand-gold-hover) / <alpha-value>)',
          goldTint: 'var(--brand-gold-tint)',
        },

        // Categorical chart series — fixed order, never cycled.
        viz: {
          cat1: 'rgb(var(--viz-cat-1) / <alpha-value>)',
          cat2: 'rgb(var(--viz-cat-2) / <alpha-value>)',
          cat3: 'rgb(var(--viz-cat-3) / <alpha-value>)',
          cat4: 'rgb(var(--viz-cat-4) / <alpha-value>)',
          cat5: 'rgb(var(--viz-cat-5) / <alpha-value>)',
        },

        // Industry Theme Colors (CSS variable-based, set by IndustryThemeProvider)
        industry: {
          pageBg: 'rgb(var(--industry-page-bg) / <alpha-value>)',
          headerBg: 'rgb(var(--industry-header-bg) / <alpha-value>)',
          cardBg: 'rgb(var(--industry-card-bg) / <alpha-value>)',
          cardBgHover: 'rgb(var(--industry-card-bg-hover) / <alpha-value>)',
          primary: 'rgb(var(--industry-primary) / <alpha-value>)',
          primaryHover: 'rgb(var(--industry-primary-hover) / <alpha-value>)',
          primaryLight: 'var(--industry-primary-light)',
          secondary: 'rgb(var(--industry-secondary) / <alpha-value>)',
          borderDefault: 'rgb(var(--industry-border-default) / <alpha-value>)',
          borderStrong: 'rgb(var(--industry-border-strong) / <alpha-value>)',
          textPrimary: 'rgb(var(--industry-text-primary) / <alpha-value>)',
          textSecondary: 'rgb(var(--industry-text-secondary) / <alpha-value>)',
          textMuted: 'rgb(var(--industry-text-muted) / <alpha-value>)',
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

        // Surfaces — token-backed so one class on <html> re-themes the app.
        // Light: page #F5F6F8, cards white. Dark: the navy scale. See index.css.
        surface: {
          0: 'rgb(var(--surface-0) / <alpha-value>)',   // Page background
          1: 'rgb(var(--surface-1) / <alpha-value>)',   // Card background
          2: 'rgb(var(--surface-2) / <alpha-value>)',   // Elevated / subtle fill
          3: 'rgb(var(--surface-3) / <alpha-value>)',   // Hover state
          4: 'rgb(var(--surface-4) / <alpha-value>)',   // Active state
        },

        // Text — a navy scale in light, the grey scale in dark
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',      // headings, important data
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',  // body text, descriptions
          tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',    // metadata, timestamps
          muted: 'rgb(var(--text-muted) / <alpha-value>)',          // sub-labels, breadcrumbs
        },

        // Borders.
        //
        // `default` is spelled out as its own key as well as DEFAULT. A nested
        // DEFAULT collapses to the bare `border-border`, so `border-border-DEFAULT`
        // never existed — yet 146 call sites used it, silently falling through to
        // Tailwind's preflight border colour. Both spellings now resolve.
        border: {
          subtle: 'rgb(var(--border-subtle) / <alpha-value>)',    // very light separation
          DEFAULT: 'rgb(var(--border-default) / <alpha-value>)',  // -> border-border
          default: 'rgb(var(--border-default) / <alpha-value>)',  // card borders, dividers
          strong: 'rgb(var(--border-strong) / <alpha-value>)',    // focused elements, hover borders
        },

        // Semantic Colors — aliases onto the status tokens above, so the ~470
        // existing text-success / bg-danger / … usages follow the active mode
        // instead of staying pinned to the dark-tuned steps.
        success: {
          light: 'var(--status-safe-tint)',
          DEFAULT: 'rgb(var(--status-safe) / <alpha-value>)',
          dark: 'rgb(var(--status-safe) / <alpha-value>)',
        },
        warning: {
          light: 'var(--status-caution-tint)',
          DEFAULT: 'rgb(var(--status-caution) / <alpha-value>)',
          dark: 'rgb(var(--status-caution) / <alpha-value>)',
        },
        danger: {
          light: 'var(--status-breach-tint)',
          DEFAULT: 'rgb(var(--status-breach) / <alpha-value>)',
          dark: 'rgb(var(--status-breach) / <alpha-value>)',
        },
        info: {
          light: 'var(--status-info-tint)',
          DEFAULT: 'rgb(var(--status-info) / <alpha-value>)',
          dark: 'rgb(var(--status-info) / <alpha-value>)',
        },

        // Progress blue (active timelines, in-progress items)
        progress: {
          light: 'rgba(59, 130, 246, 0.1)',
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },

        // Code surfaces stay dark in BOTH modes — a syntax-highlighted block
        // on a dark ground is the convention readers expect, and it saves
        // retuning every token colour for a light background.
        code: {
          bg: '#0D1A2D',
          surface: '#152238',
          border: 'rgba(255, 255, 255, 0.10)',
          ink: 'rgba(255, 255, 255, 0.80)',
          inkMuted: 'rgba(255, 255, 255, 0.50)',
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
        // Token-backed: black at 30–60% is right on navy and turns to grey
        // mud on white, so light mode uses tinted navy at low alpha instead.
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-gold-sm': '0 0 10px rgba(212, 175, 55, 0.15)',
        // Named elevation scale (alias)
        'elevation-1': 'var(--shadow-sm)',
        'elevation-2': 'var(--shadow-md)',
        'elevation-3': 'var(--shadow-lg)',
        'elevation-4': 'var(--shadow-xl)',
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
