/**
 * Natural Language Narrative Generation
 *
 * Generates human-readable explanations for covenant compliance,
 * basket utilization, milestone status, and other credit agreement elements.
 */

// =============================================================================
// FORMATTING HELPERS
// =============================================================================

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatRatio(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDays(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return '1 day';
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `${days} days`;
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return formatDays(diffDays);
}

// =============================================================================
// COVENANT NARRATIVES
// =============================================================================

export type CovenantNarrativeStatus = 'compliant' | 'breach' | 'cured' | 'suspended';

export interface CovenantNarrativeInput {
  name: string;
  actual: number;
  threshold: number;
  operator: '<=' | '>=' | '<' | '>' | '=' | '!=';
  compliant: boolean;
  headroom?: number;
  suspended?: boolean;
  cured?: boolean;
  cureType?: string;
  curesRemaining?: number;
  nextTestDate?: Date | string;
}

export interface CovenantNarrative {
  status: CovenantNarrativeStatus;
  summary: string;
  detail: string;
  headroomText?: string;
  nextTestText?: string;
}

export function generateCovenantNarrative(input: CovenantNarrativeInput): CovenantNarrative {
  const {
    name,
    actual,
    threshold,
    operator,
    compliant,
    headroom,
    suspended,
    cured,
    cureType,
    curesRemaining,
    nextTestDate,
  } = input;

  // Determine appropriate unit based on typical covenant values
  const unit = actual > 10 ? '' : 'x';
  const formatValue = (v: number) => unit === 'x' ? formatRatio(v) : v.toFixed(2);

  // Suspended covenants
  if (suspended) {
    return {
      status: 'suspended',
      summary: `${formatDisplayName(name)} is SUSPENDED during current phase.`,
      detail: `Testing will resume when project phase changes. Current value: ${formatValue(actual)}.`,
    };
  }

  // Cured covenants
  if (cured) {
    const cureInfo = cureType ? ` via ${cureType}` : '';
    const remainingInfo = curesRemaining !== undefined
      ? ` ${curesRemaining} cure right${curesRemaining === 1 ? '' : 's'} remaining.`
      : '';

    return {
      status: 'cured',
      summary: `${formatDisplayName(name)} breach was CURED${cureInfo}.`,
      detail: `Original threshold: ${operator} ${formatValue(threshold)}.${remainingInfo}`,
    };
  }

  // Determine covenant direction
  const isMaxCovenant = operator === '<=' || operator === '<';

  // Compliant covenants
  if (compliant) {
    const headroomText = headroom !== undefined
      ? `${formatValue(Math.abs(headroom))} headroom before breach`
      : undefined;

    const nextTestText = nextTestDate
      ? `Next test: ${formatRelativeDate(nextTestDate)}`
      : undefined;

    return {
      status: 'compliant',
      summary: `${formatDisplayName(name)} is COMPLIANT at ${formatValue(actual)} (threshold: ${operator} ${formatValue(threshold)}).`,
      detail: headroom !== undefined
        ? `${headroomText}. ${isMaxCovenant ? 'Lower is better.' : 'Higher is better.'}`
        : `Currently meeting requirements.`,
      headroomText,
      nextTestText,
    };
  }

  // Breach
  const overage = Math.abs(actual - threshold);
  return {
    status: 'breach',
    summary: `${formatDisplayName(name)} is in BREACH at ${formatValue(actual)} (threshold: ${operator} ${formatValue(threshold)}).`,
    detail: `Exceeds ${isMaxCovenant ? 'maximum' : 'fails to meet minimum'} by ${formatValue(overage)}.`,
    headroomText: `${formatValue(overage)} ${isMaxCovenant ? 'over' : 'under'} threshold`,
  };
}

// =============================================================================
// BASKET NARRATIVES
// =============================================================================

export interface BasketNarrativeInput {
  name: string;
  used: number;
  capacity: number;
  basketType?: 'fixed' | 'grower' | 'builder';
}

export interface BasketNarrative {
  summary: string;
  detail: string;
  utilizationText: string;
  isExhausted: boolean;
}

export function generateBasketNarrative(input: BasketNarrativeInput): BasketNarrative {
  const { name, used, capacity, basketType } = input;
  const available = capacity - used;
  const utilization = capacity > 0 ? (used / capacity) * 100 : 100;
  const isExhausted = available <= 0;

  const utilizationText = `${utilization.toFixed(0)}% utilized`;

  if (isExhausted) {
    return {
      summary: `${formatDisplayName(name)} is FULLY UTILIZED.`,
      detail: `No remaining capacity. Total capacity: ${formatCurrency(capacity)}.`,
      utilizationText,
      isExhausted: true,
    };
  }

  const typeNote = basketType === 'grower'
    ? ' (grows with financial metrics)'
    : basketType === 'builder'
    ? ' (accumulates over time)'
    : '';

  return {
    summary: `${formatDisplayName(name)}: ${formatCurrency(available)} available of ${formatCurrency(capacity)} capacity${typeNote}.`,
    detail: `${formatCurrency(used)} used. ${utilizationText}.`,
    utilizationText,
    isExhausted: false,
  };
}

// =============================================================================
// MILESTONE NARRATIVES
// =============================================================================

export type MilestoneNarrativeStatus = 'achieved' | 'on_track' | 'at_risk' | 'breached' | 'pending';

export interface MilestoneNarrativeInput {
  name: string;
  status: 'pending' | 'achieved' | 'at_risk' | 'breached' | 'in_progress';
  targetDate?: Date | string;
  longstopDate?: Date | string;
  achievedDate?: Date | string;
  percentComplete?: number;
}

export interface MilestoneNarrative {
  status: MilestoneNarrativeStatus;
  summary: string;
  detail: string;
  urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export function generateMilestoneNarrative(input: MilestoneNarrativeInput): MilestoneNarrative {
  const { name, status, targetDate, longstopDate, achievedDate, percentComplete } = input;

  // Achieved milestone
  if (status === 'achieved' || achievedDate) {
    const achievedText = achievedDate
      ? ` on ${new Date(achievedDate).toLocaleDateString()}`
      : '';

    return {
      status: 'achieved',
      summary: `${formatDisplayName(name)} ACHIEVED${achievedText}.`,
      detail: 'Milestone requirements have been satisfied.',
      urgencyLevel: 'none',
    };
  }

  // Calculate days to target and longstop
  const now = new Date();
  const daysToTarget = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const daysToLongstop = longstopDate
    ? Math.ceil((new Date(longstopDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Breached (past longstop)
  if (status === 'breached' || (daysToLongstop !== null && daysToLongstop < 0)) {
    return {
      status: 'breached',
      summary: `${formatDisplayName(name)} has BREACHED longstop date.`,
      detail: longstopDate
        ? `Longstop date was ${new Date(longstopDate).toLocaleDateString()}.`
        : 'Milestone deadline has passed.',
      urgencyLevel: 'critical',
    };
  }

  // At risk (past target but before longstop)
  if (status === 'at_risk' || (daysToTarget !== null && daysToTarget < 0 && daysToLongstop !== null && daysToLongstop >= 0)) {
    return {
      status: 'at_risk',
      summary: `${formatDisplayName(name)} is AT RISK.`,
      detail: daysToLongstop !== null
        ? `Target date missed. Only ${formatDays(daysToLongstop)} until longstop.`
        : 'Target date has passed.',
      urgencyLevel: 'high',
    };
  }

  // In progress with progress tracking
  if (percentComplete !== undefined) {
    const progressText = `${percentComplete.toFixed(0)}% complete`;
    const daysText = daysToTarget !== null ? `. ${formatDays(daysToTarget)} until target.` : '.';

    return {
      status: 'on_track',
      summary: `${formatDisplayName(name)} is ${progressText}${daysText}`,
      detail: targetDate
        ? `Target: ${new Date(targetDate).toLocaleDateString()}`
        : 'On track for completion.',
      urgencyLevel: daysToTarget !== null && daysToTarget < 30 ? 'medium' : 'low',
    };
  }

  // Pending/on track
  if (daysToTarget !== null) {
    const urgency: MilestoneNarrative['urgencyLevel'] =
      daysToTarget < 7 ? 'high' :
      daysToTarget < 30 ? 'medium' :
      daysToTarget < 90 ? 'low' : 'none';

    return {
      status: 'on_track',
      summary: `${formatDisplayName(name)} is ON TRACK. ${formatDays(daysToTarget)} until target.`,
      detail: targetDate
        ? `Target: ${new Date(targetDate).toLocaleDateString()}`
        : 'Awaiting completion.',
      urgencyLevel: urgency,
    };
  }

  // Default pending
  return {
    status: 'pending',
    summary: `${formatDisplayName(name)} is PENDING.`,
    detail: 'Awaiting completion.',
    urgencyLevel: 'none',
  };
}

// =============================================================================
// RESERVE NARRATIVES
// =============================================================================

export interface ReserveNarrativeInput {
  name: string;
  balance: number;
  target: number;
  minimum: number;
}

export interface ReserveNarrative {
  summary: string;
  detail: string;
  fundingStatus: 'fully_funded' | 'above_minimum' | 'at_minimum' | 'below_minimum';
}

export function generateReserveNarrative(input: ReserveNarrativeInput): ReserveNarrative {
  const { name, balance, target, minimum } = input;

  const percentOfTarget = target > 0 ? (balance / target) * 100 : 0;
  const available = balance - minimum;

  // Fully funded
  if (balance >= target) {
    return {
      summary: `${formatDisplayName(name)} is FULLY FUNDED at ${formatCurrency(balance)}.`,
      detail: `${formatCurrency(available)} available for release above ${formatCurrency(minimum)} minimum.`,
      fundingStatus: 'fully_funded',
    };
  }

  // Below minimum
  if (balance < minimum) {
    return {
      summary: `${formatDisplayName(name)} is BELOW MINIMUM at ${formatCurrency(balance)}.`,
      detail: `${formatCurrency(minimum - balance)} shortfall below required minimum.`,
      fundingStatus: 'below_minimum',
    };
  }

  // At minimum
  if (balance === minimum) {
    return {
      summary: `${formatDisplayName(name)} is at MINIMUM level of ${formatCurrency(balance)}.`,
      detail: `${formatCurrency(target - balance)} needed to reach target. No funds available for release.`,
      fundingStatus: 'at_minimum',
    };
  }

  // Above minimum but below target
  return {
    summary: `${formatDisplayName(name)} is ${percentOfTarget.toFixed(0)}% funded at ${formatCurrency(balance)}.`,
    detail: `${formatCurrency(target - balance)} needed to reach ${formatCurrency(target)} target.`,
    fundingStatus: 'above_minimum',
  };
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Converts PascalCase or camelCase names to readable display names
 */
export function formatDisplayName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^[\s_]+|[\s_]+$/g, '')
    .trim();
}

/**
 * Generates an overall status summary for a deal
 */
export interface DealStatusSummaryInput {
  compliantCovenants: number;
  totalActiveCovenants: number;
  milestonesAchieved: number;
  totalMilestones: number;
  milestonesAtRisk: number;
  reserveFundingPercent: number;
  hasBlockedDistributions: boolean;
}

export interface DealStatusSummary {
  headline: string;
  items: string[];
  overallStatus: 'healthy' | 'caution' | 'critical';
}

export function generateDealStatusSummary(input: DealStatusSummaryInput): DealStatusSummary {
  const {
    compliantCovenants,
    totalActiveCovenants,
    milestonesAchieved,
    totalMilestones,
    milestonesAtRisk,
    reserveFundingPercent,
    hasBlockedDistributions,
  } = input;

  const items: string[] = [];
  let overallStatus: DealStatusSummary['overallStatus'] = 'healthy';

  // Covenant status
  if (compliantCovenants < totalActiveCovenants) {
    items.push(`${totalActiveCovenants - compliantCovenants} covenant${totalActiveCovenants - compliantCovenants > 1 ? 's' : ''} in breach`);
    overallStatus = 'critical';
  } else {
    items.push(`All ${totalActiveCovenants} covenants passing`);
  }

  // Milestone status
  if (milestonesAtRisk > 0) {
    items.push(`${milestonesAtRisk} milestone${milestonesAtRisk > 1 ? 's' : ''} at risk`);
    if (overallStatus !== 'critical') overallStatus = 'caution';
  } else if (milestonesAchieved < totalMilestones) {
    items.push(`${milestonesAchieved}/${totalMilestones} milestones achieved`);
  }

  // Reserve funding
  if (reserveFundingPercent < 100) {
    items.push(`Reserves ${reserveFundingPercent.toFixed(0)}% funded`);
    if (reserveFundingPercent < 50 && overallStatus !== 'critical') {
      overallStatus = 'caution';
    }
  }

  // Distribution status
  if (hasBlockedDistributions) {
    items.push('Distributions blocked');
    if (overallStatus !== 'critical') overallStatus = 'caution';
  }

  // Generate headline
  const headline =
    overallStatus === 'critical'
      ? 'Immediate attention required'
      : overallStatus === 'caution'
      ? 'Items need monitoring'
      : 'Deal is healthy';

  return { headline, items, overallStatus };
}
