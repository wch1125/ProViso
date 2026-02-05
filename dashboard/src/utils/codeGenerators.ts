/**
 * ProViso Code Generators
 *
 * Regenerates clean ProViso source code from AST or dashboard data.
 * Used for the Source Code Viewer to show users the underlying code
 * for covenants, baskets, definitions, etc.
 */

// =============================================================================
// FORMATTING HELPERS
// =============================================================================

/**
 * Formats a number as currency with underscores for readability
 * e.g., 10000000 -> $10_000_000
 */
export function formatCurrencyCode(value: number): string {
  if (value === 0) return '$0';

  const str = Math.abs(value).toString();
  const parts: string[] = [];

  // Split into groups of 3 from the right
  for (let i = str.length; i > 0; i -= 3) {
    parts.unshift(str.slice(Math.max(0, i - 3), i));
  }

  return (value < 0 ? '-' : '') + '$' + parts.join('_');
}

/**
 * Formats a ratio value
 * e.g., 4.5 -> 4.50
 */
export function formatRatioCode(value: number): string {
  return value.toFixed(2);
}

/**
 * Formats a percentage as decimal or bps
 * e.g., 0.05 -> 5% or 50bps
 */
export function formatPercentageCode(value: number, useBps: boolean = false): string {
  if (useBps) {
    return `${(value * 10000).toFixed(0)}bps`;
  }
  return `${(value * 100).toFixed(0)}%`;
}

// =============================================================================
// COVENANT CODE GENERATION
// =============================================================================

export interface CovenantCodeInput {
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  tested?: 'quarterly' | 'annually' | 'monthly';
  cure?: {
    type: 'EquityCure' | 'PaymentCure';
    maxUses?: number;
    overPeriod?: string;
    maxAmount?: number;
    curePeriod?: string;
  };
  breach?: string;
}

export function generateCovenantCode(input: CovenantCodeInput): string {
  const lines: string[] = [];

  lines.push(`COVENANT ${input.name}`);
  lines.push(`  REQUIRES ${input.metric} ${input.operator} ${formatRatioCode(input.threshold)}`);

  if (input.tested) {
    const testedMap: Record<string, string> = {
      quarterly: 'QUARTERLY',
      annually: 'ANNUALLY',
      monthly: 'MONTHLY',
    };
    lines.push(`  TESTED ${testedMap[input.tested]}`);
  }

  if (input.cure) {
    const cureLine = [`  CURE ${input.cure.type}`];
    if (input.cure.maxUses !== undefined) {
      cureLine.push(`MAX_USES ${input.cure.maxUses}`);
    }
    if (input.cure.overPeriod) {
      cureLine.push(`OVER "${input.cure.overPeriod}"`);
    }
    lines.push(cureLine.join(' '));

    if (input.cure.maxAmount !== undefined) {
      lines.push(`       MAX_AMOUNT ${formatCurrencyCode(input.cure.maxAmount)}`);
    }
    if (input.cure.curePeriod) {
      lines.push(`       CURE_PERIOD ${input.cure.curePeriod}`);
    }
  }

  if (input.breach) {
    lines.push(`  BREACH "${input.breach}"`);
  }

  return lines.join('\n');
}

// =============================================================================
// BASKET CODE GENERATION
// =============================================================================

export interface BasketCodeInput {
  name: string;
  type: 'fixed' | 'grower' | 'builder';
  // Fixed
  capacity?: number;
  // Grower
  base?: number;
  percentage?: number;
  metric?: string;
  floor?: number;
  // Builder
  buildsFrom?: string;
  starting?: number;
  maximum?: number;
  // Common
  subjectTo?: string[];
}

export function generateBasketCode(input: BasketCodeInput): string {
  const lines: string[] = [];

  lines.push(`BASKET ${input.name}`);

  switch (input.type) {
    case 'fixed':
      if (input.capacity !== undefined) {
        lines.push(`  CAPACITY ${formatCurrencyCode(input.capacity)}`);
      }
      break;

    case 'grower':
      if (input.base !== undefined && input.percentage !== undefined && input.metric) {
        lines.push(`  CAPACITY GREATER_OF(`);
        lines.push(`    ${formatCurrencyCode(input.base)},`);
        lines.push(`    ${input.percentage}% OF ${input.metric}`);
        lines.push(`  )`);
        if (input.floor !== undefined) {
          lines.push(`  FLOOR ${formatCurrencyCode(input.floor)}`);
        }
      }
      break;

    case 'builder':
      if (input.buildsFrom) {
        lines.push(`  BUILDS_FROM ${input.buildsFrom}`);
      }
      if (input.starting !== undefined) {
        lines.push(`  STARTING ${formatCurrencyCode(input.starting)}`);
      }
      if (input.maximum !== undefined) {
        lines.push(`  MAXIMUM ${formatCurrencyCode(input.maximum)}`);
      }
      break;
  }

  if (input.subjectTo && input.subjectTo.length > 0) {
    lines.push(`  SUBJECT_TO ${input.subjectTo.join(', ')}`);
  }

  return lines.join('\n');
}

