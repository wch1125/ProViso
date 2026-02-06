/**
 * Historical Data Converter
 *
 * Converts demo scenario HistoricalPeriod[] into the interpreter's
 * MultiPeriodFinancialData format, enabling real compliance history
 * in the Monitoring Dashboard instead of simulated data.
 *
 * The demo scenarios store historical data as an array of HistoricalPeriod
 * objects (period label, end date, flat financials). The interpreter expects
 * MultiPeriodFinancialData with typed PeriodData entries.
 */

import type { HistoricalPeriod } from '../data/demo-scenarios';

/**
 * PeriodData and MultiPeriodFinancialData mirror the interpreter's types.
 * Re-declared here to avoid pulling in Node-only modules at import time.
 */
interface PeriodData {
  period: string;
  periodType: 'quarterly' | 'monthly' | 'annual';
  periodEnd: string;
  data: Record<string, number>;
}

export interface MultiPeriodFinancialData {
  periods: PeriodData[];
  trailing?: Record<string, Record<string, number>>;
}

/**
 * Infer the period type from a period label.
 * "Q1 2024" / "2024-Q1" → quarterly
 * "2024-01" / "Jan 2024" → monthly
 * "2024" → annual
 */
function inferPeriodType(period: string): 'quarterly' | 'monthly' | 'annual' {
  if (/Q\d/i.test(period)) return 'quarterly';
  if (/^\d{4}$/.test(period.trim())) return 'annual';
  return 'monthly';
}

/**
 * Convert HistoricalPeriod[] from demo scenarios into MultiPeriodFinancialData
 * that the ProViso interpreter can consume for multi-period evaluation.
 *
 * Optionally appends the current period's financials as the latest entry
 * so the compliance history includes the "now" data point.
 */
export function convertHistoricalToMultiPeriod(
  historicalData: HistoricalPeriod[],
  currentFinancials?: Record<string, number>,
  currentPeriodLabel?: string,
): MultiPeriodFinancialData {
  const periods: PeriodData[] = historicalData.map(h => ({
    period: h.period,
    periodType: inferPeriodType(h.period),
    periodEnd: h.periodEnd,
    data: { ...h.data },
  }));

  // Append current period if provided and not already present
  if (currentFinancials && currentPeriodLabel) {
    const alreadyPresent = periods.some(p => p.period === currentPeriodLabel);
    if (!alreadyPresent) {
      // Derive end date for the current period
      const now = new Date();
      const periodEnd = now.toISOString().split('T')[0]!;

      periods.push({
        period: currentPeriodLabel,
        periodType: inferPeriodType(currentPeriodLabel),
        periodEnd,
        data: { ...currentFinancials },
      });
    }
  }

  return { periods };
}

/**
 * Get a label for the current period.
 * E.g. "Q1 2026" for January–March 2026.
 */
export function getCurrentPeriodLabel(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${quarter} ${now.getFullYear()}`;
}
