/**
 * Industry Theme System for ProViso Dashboard
 *
 * Provides bold, visually distinct themes for Solar, Wind, and Corporate demos.
 * Each theme has its own color palette that changes the entire look and feel.
 */

export type IndustryType = 'solar' | 'wind' | 'corporate';

export interface IndustryTheme {
  id: IndustryType;
  name: string;
  colors: {
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

    // Chart colors (array for sequential data)
    chartColors: string[];

    // Semantic (optional overrides, otherwise use global)
    success?: string;
    warning?: string;
    danger?: string;
  };
}

// =============================================================================
// SOLAR THEME - Green Energy (Emerald/Green)
// =============================================================================

export const solarTheme: IndustryTheme = {
  id: 'solar',
  name: 'Solar',
  colors: {
    // Light surfaces with a faint emerald cast — the industry reads through
    // the accent and a tint, not through a dark ground.
    pageBg: '#F4F8F5',
    headerBg: '#FFFFFF',
    cardBg: '#FFFFFF',
    cardBgHover: '#F7FBF8',

    // Emerald accents, darkened for contrast on light
    primary: '#047857',
    primaryHover: '#065F46',
    primaryLight: 'rgba(4, 120, 87, 0.10)',

    secondary: '#0F766E',

    // Green-tinted borders
    borderDefault: '#DCEAE1',
    borderStrong: '#B9D6C4',

    // Navy ink keeps the brand in the text across every industry
    textPrimary: '#0A1628',
    textSecondary: '#2D3F5F',
    textMuted: '#506894',

    chartColors: ['#2563EB', '#0D9488', '#7C3AED', '#0891B2', '#4338CA'],
  },
};

// =============================================================================
// WIND THEME - Cool Air/Wind (Cyan/Teal)
// =============================================================================

export const windTheme: IndustryTheme = {
  id: 'wind',
  name: 'Wind',
  colors: {
    // Light surfaces with a faint cyan cast
    pageBg: '#F3F8FA',
    headerBg: '#FFFFFF',
    cardBg: '#FFFFFF',
    cardBgHover: '#F6FBFC',

    // Cyan accents, darkened for contrast on light
    primary: '#0E7490',
    primaryHover: '#155E75',
    primaryLight: 'rgba(14, 116, 144, 0.10)',

    secondary: '#0891B2',

    borderDefault: '#DBE9EE',
    borderStrong: '#B6D2DB',

    textPrimary: '#0A1628',
    textSecondary: '#2D3F5F',
    textMuted: '#506894',

    chartColors: ['#2563EB', '#0D9488', '#7C3AED', '#0891B2', '#4338CA'],
  },
};

// =============================================================================
// CORPORATE THEME - Professional Steel Gray
// =============================================================================

export const corporateTheme: IndustryTheme = {
  id: 'corporate',
  name: 'Corporate',
  colors: {
    // Neutral light surfaces — the default brand ground
    pageBg: '#F5F6F8',
    headerBg: '#FFFFFF',
    cardBg: '#FFFFFF',
    cardBgHover: '#FAFBFC',

    // Navy accents rather than steel grey, so the accent is actually visible
    primary: '#1E3A5F',
    primaryHover: '#152B47',
    primaryLight: 'rgba(30, 58, 95, 0.10)',

    secondary: '#506894',

    borderDefault: '#E2E6EE',
    borderStrong: '#C5CCD9',

    textPrimary: '#0A1628',
    textSecondary: '#2D3F5F',
    textMuted: '#506894',

    chartColors: ['#2563EB', '#0D9488', '#7C3AED', '#0891B2', '#4338CA'],
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
 * Apply theme CSS variables to the document root
 */
export function applyThemeToDocument(theme: IndustryTheme): void {
  const root = document.documentElement;
  const { colors } = theme;

  // Page and layout
  root.style.setProperty('--industry-page-bg', colors.pageBg);
  root.style.setProperty('--industry-header-bg', colors.headerBg);
  root.style.setProperty('--industry-card-bg', colors.cardBg);
  root.style.setProperty('--industry-card-bg-hover', colors.cardBgHover);

  // Primary accent
  root.style.setProperty('--industry-primary', colors.primary);
  root.style.setProperty('--industry-primary-hover', colors.primaryHover);
  root.style.setProperty('--industry-primary-light', colors.primaryLight);

  // Secondary
  root.style.setProperty('--industry-secondary', colors.secondary);

  // Borders
  root.style.setProperty('--industry-border-default', colors.borderDefault);
  root.style.setProperty('--industry-border-strong', colors.borderStrong);

  // Text
  root.style.setProperty('--industry-text-primary', colors.textPrimary);
  root.style.setProperty('--industry-text-secondary', colors.textSecondary);
  root.style.setProperty('--industry-text-muted', colors.textMuted);

  // Chart colors (expose as numbered variables for flexibility)
  colors.chartColors.forEach((color, index) => {
    root.style.setProperty(`--industry-chart-${index + 1}`, color);
  });
}

/**
 * Get CSS variable reference for a color
 */
export function getCssVar(name: keyof IndustryTheme['colors']): string {
  const varMap: Record<string, string> = {
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
  };
  return varMap[name] || '';
}

export default themes;
