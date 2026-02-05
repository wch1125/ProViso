/**
 * Analytics utility for tracking user engagement events.
 * Uses Plausible Analytics (privacy-friendly, no cookies).
 *
 * Events are only sent in production (when Plausible is loaded).
 */

// Plausible type declaration
declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

/**
 * Track a custom event with optional properties.
 * Safe to call even if Plausible isn't loaded (dev/test environments).
 */
export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }
}

// Predefined event helpers for type safety and consistency

/**
 * Track when a user starts a demo from the landing page.
 */
export function trackDemoStarted(industry: string): void {
  trackEvent('Demo Started', { industry });
}

/**
 * Track when a user downloads an export.
 */
export function trackExportDownloaded(
  format: 'pdf' | 'word' | 'json' | 'proviso'
): void {
  trackEvent('Export Downloaded', { format });
}

/**
 * Track when a user runs a scenario simulation.
 */
export function trackScenarioSimulated(): void {
  trackEvent('Scenario Simulated');
}

/**
 * Track when a user opens the calculation drilldown.
 */
export function trackCalculationViewed(element: string): void {
  trackEvent('Calculation Viewed', { element });
}

/**
 * Track when a user views the source code of an element.
 */
export function trackSourceCodeViewed(element: string): void {
  trackEvent('Source Code Viewed', { element });
}

/**
 * Track when a user uploads a file.
 */
export function trackFileUploaded(type: 'proviso' | 'json'): void {
  trackEvent('File Uploaded', { type });
}

/**
 * Track when a user edits financial data.
 */
export function trackFinancialsEdited(): void {
  trackEvent('Financials Edited');
}

/**
 * Track feature discovery (first time seeing a feature).
 */
export function trackFeatureDiscovered(feature: string): void {
  trackEvent('Feature Discovered', { feature });
}
