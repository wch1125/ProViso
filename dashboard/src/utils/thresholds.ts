/**
 * Early Warning System - Threshold Zone Detection
 *
 * Calculates threshold zones for covenant compliance to provide
 * visual indicators when approaching breach.
 */

// =============================================================================
// THRESHOLD ZONES
// =============================================================================

/**
 * Covenant zones.
 *
 * `at_the_line` is compliant with no cushion left — the covenant is met, but
 * exactly. It exists because a covenant sitting on its floor otherwise wore
 * breach-red while the panel header said "3/3 passing", which reads as a
 * contradiction. It is a genuinely different state from a breach and gets its
 * own treatment and label rather than being rounded to either neighbour.
 */
export type ThresholdZone = 'safe' | 'caution' | 'danger' | 'at_the_line' | 'breach';

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

  // Strict operators breach at equality: under `< 4.5x`, an actual of exactly
  // 4.5x is already non-compliant. Treating it as merely "danger" showed amber
  // for a covenant the engine reports as breached.
  const isStrict = operator === '<' || operator === '>';
  if (utilization > 1 || (isStrict && utilization === 1)) return 'breach';

  // Exactly at the threshold under an inclusive operator: still compliant, but
  // with zero cushion. Distinct from breach, and distinct from "close to" it.
  if (utilization === 1) return 'at_the_line';

  if (utilization >= config.dangerAt) return 'danger';
  if (utilization >= config.cautionAt) return 'caution';
  return 'safe';
}

/**
 * Presentation for a zone: the token it wears and how it is labelled.
 *
 * Status is never carried by colour alone — every zone ships a label, so the
 * meaning survives a colourblind reader, a greyscale print, and a squint.
 */
export interface ZonePresentation {
  /** Tailwind text colour class, bound to a semantic token. */
  textClass: string;
  /** Tailwind background class for bars and fills. */
  barClass: string;
  /** Short label shown beside the value. */
  label: string;
}

const ZONE_PRESENTATION: Record<ThresholdZone, ZonePresentation> = {
  safe: { textClass: 'text-status-safe', barClass: 'bg-status-safe', label: 'Compliant' },
  caution: { textClass: 'text-status-caution', barClass: 'bg-status-caution', label: 'Approaching' },
  danger: { textClass: 'text-status-caution', barClass: 'bg-status-caution', label: 'Close to breach' },
  at_the_line: {
    textClass: 'text-status-attention',
    barClass: 'bg-status-attention',
    label: 'No headroom',
  },
  breach: { textClass: 'text-status-breach', barClass: 'bg-status-breach', label: 'Breach' },
};

export function getZonePresentation(zone: ThresholdZone): ZonePresentation {
  return ZONE_PRESENTATION[zone];
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

/**
 * Distance to breach information
 */
export interface DistanceToBreach {
  /** Percentage headroom remaining until breach (100 - utilization) */
  percent: number;
  /** Absolute value difference from threshold */
  absolute: number;
  /** Whether currently in breach */
  isInBreach: boolean;
}

/**
 * Calculates the distance to breach for a covenant value
 * Returns "% to breach" which is more intuitive than "headroom"
 *
 * @param actual - Current covenant value
 * @param threshold - Covenant threshold/limit
 * @param operator - Comparison operator (<= for max covenants, >= for min covenants)
 */
export function getDistanceToBreach(
  actual: number,
  threshold: number,
  operator: '<=' | '>=' | '<' | '>' | '=' | '!='
): DistanceToBreach {
  const isMaxCovenant = operator === '<=' || operator === '<';
  const utilizationPercent = getUtilizationPercent(actual, threshold, operator);

  // Calculate absolute distance
  let absolute: number;
  if (isMaxCovenant) {
    // For max covenants (leverage <= 4.5x): threshold - actual = headroom
    absolute = threshold - actual;
  } else {
    // For min covenants (coverage >= 1.25x): actual - threshold = headroom
    absolute = actual - threshold;
  }

  return {
    percent: Math.max(0, 100 - utilizationPercent),
    absolute,
    isInBreach: utilizationPercent > 100,
  };
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
    bgColor: 'bg-success/10',
    textColor: 'text-success',
    borderColor: 'border-success/30',
    progressColor: 'bg-gradient-to-r from-emerald-600 to-success',
    pulseAnimation: false,
    icon: 'check',
  },
  caution: {
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    borderColor: 'border-warning/30',
    progressColor: 'bg-gradient-to-r from-amber-600 to-warning',
    pulseAnimation: false,
    icon: 'warning',
  },
  danger: {
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    borderColor: 'border-warning/30',
    progressColor: 'bg-gradient-to-r from-warning-dark to-warning',
    pulseAnimation: true,
    icon: 'alert',
  },
  // Compliant with zero cushion. Deliberately NOT breach-red — the covenant
  // is met — but escalated past caution-amber so it does not read as routine.
  at_the_line: {
    bgColor: 'bg-status-attentionTint',
    textColor: 'text-status-attention',
    borderColor: 'border-status-attention/30',
    progressColor: 'bg-status-attention',
    pulseAnimation: false,
    icon: 'alert',
  },
  breach: {
    bgColor: 'bg-danger/10',
    textColor: 'text-danger',
    borderColor: 'border-danger/30',
    progressColor: 'bg-gradient-to-r from-red-600 to-danger',
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
  /** Compliant, but with no cushion left. Ranks between breach and danger. */
  atTheLineCount: number;
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
  let atTheLineCount = 0;
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
        case 'at_the_line':
          message = `${displayName} is exactly at its limit — no headroom`;
          atTheLineCount++;
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

  // Sort by severity then by utilization. At-the-line ranks just below a
  // breach: the covenant is compliant, but there is nothing left.
  alerts.sort((a, b) => {
    const zonePriority: Record<ThresholdZone, number> = {
      breach: 0, at_the_line: 1, danger: 2, caution: 3, safe: 4,
    };
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
  } else if (atTheLineCount > 0) {
    summaryMessage = `${atTheLineCount} covenant${atTheLineCount > 1 ? 's' : ''} with no headroom`;
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
    atTheLineCount,
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