// =============================================================================
// DEFINITION CODE GENERATION
// =============================================================================

export interface DefinitionCodeInput {
  name: string;
  expression: string;
  excluding?: string[];
  cappedAt?: number;
  trailing?: {
    periods: number;
    unit: 'QUARTERS' | 'MONTHS' | 'YEARS';
  };
}

export function generateDefinitionCode(input: DefinitionCodeInput): string {
  const lines: string[] = [];

  let defLine = `DEFINE ${input.name} = `;

  if (input.trailing) {
    defLine += `TRAILING ${input.trailing.periods} ${input.trailing.unit} OF (${input.expression})`;
  } else {
    defLine += input.expression;
  }

  lines.push(defLine);

  if (input.excluding && input.excluding.length > 0) {
    lines.push(`  EXCLUDING ${input.excluding.join(', ')}`);
  }

  if (input.cappedAt !== undefined) {
    lines.push(`  CAPPED AT ${formatCurrencyCode(input.cappedAt)}`);
  }

  return lines.join('\n');
}

// =============================================================================
// MILESTONE CODE GENERATION
// =============================================================================

export interface MilestoneCodeInput {
  name: string;
  target?: string;
  longstop?: string;
  triggers?: string[];
  requires?: {
    type: 'all' | 'any';
    items: string[];
  };
}

export function generateMilestoneCode(input: MilestoneCodeInput): string {
  const lines: string[] = [];

  lines.push(`MILESTONE ${input.name}`);

  if (input.target) {
    lines.push(`  TARGET ${input.target}`);
  }

  if (input.longstop) {
    lines.push(`  LONGSTOP ${input.longstop}`);
  }

  if (input.triggers && input.triggers.length > 0) {
    lines.push(`  TRIGGERS ${input.triggers.join(', ')}`);
  }

  if (input.requires) {
    const reqType = input.requires.type === 'all' ? 'ALL_OF' : 'ANY_OF';
    lines.push(`  REQUIRES ${reqType}(`);
    for (const item of input.requires.items) {
      lines.push(`    ${item},`);
    }
    lines.push(`  )`);
  }

  return lines.join('\n');
}

// =============================================================================
// RESERVE CODE GENERATION
// =============================================================================

export interface ReserveCodeInput {
  name: string;
  target?: number;
  minimum?: number;
  fundedBy?: string[];
  releasedFor?: string[];
}

export function generateReserveCode(input: ReserveCodeInput): string {
  const lines: string[] = [];

  lines.push(`RESERVE ${input.name}`);

  if (input.target !== undefined) {
    lines.push(`  TARGET ${formatCurrencyCode(input.target)}`);
  }

  if (input.minimum !== undefined) {
    lines.push(`  MINIMUM ${formatCurrencyCode(input.minimum)}`);
  }

  if (input.fundedBy && input.fundedBy.length > 0) {
    lines.push(`  FUNDED_BY ${input.fundedBy.join(', ')}`);
  }

  if (input.releasedFor && input.releasedFor.length > 0) {
    lines.push(`  RELEASED_FOR ${input.releasedFor.join(', ')}`);
  }

  return lines.join('\n');
}

// =============================================================================
// PHASE CODE GENERATION
// =============================================================================

export interface PhaseCodeInput {
  name: string;
  until?: string;
  from?: string;
  covenantsSuspended?: string[];
  covenantsActive?: string[];
  required?: string[];
}

export function generatePhaseCode(input: PhaseCodeInput): string {
  const lines: string[] = [];

  lines.push(`PHASE ${input.name}`);

  if (input.until) {
    lines.push(`  UNTIL ${input.until}`);
  }

  if (input.from) {
    lines.push(`  FROM ${input.from}`);
  }

  if (input.covenantsSuspended && input.covenantsSuspended.length > 0) {
    lines.push(`  COVENANTS SUSPENDED(${input.covenantsSuspended.join(', ')})`);
  }

  if (input.covenantsActive && input.covenantsActive.length > 0) {
    lines.push(`  COVENANTS ACTIVE(${input.covenantsActive.join(', ')})`);
  }

  if (input.required && input.required.length > 0) {
    lines.push(`  REQUIRED ${input.required.join(', ')}`);
  }

  return lines.join('\n');
}

