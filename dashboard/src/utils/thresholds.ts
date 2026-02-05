/**
 * Early Warning System - Threshold Zone Detection
 *
 * Calculates threshold zones for covenant compliance to provide
 * visual indicators when approaching breach.
 */

// =============================================================================
// THRESHOLD ZONES
// =============================================================================

export type ThresholdZone = 'safe' | 'caution' | 'danger' | 'breach';

export interface ZoneThresholds {
  cautionAt: number;  // % of threshold (e.g., 0.80 = 80%)
  dangerAt: number;   // % of threshold (e.g., 0.90 = 90%)
}

const DEFAULT_THRESHOLDS: ZoneThresholds = {
  cautionAt: 0.80,
  dangerAt: 0.90,
};

/**
 * Calculates the threshold zone for a covenant value
 *
 * @param actual - Current covenant value
 * @param threshold - Covenant threshold/limit
 * @param operator - Comparison operator (<= for max covenants, >= for min covenants)
 * @param config - Optional zone thresholds
 */
export function getThresholdZone(
  actual: number,
  threshold: number,
  operator: '<=' | '>=' | '<' | '>' | '=' | '!=',
  config: ZoneThresholds = DEFAULT_THRESHOLDS
): ThresholdZone {
  // For max covenants (leverage <= 4.5x): higher actual = worse
  // For min covenants (coverage >= 1.25x): lower actual = worse

  const isMaxCovenant = operator === '<=' || operator === '<';

  let utilization: number;

  if (isMaxCovenant) {
    // actual / threshold - e.g., 4.0 / 4.5 = 0.89 (89% utilized)
    utilization = actual / threshold;
  } else {
    // threshold / actual - e.g., 1.25 / 1.40 = 0.89 (89% utilized toward breach)
    utilization = threshold / actual;
  }

  if (utilization > 1) return 'breach';
  if (utilization >= config.dangerAt) return 'danger';
  if (utilization >= config.cautionAt) return 'caution';
  return 'safe';
}

/**
 * Calculates the utilization percentage toward threshold
 * Returns 0-100+ (can exceed 100 if in breach)
 */
export function getUtilizationPercent(
  actual: number,
  threshold: number,
  operator: '<=' | '>=' | '<' | '>' | '=' | '!='
): number {
  const isMaxCovenant = operator === '<=' || operator === '<';

  if (isMaxCovenant) {
    return (actual / threshold) * 100;
  } else {
    return (threshold / actual) * 100;
  }
}

// =============================================================================
// ZONE STYLING
// =============================================================================

export interface ZoneStyle {
  bgColor: string;
  textColor: string;
  borderColor: string;
  progressColor: string;
  pulseAnimation: boolean;
  icon: 'check' | 'warning' | 'alert' | 'x';
}

export const zoneStyles: Record<ThresholdZone, ZoneStyle> = {
  safe: {
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    progressColor: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
    pulseAnimation: false,
    icon: 'check',
  },
  caution: {
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    progressColor: 'bg-gradient-to-r from-amber-600 to-amber-500',
    pulseAnimation: false,
    icon: 'warning',
  },
  danger: {
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    progressColor: 'bg-gradient-to-r from-orange-600 to-orange-500',
    pulseAnimation: true,
    icon: 'alert',
  },
  breach: {
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    progressColor: 'bg-gradient-to-r from-red-600 to-red-500',
    pulseAnimation: true,
    icon: 'x',
  },
};

export function getZoneStyle(zone: ThresholdZone): ZoneStyle {
  return zoneStyles[zone];
}

// =============================================================================
// ALERT GENERATION
// =============================================================================

export interface CovenantAlert {
  name: string;
  zone: ThresholdZone;
  utilization: number;
  message: string;
}

export interface AlertSummary {
  hasAlerts: boolean;
  breachCount: number;
  dangerCount: number;
  cautionCount: number;
  alerts: CovenantAlert[];
  message: string;
}

/**
 * Generates alerts for covenants approaching thresholds
 */
