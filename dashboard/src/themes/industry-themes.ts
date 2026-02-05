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
    // Dark green backgrounds
    pageBg: '#0a1610',
    headerBg: '#0d1f14',
    cardBg: '#101f16',
    cardBgHover: '#152a1d',

    // Emerald accents
    primary: '#10b981',
    primaryHover: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.15)',

    secondary: '#34d399',

    // Green borders
    borderDefault: '#1e4d3a',
    borderStrong: '#2a6b4f',

    // Green-tinted white text
    textPrimary: '#ecfdf5',
    textSecondary: '#a7d4c2',
    textMuted: '#6b9e8a',

    // Chart palette - greens
    chartColors: ['#10b981', '#34d399', '#059669', '#22c55e', '#4ade80'],
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
// CORPORATE THEME - Professional Steel Gray
// =============================================================================

export const corporateTheme: IndustryTheme = {
  id: 'corporate',
  name: 'Corporate',
  colors: {
    // Steel gray backgrounds
    pageBg: '#111214',
    headerBg: '#18191c',
    cardBg: '#1e2024',
    cardBgHover: '#26282d',

    // Steel blue accents
    primary: '#64748b',
    primaryHover: '#475569',
    primaryLight: 'rgba(100, 116, 139, 0.15)',

    secondary: '#94a3b8',

    // Gray borders
    borderDefault: '#2e3138',
    borderStrong: '#3f434b',

    // Cool gray text
    textPrimary: '#f1f3f5',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',

    // Chart palette - steel grays with blue hints
    chartColors: ['#64748b', '#94a3b8', '#475569', '#78909c', '#90a4ae'],
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