// =============================================================================
// GENERIC CODE FROM DASHBOARD DATA
// =============================================================================

/**
 * Generates a simple covenant code from CovenantData
 */
export function generateCovenantCodeFromData(data: {
  name: string;
  actual: number;
  required: number;
  operator: string;
}): string {
  // Infer a reasonable metric name from the covenant name
  const metricName = data.name.replace(/^(Max|Min)/, '');

  return generateCovenantCode({
    name: data.name,
    metric: metricName,
    operator: data.operator,
    threshold: data.required,
    tested: 'quarterly',
  });
}

/**
 * Generates basket code from dashboard data
 */
export function generateBasketCodeFromData(data: {
  name: string;
  used: number;
  capacity: number;
  type?: 'fixed' | 'grower' | 'builder';
}): string {
  return generateBasketCode({
    name: data.name,
    type: data.type || 'fixed',
    capacity: data.capacity,
  });
}

// =============================================================================
// SYNTAX HIGHLIGHTING TOKENS
// =============================================================================

export const PROVISO_KEYWORDS = [
  'DEFINE', 'COVENANT', 'BASKET', 'CONDITION', 'PROHIBIT', 'EXCEPT', 'WHEN',
  'EVENT', 'PHASE', 'TRANSITION', 'MILESTONE', 'RESERVE', 'WATERFALL',
  'TECHNICAL_MILESTONE', 'REGULATORY_REQUIREMENT', 'PERFORMANCE_GUARANTEE',
  'DEGRADATION_SCHEDULE', 'SEASONAL_ADJUSTMENT', 'TAX_EQUITY_STRUCTURE',
  'TAX_CREDIT', 'DEPRECIATION_SCHEDULE', 'FLIP_EVENT', 'CONDITIONS_PRECEDENT',
  'REQUIRES', 'TESTED', 'CURE', 'BREACH', 'CAPACITY', 'FLOOR', 'BUILDS_FROM',
  'STARTING', 'MAXIMUM', 'SUBJECT_TO', 'EXCLUDING', 'CAPPED', 'AT', 'TRAILING',
  'TARGET', 'LONGSTOP', 'TRIGGERS', 'ALL_OF', 'ANY_OF', 'UNTIL', 'FROM',
  'COVENANTS', 'SUSPENDED', 'ACTIVE', 'REQUIRED', 'MINIMUM', 'FUNDED_BY',
  'RELEASED_FOR', 'RELEASED_TO', 'TIER', 'PAY', 'SHORTFALL', 'IF', 'QUARTERLY',
  'ANNUALLY', 'MONTHLY', 'SEMI_ANNUALLY', 'EquityCure', 'PaymentCure',
  'MAX_USES', 'MAX_AMOUNT', 'CURE_PERIOD', 'OVER', 'GREATER_OF', 'PLUS',
  'AND', 'OR', 'NOT', 'NOTWITHSTANDING', 'MEASUREMENT', 'TARGET_VALUE',
  'CURRENT_VALUE', 'PROGRESS_METRIC', 'AGENCY', 'TYPE', 'REQUIRED_FOR',
  'STATUS', 'APPROVAL_DATE', 'SATISFIES', 'METRIC', 'P50', 'P75', 'P90', 'P99',
  'ACTUAL', 'GUARANTEE_PERIOD', 'SHORTFALL_RATE', 'INSURANCE_COVERAGE',
  'ASSET_TYPE', 'INITIAL_CAPACITY', 'YEAR_1_DEGRADATION', 'ANNUAL_DEGRADATION',
  'MINIMUM_CAPACITY', 'SCHEDULE', 'AFFECTS', 'SEASON', 'ADJUSTMENT_FACTOR',
  'REASON', 'STRUCTURE_TYPE', 'TAX_INVESTOR', 'SPONSOR', 'TAX_CREDIT_ALLOCATION',
  'DEPRECIATION_ALLOCATION', 'CASH_ALLOCATION', 'FLIP_DATE', 'TARGET_RETURN',
  'BUYOUT_PRICE', 'CREDIT_TYPE', 'RATE', 'ELIGIBLE_BASIS', 'CREDIT_AMOUNT',
  'ADDER', 'VESTING_PERIOD', 'RECAPTURE_RISK', 'METHOD', 'DEPRECIABLE_BASIS',
  'BONUS_DEPRECIATION', 'TRIGGER', 'PRE_FLIP_ALLOCATION', 'POST_FLIP_ALLOCATION',
  'BUYOUT_OPTION', 'SECTION', 'CP', 'DESCRIPTION', 'RESPONSIBLE',
];

export const PROVISO_OPERATORS = [
  '<=', '>=', '<', '>', '=', '!=', '+', '-', '*', '/', '%',
];