export function generateAlerts(
  covenants: Array<{
    name: string;
    actual: number;
    required: number;
    operator: '<=' | '>=' | '<' | '>' | '=' | '!=';
    suspended?: boolean;
  }>
): AlertSummary {
  const alerts: CovenantAlert[] = [];
  let breachCount = 0;
  let dangerCount = 0;
  let cautionCount = 0;

  for (const covenant of covenants) {
    // Skip suspended covenants
    if (covenant.suspended) continue;

    const zone = getThresholdZone(
      covenant.actual,
      covenant.required,
      covenant.operator
    );

    // Only create alerts for non-safe zones
    if (zone !== 'safe') {
      const utilization = getUtilizationPercent(
        covenant.actual,
        covenant.required,
        covenant.operator
      );

      const displayName = covenant.name.replace(/([A-Z])/g, ' $1').trim();

      let message: string;
      switch (zone) {
        case 'breach':
          message = `${displayName} in breach`;
          breachCount++;
          break;
        case 'danger':
          message = `${displayName} at ${utilization.toFixed(0)}% of threshold`;
          dangerCount++;
          break;
        case 'caution':
          message = `${displayName} at ${utilization.toFixed(0)}% of threshold`;
          cautionCount++;
          break;
        default:
          message = '';
      }

      alerts.push({
        name: covenant.name,
        zone,
        utilization,
        message,
      });
    }
  }

  // Sort by severity (breach > danger > caution) then by utilization
  alerts.sort((a, b) => {
    const zonePriority: Record<ThresholdZone, number> = { breach: 0, danger: 1, caution: 2, safe: 3 };
    if (zonePriority[a.zone] !== zonePriority[b.zone]) {
      return zonePriority[a.zone] - zonePriority[b.zone];
    }
    return b.utilization - a.utilization;
  });

  // Generate summary message
  const hasAlerts = alerts.length > 0;
  let summaryMessage = '';

  if (breachCount > 0) {
    summaryMessage = `${breachCount} covenant${breachCount > 1 ? 's' : ''} in breach`;
  } else if (dangerCount > 0) {
    summaryMessage = `${dangerCount} covenant${dangerCount > 1 ? 's' : ''} approaching threshold`;
  } else if (cautionCount > 0) {
    summaryMessage = `${cautionCount} covenant${cautionCount > 1 ? 's' : ''} to monitor`;
  }

  // Add specific names if only 1-2 alerts
  if (hasAlerts && alerts.length <= 2) {
    const names = alerts.map(a => a.name.replace(/([A-Z])/g, ' $1').trim());
    summaryMessage += `: ${names.join(', ')}`;
  }

  return {
    hasAlerts,
    breachCount,
    dangerCount,
    cautionCount,
    alerts,
    message: summaryMessage,
  };
}

// =============================================================================
// TREND ANALYSIS
// =============================================================================

export interface TrendAnalysis {
  direction: 'improving' | 'worsening' | 'stable';
  percentChange: number;
  projectedBreachPeriod?: string;  // e.g., "Q3 2026"
}

/**
 * Analyzes trend from historical values
 * @param values - Array of historical values, oldest first
 * @param isMaxCovenant - True if lower is better (e.g., leverage <= 4.5x)
 */
export function analyzeTrend(
  values: number[],
  isMaxCovenant: boolean,
  threshold?: number
): TrendAnalysis | null {
  if (values.length < 2) return null;

  const recent = values.slice(-3); // Last 3 periods
  const oldest = recent[0]!;
  const latest = recent[recent.length - 1]!;

  const change = latest - oldest;
  const percentChange = oldest !== 0 ? (change / oldest) * 100 : 0;

  // Determine direction based on covenant type
  let direction: TrendAnalysis['direction'];
  if (Math.abs(percentChange) < 2) {
    direction = 'stable';
  } else if (isMaxCovenant) {
    // For max covenants, increasing value is worsening
    direction = change > 0 ? 'worsening' : 'improving';
  } else {
    // For min covenants, decreasing value is worsening
    direction = change < 0 ? 'worsening' : 'improving';
  }

  // Project breach period if worsening
  let projectedBreachPeriod: string | undefined;
  if (direction === 'worsening' && threshold !== undefined && values.length >= 2) {
    const avgChange = change / (recent.length - 1);
    if (avgChange !== 0) {
      const periodsToBreak = (threshold - latest) / avgChange;
      if (periodsToBreak > 0 && periodsToBreak < 12) {
        // Assuming quarterly periods
        const quarters = Math.ceil(periodsToBreak);
        const now = new Date();
        const futureQuarter = Math.floor((now.getMonth() + 3 * quarters) / 3) % 4 + 1;
        const futureYear = now.getFullYear() + Math.floor((now.getMonth() + 3 * quarters) / 12);
        projectedBreachPeriod = `Q${futureQuarter} ${futureYear}`;
      }
    }
  }

  return {
    direction,
    percentChange,
    projectedBreachPeriod,
  };
}
