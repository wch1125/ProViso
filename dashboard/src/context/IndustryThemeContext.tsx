/**
 * IndustryThemeContext - Provides industry-specific theming based on current deal
 *
 * Listens to URL changes to detect which deal is active, gets the industry
 * from the demo scenario, and applies the appropriate theme CSS variables.
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  type IndustryTheme,
  type IndustryType,
  getThemeForIndustry,
  applyThemeToDocument,
  corporateTheme,
} from '../themes/industry-themes';
import { getScenarioById } from '../data/demo-scenarios';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface IndustryThemeContextValue {
  /** Current active theme */
  theme: IndustryTheme;
  /** Current industry type */
  industry: IndustryType;
  /** Current deal ID (if any) */
  dealId: string | null;
  /** Direct access to theme colors */
  colors: IndustryTheme['colors'];
  /** Chart colors array for convenience */
  chartColors: string[];
}

// =============================================================================
// CONTEXT
// =============================================================================

const IndustryThemeContext = createContext<IndustryThemeContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface IndustryThemeProviderProps {
  children: React.ReactNode;
}

export function IndustryThemeProvider({ children }: IndustryThemeProviderProps) {
  const location = useLocation();

  // Extract dealId from URL path
  // Expected format: /deals/:dealId/...
  const dealId = useMemo(() => {
    const match = location.pathname.match(/\/deals\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  // Get industry from demo scenario
  const industry = useMemo<IndustryType>(() => {
    if (!dealId) return 'corporate';

    const scenario = getScenarioById(dealId);
    if (scenario?.metadata?.industry) {
      return scenario.metadata.industry;
    }

    return 'corporate';
  }, [dealId]);

  // Get theme for the industry
  const theme = useMemo(() => {
    return getThemeForIndustry(industry);
  }, [industry]);

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // Memoize context value
  const value = useMemo<IndustryThemeContextValue>(() => ({
    theme,
    industry,
    dealId,
    colors: theme.colors,
    chartColors: theme.colors.chartColors,
  }), [theme, industry, dealId]);

  return (
    <IndustryThemeContext.Provider value={value}>
      {children}
    </IndustryThemeContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access the current industry theme
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { colors, chartColors, industry } = useIndustryTheme();
 *   return <div style={{ color: colors.primary }}>{industry}</div>;
 * }
 * ```
 */
export function useIndustryTheme(): IndustryThemeContextValue {
  const context = useContext(IndustryThemeContext);

  // Return default values if used outside provider (e.g., on landing page)
  if (!context) {
    return {
      theme: corporateTheme,
      industry: 'corporate',
      dealId: null,
      colors: corporateTheme.colors,
      chartColors: corporateTheme.colors.chartColors,
    };
  }

  return context;
}

export default IndustryThemeProvider;
