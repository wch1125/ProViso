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

  // Strict operators breach at equality: under `< 4.5x`, an actual of exactly
  // 4.5x is already non-compliant. Treating it as merely "danger" showed amber
  // for a covenant the engine reports as breached.
  const isStrict = operator === '<' || operator === '>';
  if (utilization > 1 || (isStrict && utilization === 1)) return 'breach';
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

// =============================================================================
// OVERALL DEAL STATUS
// =============================================================================

/**
 * The deal-level status vocabulary.
 *
 * Deliberately avoids any word used as a navigation tab label — a status tile
 * reading "Monitor" while sitting on the Monitor tab looks like the page name
 * leaked into the status slot, even when it is a real status tier.
 */
export type OverallStatus = 'on_track' | 'attention' | 'at_risk' | 'breach';

export interface OverallStatusResult {
  status: OverallStatus;
  /** Display label. */
  label: string;
  /**
   * The single most severe reason, phrased for a reader who has not looked at
   * anything else on the page. Null when nothing is wrong.
   */
  reason: string | null;
}

const OVERALL_STATUS_LABELS: Record<OverallStatus, string> = {
  on_track: 'On Track',
  attention: 'Attention',
  at_risk: 'At Risk',
  breach: 'Breach',
};

/** Inputs the deal status is derived from. */
export interface OverallStatusInput {
  covenants: Array<{
    name: string;
    actual: number;
    required: number;
    operator: '<=' | '>=' | '<' | '>' | '=' | '!=';
    suspended?: boolean;
    compliant: boolean;
  }>;
  milestones: Array<{ name: string; status: string }>;
  reserves: Array<{ name: string; balance: number; target: number; minimum: number }>;
  blockedDistribution: number;
}

/**
 * Derive the deal's overall health from every signal on the page, not just
 * covenants.
 *
 * A deal with a breached milestone and a starved debt service reserve should
 * not read "On Track" merely because its covenants pass — which is what
 * happened when this was derived from covenant compliance alone.
 *
 * Severity order is fixed: a covenant breach outranks a missed longstop, which
 * outranks an early warning. The reason returned is always the single most
 * severe item, so the tile answers "what is the worst thing here?".
 */
export function deriveOverallStatus(input: OverallStatusInput): OverallStatusResult {
  const active = input.covenants.filter((c) => !c.suspended);

  // --- Breach: a covenant is failing ---
  const breached = active.filter((c) => !c.compliant);
  if (breached.length > 0) {
    const names = breached.map((c) => c.name);
    return {
      status: 'breach',
      label: OVERALL_STATUS_LABELS.breach,
      reason:
        names.length === 1
          ? `${names[0]} is in breach`
          : `${names.length} covenants in breach (${names.slice(0, 2).join(', ')}…)`,
    };
  }

  // --- At risk: compliant, but something material has already gone wrong ---
  const breachedMilestones = input.milestones.filter((m) => m.status === 'breached');
  if (breachedMilestones.length > 0) {
    return {
      status: 'at_risk',
      label: OVERALL_STATUS_LABELS.at_risk,
      reason:
        breachedMilestones.length === 1
          ? `${breachedMilestones[0]?.name} has passed its longstop date`
          : `${breachedMilestones.length} milestones past longstop`,
    };
  }

  const alerts = generateAlerts(active);
  if (alerts.dangerCount > 0) {
    const nearest = alerts.alerts.find((a) => a.zone === 'danger');
    return {
      status: 'at_risk',
      label: OVERALL_STATUS_LABELS.at_risk,
      reason: nearest
        ? `${nearest.name} is close to breaching`
        : 'A covenant is close to breaching',
    };
  }

  const belowMinimum = input.reserves.filter((r) => r.minimum > 0 && r.balance < r.minimum);
  if (belowMinimum.length > 0) {
    return {
      status: 'at_risk',
      label: OVERALL_STATUS_LABELS.at_risk,
      reason: `${belowMinimum[0]?.name} is below its required minimum`,
    };
  }

  // --- Attention: early warnings, and cash the deal could not release ---
  if (alerts.cautionCount > 0) {
    const nearest = alerts.alerts.find((a) => a.zone === 'caution');
    return {
      status: 'attention',
      label: OVERALL_STATUS_LABELS.attention,
      reason: nearest
        ? `${nearest.name} is approaching its threshold`
        : 'A covenant is approaching its threshold',
    };
  }

  if (input.blockedDistribution > 0) {
    return {
      status: 'attention',
      label: OVERALL_STATUS_LABELS.attention,
      reason: 'Distributions are blocked this period',
    };
  }

  const atRiskMilestones = input.milestones.filter((m) => m.status === 'at_risk');
  if (atRiskMilestones.length > 0) {
    return {
      status: 'attention',
      label: OVERALL_STATUS_LABELS.attention,
      reason:
        atRiskMilestones.length === 1
          ? `${atRiskMilestones[0]?.name} is past its target date`
          : `${atRiskMilestones.length} milestones past target`,
    };
  }

  const underfunded = input.reserves.filter((r) => r.target > 0 && r.balance < r.target);
  if (underfunded.length > 0) {
    return {
      status: 'attention',
      label: OVERALL_STATUS_LABELS.attention,
      reason: `${underfunded[0]?.name} is not yet funded to target`,
    };
  }

  return { status: 'on_track', label: OVERALL_STATUS_LABELS.on_track, reason: null };
}
