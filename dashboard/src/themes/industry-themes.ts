/**
 * Industry Theme System for ProViso Dashboard
 *
 * Each industry gets a distinct identity, carried by its ACCENT and a faint
 * page tint — not by a coloured ground. Card, border and ink values track the
 * shared surface/ink scales in index.css exactly, because `.card` paints from
 * the industry tokens while `.card-premium` paints from the surface tokens:
 * if the two disagree, two cards sitting side by side render differently.
 *
 * Every theme is defined twice, light and dark. Light is the default.
 */

export type IndustryType = 'solar' | 'wind' | 'corporate';

/** Which of a theme's two colour sets to resolve. */
export type ThemeMode = 'light' | 'dark';

export interface IndustryColors {
  // Page and layout
  pageBg: string;
  headerBg: string;
  cardBg: string;
  cardBgHover: string;

  // Primary accent
  primary: string;
  primaryHover: string;
  primaryLight: string;

  // Secondary accent
  secondary: string;

  // Borders
  borderDefault: string;
  borderStrong: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Chart colors (categorical, assigned in fixed order)
  chartColors: string[];
}

export interface IndustryTheme {
  id: IndustryType;
  name: string;
  light: IndustryColors;
  dark: IndustryColors;
}

// =============================================================================
// SHARED STEPS
//
// Anything that is not industry identity is shared, so the industries differ
// only where they are meant to.
// =============================================================================

/** Categorical chart series. No gold and no amber: a cash cascade must never
 *  read as a row of warnings, and amber is reserved for caution states. */
const VIZ_LIGHT = ['#2563EB', '#0D9488', '#7C3AED', '#0891B2', '#4338CA'];
const VIZ_DARK = ['#3B82F6', '#0D9488', '#8B5CF6', '#0891B2', '#6366F1'];

/** Mirrors --surface-* / --text-* / --border-* for light mode. */
const LIGHT_CHROME = {
  headerBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBgHover: '#F5F6F8',
  borderDefault: '#E2E6EE',
  borderStrong: '#C5CCD9',
  textPrimary: '#0A1628',
  textSecondary: '#2D3F5F',
  textMuted: '#5B6E92',
  chartColors: VIZ_LIGHT,
};

/** Mirrors --surface-* / --text-* / --border-* for dark mode. */
const DARK_CHROME = {
  pageBg: '#0A1628',
  headerBg: '#152238',
  cardBg: '#152238',
  cardBgHover: '#1E2F47',
  borderDefault: '#1E2F47',
  borderStrong: '#2D4260',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  chartColors: VIZ_DARK,
};

// =============================================================================
// SOLAR THEME — emerald accent
// =============================================================================

export const solarTheme: IndustryTheme = {
  id: 'solar',
  name: 'Solar',
  light: {
    ...LIGHT_CHROME,
    pageBg: '#F4F8F5', // faint emerald cast on the page, white cards
    primary: '#047857', // 5.5:1 on white
    primaryHover: '#065F46',
    primaryLight: 'rgba(4, 120, 87, 0.10)',
    secondary: '#0F766E',
  },
  dark: {
    ...DARK_CHROME,
    primary: '#34D399',
    primaryHover: '#6EE7B7',
    primaryLight: 'rgba(52, 211, 153, 0.14)',
    secondary: '#5EEAD4',
  },
};

// =============================================================================
// WIND THEME — cyan accent
// =============================================================================

export const windTheme: IndustryTheme = {
  id: 'wind',
  name: 'Wind',
  light: {
    ...LIGHT_CHROME,
    pageBg: '#F3F8FA',
    primary: '#0E7490', // 5.4:1 on white
    primaryHover: '#155E75',
    primaryLight: 'rgba(14, 116, 144, 0.10)',
    secondary: '#0891B2',
  },
  dark: {
    ...DARK_CHROME,
    primary: '#22D3EE',
    primaryHover: '#67E8F9',
    primaryLight: 'rgba(34, 211, 238, 0.14)',
    secondary: '#38BDF8',
  },
};

// =============================================================================
// CORPORATE THEME — navy accent (the default)
// =============================================================================

