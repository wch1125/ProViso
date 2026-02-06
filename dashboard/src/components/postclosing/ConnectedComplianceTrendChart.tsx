/**
 * Connected Compliance Trend Chart
 *
 * Wraps ComplianceTrendChart with ProViso context integration.
 * Generates simulated historical data based on current covenant values.
 *
 * When multi-period financial data is available, this can be enhanced
 * to show actual historical compliance trends.
 */
import { useMemo } from 'react';
import { useProViso } from '../../context';
import { ComplianceTrendChart } from './ComplianceTrendChart';
import type { CovenantData } from '../../types';

interface ConnectedComplianceTrendChartProps {
  /** Covenant name to display */
  covenantName: string;
  /** Number of historical periods to simulate */
  periods?: number;
  /** Labels for periods (default: Q1-Q4 style) */
  periodLabels?: string[];
  className?: string;
}

/**
 * Generate simulated historical data for a covenant.
 * Creates a realistic trend leading to the current value.
 */
function generateHistoricalData(
  covenant: CovenantData,
  numPeriods: number,
  labels: string[]
): Array<{ period: string; actual: number; threshold: number; compliant: boolean }> {
  const { actual, required, operator } = covenant;
  const threshold = required;

  // Generate values that trend toward the current value
  // with some realistic variance
  const data: Array<{ period: string; actual: number; threshold: number; compliant: boolean }> = [];

  // Start further from threshold and trend toward current
  const variance = Math.abs(threshold - actual) * 0.3; // 30% variance
  const startOffset = (Math.random() - 0.5) * variance * 2;

  for (let i = 0; i < numPeriods; i++) {
    // Progress from 0 to 1
    const progress = i / (numPeriods - 1);

    // Interpolate from start value to current value
    const startValue = actual + startOffset;
    const periodActual = startValue + (actual - startValue) * progress;

    // Add some noise
    const noise = (Math.random() - 0.5) * variance * 0.5;
    const noisyActual = periodActual + noise * (1 - progress * 0.7); // Less noise near current

    // Round to 2 decimal places
    const roundedActual = Math.round(noisyActual * 100) / 100;

    // Determine compliance based on operator
    let compliant: boolean;
    switch (operator) {
      case '<=':
        compliant = roundedActual <= threshold;
        break;
      case '>=':
        compliant = roundedActual >= threshold;
        break;
      case '<':
        compliant = roundedActual < threshold;
        break;
      case '>':
        compliant = roundedActual > threshold;
        break;
      case '=':
        compliant = Math.abs(roundedActual - threshold) < 0.01;
        break;
      default:
        compliant = roundedActual <= threshold;
    }

    data.push({
      period: labels[i] || `P${i + 1}`,
      actual: roundedActual,
      threshold,
      compliant,
    });
  }

  // Ensure the last period matches current values exactly
  if (data.length > 0) {
    data[data.length - 1] = {
      period: labels[numPeriods - 1] || `P${numPeriods}`,
      actual,
      threshold,
      compliant: covenant.compliant,
    };
  }

  return data;
}

/**
 * Default period labels (last 6 quarters)
 */
function getDefaultPeriodLabels(count: number): string[] {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

  const labels: string[] = [];
  let year = currentYear;
  let quarter = currentQuarter;

  // Go backwards to get historical periods
  for (let i = count - 1; i >= 0; i--) {
    labels[i] = `Q${quarter} ${year}`;
    quarter--;
    if (quarter < 1) {
      quarter = 4;
      year--;
    }
  }

  return labels;
}

/**
 * Connected ComplianceTrendChart that uses ProViso context.
 * When multi-period financial data is loaded, displays real compliance
 * history from the interpreter. Otherwise falls back to simulated data.
 */
export function ConnectedComplianceTrendChart({
  covenantName,
  periods = 6,
  periodLabels,
  className = '',
}: ConnectedComplianceTrendChartProps) {
  const { covenants, isLoaded, isMultiPeriod, complianceHistory } = useProViso();

  // Find the covenant by name
  const covenant = useMemo(() => {
    return covenants.find((c) => c.name === covenantName);
  }, [covenants, covenantName]);

  // Generate period labels (for simulated fallback)
  const labels = useMemo(() => {
    return periodLabels || getDefaultPeriodLabels(periods);
  }, [periodLabels, periods]);

  // Use real compliance history when available, otherwise simulate
  const trendData = useMemo(() => {
    if (!covenant) return [];

    // Prefer real multi-period data from the interpreter
    if (isMultiPeriod && complianceHistory[covenantName]?.length > 1) {
      return complianceHistory[covenantName];
    }

    // Fall back to simulated data for single-period mode
    return generateHistoricalData(covenant, periods, labels);
  }, [covenant, periods, labels, isMultiPeriod, complianceHistory, covenantName]);

  // Loading/not found states
  if (!isLoaded) {
    return (
      <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
        <div className="text-center text-slate-400 py-8">
          Loading covenant data...
        </div>
      </div>
    );
  }

  if (!covenant) {
    return (
      <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
        <div className="text-center text-slate-400 py-8">
          Covenant "{covenantName}" not found
        </div>
      </div>
    );
  }

  const isRealData = isMultiPeriod && (complianceHistory[covenantName]?.length ?? 0) > 1;

  return (
    <div className={className}>
      <ComplianceTrendChart
        covenantName={covenantName}
        data={trendData}
        operator={covenant.operator}
      />
      <div className="text-xs text-text-muted mt-1 px-2">
        {isRealData
          ? `${trendData.length} periods of actual compliance data`
          : 'Simulated trend \u2014 upload multi-period financials for real history'}
      </div>
    </div>
  );
}

/**
 * Multi-covenant trend display
 * Shows trend charts for multiple covenants
 */
export function ComplianceTrendPanel({
  covenantNames,
  periods = 6,
  className = '',
}: {
  covenantNames?: string[];
  periods?: number;
  className?: string;
}) {
  const { covenants, isLoaded } = useProViso();

  // Get covenant names (use provided or all active)
  const names = useMemo(() => {
    if (covenantNames && covenantNames.length > 0) {
      return covenantNames;
    }
    // Default to first 2 non-suspended covenants
    return covenants
      .filter((c) => !c.suspended)
      .slice(0, 2)
      .map((c) => c.name);
  }, [covenantNames, covenants]);

  if (!isLoaded) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 h-80 animate-pulse" />
      </div>
    );
  }

  if (names.length === 0) {
    return (
      <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
        <div className="text-center text-slate-400 py-8">
          No covenants available for trend display
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {names.map((name) => (
        <ConnectedComplianceTrendChart
          key={name}
          covenantName={name}
          periods={periods}
        />
      ))}
    </div>
  );
}

export default ConnectedComplianceTrendChart;
