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
// SOLAR THEME - Warm Sun Energy (Amber/Orange)
// =============================================================================

export const solarTheme: IndustryTheme = {
  id: 'solar',
  name: 'Solar',
  colors: {
    // Warm dark backgrounds
    pageBg: '#1a1207',
    headerBg: '#261a0d',
    cardBg: '#1f1610',
    cardBgHover: '#2a1f15',

    // Amber accents
    primary: '#f59e0b',
    primaryHover: '#d97706',
    primaryLight: 'rgba(245, 158, 11, 0.15)',

    secondary: '#fbbf24',

    // Warm brown borders
    borderDefault: '#4d3620',
    borderStrong: '#6b4a2a',

    // Warm white text
    textPrimary: '#fef3c7',
    textSecondary: '#d4b896',
    textMuted: '#a68a5b',

    // Chart palette - warm oranges/yellows
    chartColors: ['#f59e0b', '#fbbf24', '#d97706', '#f97316', '#fb923c'],
  },
};

// =============================================================================
// WIND THEME - Cool Air/Wind (Cyan/Teal)
// =============================================================================

export const windTheme: IndustryTheme = {
  id: 'wind',
  name: 'Wind',
  colors: {
    // Deep teal-blue backgrounds
    pageBg: '#0a1520',
    headerBg: '#0d1a27',
    cardBg: '#0f1c2a',
    cardBgHover: '#142533',

    // Cyan accents
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    primaryLight: 'rgba(6, 182, 212, 0.15)',

    secondary: '#22d3ee',

    // Teal borders
    borderDefault: '#155e75',
    borderStrong: '#0e7490',

    // Cool white text
    textPrimary: '#ecfeff',
    textSecondary: '#a5d8e6',
    textMuted: '#5b99ad',

    // Chart palette - cool cyans/teals
    chartColors: ['#06b6d4', '#22d3ee', '#0891b2', '#14b8a6', '#2dd4bf'],
  },
};

// =============================================================================
// CORPORATE THEME - Professional Navy/Indigo
// =============================================================================

export const corporateTheme: IndustryTheme = {
  id: 'corporate',
  name: 'Corporate',
  colors: {
    // Deep navy backgrounds
    pageBg: '#0f1219',
    headerBg: '#151b27',
    cardBg: '#1a2030',
    cardBgHover: '#212942',

    // Indigo accents
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryLight: 'rgba(99, 102, 241, 0.15)',

    secondary: '#818cf8',

    // Slate borders
    borderDefault: '#334155',
    borderStrong: '#475569',

    // Slate white text
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',

    // Chart palette - indigo/purple
    chartColors: ['#6366f1', '#818cf8', '#4f46e5', '#8b5cf6', '#a78bfa'],
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