export const corporateTheme: IndustryTheme = {
  id: 'corporate',
  name: 'Corporate',
  light: {
    ...LIGHT_CHROME,
    pageBg: '#F5F6F8',
    // Navy rather than the previous steel grey, which was so close to the
    // border colour that the "accent" was not visible as one.
    primary: '#1E3A5F',
    primaryHover: '#152B47',
    primaryLight: 'rgba(30, 58, 95, 0.10)',
    secondary: '#506894',
  },
  dark: {
    ...DARK_CHROME,
    primary: '#6084BC',
    primaryHover: '#82A2D2',
    primaryLight: 'rgba(96, 132, 188, 0.14)',
    secondary: '#7789AB',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const themes: Record<IndustryType, IndustryTheme> = {
  solar: solarTheme,
  wind: windTheme,
  corporate: corporateTheme,
};

/**
 * Get theme for a given industry type
 */
export function getThemeForIndustry(industry: string | undefined): IndustryTheme {
  if (industry && industry in themes) {
    return themes[industry as IndustryType];
  }
  return corporateTheme; // Default fallback
}

/**
 * Resolve a theme's colours for the active mode.
 */
export function resolveThemeColors(theme: IndustryTheme, mode: ThemeMode): IndustryColors {
  return mode === 'dark' ? theme.dark : theme.light;
}

/**
 * Convert `#RRGGBB` to the space-separated channel triplet Tailwind expects.
 *
 * The CSS custom properties hold channels rather than complete colours so that
 * opacity modifiers (`bg-industry-cardBg/50`) can compose an alpha onto them;
 * Tailwind cannot do that with a var() that already holds a full colour.
 * Values that are already translucent (rgba) are passed through untouched.
 */
function toChannels(color: string): string {
  const hex = color.trim();
  if (!hex.startsWith('#')) return hex;

  const digits =
    hex.length === 4
      ? hex
          .slice(1)
          .split('')
          .map((c) => c + c)
          .join('')
      : hex.slice(1);

  if (digits.length !== 6) return hex;

  const n = parseInt(digits, 16);
  if (Number.isNaN(n)) return hex;

  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/**
 * Apply theme CSS variables to the document root for the given mode.
 *
 * These land as inline styles on <html>, which outrank the `.dark` rules in
 * index.css — so the mode has to be resolved here rather than left to CSS.
 */
export function applyThemeToDocument(theme: IndustryTheme, mode: ThemeMode = 'light'): void {
  const root = document.documentElement;
  const colors = resolveThemeColors(theme, mode);

  // Page and layout
  root.style.setProperty('--industry-page-bg', toChannels(colors.pageBg));
  root.style.setProperty('--industry-header-bg', toChannels(colors.headerBg));
  root.style.setProperty('--industry-card-bg', toChannels(colors.cardBg));
  root.style.setProperty('--industry-card-bg-hover', toChannels(colors.cardBgHover));

  // Primary accent
  root.style.setProperty('--industry-primary', toChannels(colors.primary));
  root.style.setProperty('--industry-primary-hover', toChannels(colors.primaryHover));
  // Already translucent — stays a complete colour.
  root.style.setProperty('--industry-primary-light', colors.primaryLight);

  // Secondary
  root.style.setProperty('--industry-secondary', toChannels(colors.secondary));

  // Borders
  root.style.setProperty('--industry-border-default', toChannels(colors.borderDefault));
  root.style.setProperty('--industry-border-strong', toChannels(colors.borderStrong));

  // Text
  root.style.setProperty('--industry-text-primary', toChannels(colors.textPrimary));
  root.style.setProperty('--industry-text-secondary', toChannels(colors.textSecondary));
  root.style.setProperty('--industry-text-muted', toChannels(colors.textMuted));

  // Chart colors (expose as numbered variables for flexibility)
  colors.chartColors.forEach((color, index) => {
    root.style.setProperty(`--industry-chart-${index + 1}`, toChannels(color));
  });
}

/**
 * Get CSS variable reference for a color
 */
export function getCssVar(name: keyof IndustryColors): string {
  const varMap: Record<string, string> = {
    pageBg: 'rgb(var(--industry-page-bg))',
    headerBg: 'rgb(var(--industry-header-bg))',
    cardBg: 'rgb(var(--industry-card-bg))',
    cardBgHover: 'rgb(var(--industry-card-bg-hover))',
    primary: 'rgb(var(--industry-primary))',
    primaryHover: 'rgb(var(--industry-primary-hover))',
    primaryLight: 'var(--industry-primary-light)',
    secondary: 'rgb(var(--industry-secondary))',
    borderDefault: 'rgb(var(--industry-border-default))',
    borderStrong: 'rgb(var(--industry-border-strong))',
    textPrimary: 'rgb(var(--industry-text-primary))',
    textSecondary: 'rgb(var(--industry-text-secondary))',
    textMuted: 'rgb(var(--industry-text-muted))',
  };
  return varMap[name] || '';
}

export default themes;
