/**
 * ProViso Hub v2.0 — Word Templates
 *
 * Templates for generating Word prose from ProViso AST elements.
 * Each template converts parsed statements into legal document language.
 */

import type {
  CovenantStatement,
  BasketStatement,
  DefineStatement,
  ConditionStatement,
  PhaseStatement,
  MilestoneStatement,
  ReserveStatement,
  WaterfallStatement,
  ConditionsPrecedentStatement,
  FacilityStatement,
  TrancheType,
  Expression,
} from '../../types.js';
import { isComparisonExpression } from '../../types.js';
import { expressionToString } from '../versioning/differ.js';

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

export interface WordTemplate {
  id: string;
  elementType: string;
  render: (element: unknown, context?: WordTemplateContext) => string;
}

export interface WordTemplateContext {
  sectionPrefix?: string;
  articleNumber?: number;
  subsectionLabel?: string;
}

export interface GeneratedSection {
  /** Full reference, e.g. "7.11(a)". */
  sectionReference: string;
  /** Article-level prefix alone, e.g. "7.11". */
  sectionPrefix: string;
  title: string;
  content: string;
  elementType: string;
  elementName: string;
}

// =============================================================================
// DISPLAY FORMATTERS
// =============================================================================

/**
 * Format a currency value for Word output.
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)} billion`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)} million`;
  }
  return `$${value.toLocaleString('en-US')}`;
}

/**
 * Format a ratio for Word output.
 */
export function formatRatio(value: number): string {
  return `${value.toFixed(2)} to 1.00`;
}

/**
 * Format a percentage for Word output.
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Format an operator for Word output.
 */
export function formatOperator(operator: string): string {
  const map: Record<string, string> = {
    '<=': 'exceed',
    '>=': 'be less than',
    '<': 'equal or exceed',
    '>': 'be less than or equal to',
    '==': 'equal',
    '!=': 'not equal',
  };
  return map[operator] || operator;
}

/**
 * Format testing frequency for Word output.
 */
export function formatFrequency(frequency: string): string {
  const map: Record<string, string> = {
    monthly: 'fiscal month',
    quarterly: 'fiscal quarter',
    'semi-annually': 'semi-annual period',
    annually: 'fiscal year',
    MONTHLY: 'fiscal month',
    QUARTERLY: 'fiscal quarter',
  };
  return map[frequency] || frequency;
}

/**
 * Get the metric display name for Word output.
 */
export function getMetricDisplayName(metric: string): string {
  const map: Record<string, string> = {
    Leverage: 'Leverage Ratio (Total Debt to Consolidated EBITDA)',
    InterestCoverage: 'Interest Coverage Ratio (Consolidated EBITDA to Interest Expense)',
    DSCR: 'Debt Service Coverage Ratio',
    FixedChargeCoverage: 'Fixed Charge Coverage Ratio',
    MinEBITDA: 'Consolidated EBITDA',
    MaxCapEx: 'Capital Expenditures',
    MinLiquidity: 'Liquidity',
    TotalDebt: 'Total Debt',
    EBITDA: 'Consolidated EBITDA',
    LTM_EBITDA: 'Consolidated EBITDA for the most recently ended Test Period',
  };
  return map[metric] || metric;
}

// =============================================================================
// COVENANT TEMPLATE
// =============================================================================

/**
 * Render a covenant's threshold in its own units.
 *
 * Ratios get the conventional "3.50 to 1.00" notation; currency, percentage
 * and bare numeric thresholds are emitted as-is. Driven off the AST node type
 * rather than the stringified prose, because "to 1.00" was previously appended
 * to every covenant regardless of type — rendering a liquidity covenant as
 * "$50,000,000 to 1.00" and a leverage covenant as "3.5x to 1.00".
 *
 * Falls back to the string parsed out of the prose when the threshold is a
 * computed expression rather than a literal.
 */
function formatCovenantThreshold(requires: Expression | null, fallback: string): string {
  if (requires && isComparisonExpression(requires)) {
    const right = requires.right;
    if (right && typeof right === 'object' && 'type' in right) {
      switch (right.type) {
        case 'Ratio':
          return formatRatio(right.value);
        case 'Currency':
          return formatCurrency(right.value);
        case 'Percentage':
          return formatPercentage(right.value);
      }
    }
  }
  return fallback;
}

export function renderCovenantToWord(
  covenant: CovenantStatement,
  context?: WordTemplateContext
): string {
  const sectionRef = context?.sectionPrefix || '7.11';
  const subsection = context?.subsectionLabel || '(a)';

  // Parse the requires expression
  const requiresStr = expressionToString(covenant.requires) || '';

  // Try to extract operator and threshold
  const comparisonMatch = requiresStr.match(/(.+?)\s*(<=|>=|<|>)\s*(.+)/);

  let metricPart = '';
  let operator = '';
  let thresholdPart = '';

  if (comparisonMatch) {
    metricPart = comparisonMatch[1]?.trim() || '';
    operator = comparisonMatch[2] || '';
    thresholdPart = comparisonMatch[3]?.trim() || '';
  } else {
    metricPart = requiresStr || '';
  }

  const metricDisplay = getMetricDisplayName(metricPart);
  const operatorDisplay = formatOperator(operator);
  const frequencyDisplay = formatFrequency(covenant.tested || 'quarterly');
  const thresholdDisplay = formatCovenantThreshold(covenant.requires, thresholdPart);

  let prose = `${subsection} ${covenant.name}. `;
  prose += `The Borrower shall not permit the ${metricDisplay} `;
  prose += `as of the last day of any ${frequencyDisplay} `;
  prose += `to ${operatorDisplay} ${thresholdDisplay}`;

  // Add cure rights if present
  if (covenant.cure) {
    prose += `; provided that the Borrower may exercise a ${covenant.cure.type} `;
    prose += `with respect to any failure to comply with this Section ${sectionRef}${subsection} `;
    prose += `in accordance with Section 8.05`;
  }

  prose += '.';

  return prose;
}

// =============================================================================
// BASKET TEMPLATE
// =============================================================================

export function renderBasketToWord(
  basket: BasketStatement,
  context?: WordTemplateContext
): string {
  // sectionRef available: context?.sectionPrefix || '7.02'
  const subsection = context?.subsectionLabel || '(f)';

  const capacityStr = expressionToString(basket.capacity) || '';

  // Try to parse GreaterOf pattern
  const greaterOfMatch = capacityStr.match(/GreaterOf\(([^,]+),\s*(.+)\)/);

  let prose = `${subsection} ${basket.name}; `;

  if (greaterOfMatch) {
    const fixedPart = greaterOfMatch[1]?.trim() || '';
    const growerPart = greaterOfMatch[2]?.trim() || '';

    prose += `investments made pursuant to this clause ${subsection} not to exceed `;
    prose += `the greater of (x) ${fixedPart} and (y) ${growerPart}`;
  } else {
    prose += `investments made pursuant to this clause ${subsection} not to exceed `;
    prose += capacityStr;
  }

  // Add floor if present
  if (basket.floor) {
    const floorStr = expressionToString(basket.floor);
    prose += ` (but in no event less than ${floorStr})`;
  }

  prose += ' in the aggregate outstanding at any time';

  // Add subject to conditions
  if (basket.subjectTo && basket.subjectTo.length > 0) {
    prose += `; provided that, at the time of making any such investment `;
    prose += `and after giving pro forma effect thereto, `;
    prose += basket.subjectTo.join(' and ');
  }

  prose += '.';

  return prose;
}

// =============================================================================
// DEFINITION TEMPLATE
// =============================================================================

export function renderDefinitionToWord(
  definition: DefineStatement,
  context?: WordTemplateContext
): string {
  const exprStr = expressionToString(definition.expression) || '';

  // Definitions previously carried no section token at all, so the drift and
  // round-trip parsers — which key on a leading (a) or 7.11 marker — skipped
  // them entirely and edits to a definition in Word were invisible.
  const subsection = context?.subsectionLabel ? `${context.subsectionLabel} ` : '';

  let prose = `${subsection}"${definition.name}" means `;
  prose += exprStr;

  // Add modifiers
  if (definition.modifiers) {
    if (definition.modifiers.excluding && definition.modifiers.excluding.length > 0) {
      prose += `, excluding ${definition.modifiers.excluding.join(', ')}`;
    }
    if (definition.modifiers.cap) {
      const capValue = expressionToString(definition.modifiers.cap);
      prose += `, capped at ${capValue}`;
    }
  }

  prose += '.';

  return prose;
}

// =============================================================================
// CONDITION TEMPLATE
// =============================================================================

export function renderConditionToWord(
  condition: ConditionStatement,
  _context?: WordTemplateContext
): string {
  const exprStr = expressionToString(condition.expression) || '';

  let prose = `"${condition.name}" shall mean the satisfaction of the following condition: `;
  prose += exprStr;
  prose += '.';

  return prose;
}

// =============================================================================
// PHASE TEMPLATE
// =============================================================================

export function renderPhaseToWord(
  phase: PhaseStatement,
  context?: WordTemplateContext
): string {
  const sectionRef = context?.sectionPrefix || '5.01';

  let prose = `(${phase.name}) The "${phase.name}" shall commence `;

  if (phase.from) {
    prose += `on ${phase.from} `;
  } else {
    prose += `on the Closing Date `;
  }

  if (phase.until) {
    prose += `and continue until ${phase.until}`;
  }

  prose += '. ';

  if (phase.covenantsSuspended.length > 0) {
    prose += `During the ${phase.name}, the following covenants shall be suspended: `;
    prose += phase.covenantsSuspended.join(', ');
    prose += '. ';
  }

  if (phase.covenantsActive.length > 0) {
    prose += `During the ${phase.name}, the following covenants shall apply: `;
    prose += phase.covenantsActive.join(', ');
    prose += '. ';
  }

  if (phase.requiredCovenants && phase.requiredCovenants.length > 0) {
    prose += `Required covenants: ${phase.requiredCovenants.join(', ')}. `;
    prose += `See Section ${sectionRef} for requirements applicable during this phase.`;
  }

  return prose.trim();
}

// =============================================================================
// MILESTONE TEMPLATE
// =============================================================================

export function renderMilestoneToWord(
  milestone: MilestoneStatement,
  context?: WordTemplateContext
): string {
  // sectionRef available: context?.sectionPrefix || '6.01'
  const subsection = context?.subsectionLabel || '';

  let prose = `${subsection ? `${subsection} ` : ''}${milestone.name}. `;
  prose += `The Borrower shall achieve ${milestone.name} `;

  if (milestone.targetDate) {
    prose += `on or before ${milestone.targetDate} (the "Target Date")`;
  }

  if (milestone.longstopDate) {
    prose += `, with a longstop date of ${milestone.longstopDate}`;
  }

  prose += '. ';

  if (milestone.triggers && milestone.triggers.length > 0) {
    prose += `Upon achievement of ${milestone.name}, the following shall be triggered: `;
    prose += milestone.triggers.join(', ');
    prose += '. ';
  }

  if (milestone.requires) {
    prose += `This milestone requires: ${JSON.stringify(milestone.requires)}. `;
  }

  return prose.trim();
}

// =============================================================================
// RESERVE TEMPLATE
// =============================================================================

// =============================================================================
// FACILITY TEMPLATE
// =============================================================================

/** How each tranche type is described in agreement prose. */
const TRANCHE_TYPE_PROSE: Record<TrancheType, string> = {
  revolving_credit: 'revolving credit facility',
  term_loan_a: 'term loan A facility',
  term_loan_b: 'term loan B facility',
  delayed_draw: 'delayed draw term loan facility',
  bridge_loan: 'bridge facility',
  asset_based_loan: 'asset-based revolving facility',
};

/**
 * Render a rate expression as prose: "3.25% per annum".
 *
 * Rates are shown to two decimals because that is how they are papered — a
 * margin drafted as 5.00% should not render as "5%".
 */
function formatRateProse(expr: Expression | null): string | null {
  if (!expr) return null;
  const str = expressionToString(expr);
  if (!str) return null;

  const percentage = str.match(/^(\d+(?:\.\d+)?)%$/);
  if (percentage?.[1]) {
    return `${Number(percentage[1]).toFixed(2)}% per annum`;
  }
  return str;
}

/** Render an ISO date the way an agreement writes it: "June 30, 2030". */
function formatDateProse(iso: string | null): string | null {
  if (!iso) return null;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const month = months[Number(match[2]) - 1];
  if (!month) return iso;

  return `${month} ${Number(match[3])}, ${match[1]}`;
}

/**
 * Render a facility to Article 2 ("The Credits") prose.
 *
 * Each tranche becomes a lettered commitment paragraph naming its type,
 * amount, pricing and maturity — the structure a credit agreement actually
 * uses — followed by an aggregate sentence. Without this the facility would be
 * invisible in generated documents and in the negotiation redline, so a
 * commitment change would render as no change at all.
 */
export function renderFacilityToWord(
  facility: FacilityStatement,
  context?: WordTemplateContext
): string {
  const subsection = context?.subsectionLabel || '';
  const benchmarkStr = formatRateProse(facility.benchmark);

  let prose = `${subsection ? `${subsection} ` : ''}${facility.name}. `;
  prose += `Subject to the terms and conditions set forth herein, the Lenders `;
  prose += `severally agree to make available to the Borrower the credit facilities `;
  prose += `described below`;
  prose += benchmarkStr
    ? `, each bearing interest at ${benchmarkStr} plus the applicable margin `
      + `specified for such facility.`
    : `.`;

  for (const tranche of facility.tranches) {
    const commitment = expressionToString(tranche.commitment);
    const margin = formatRateProse(tranche.margin);

    prose += ` ${tranche.name}: a ${TRANCHE_TYPE_PROSE[tranche.trancheType]}`;
    if (commitment) {
      prose += ` in an aggregate principal amount of ${commitment}`;
    }
    if (margin) {
      prose += `, bearing an applicable margin of ${margin}`;
    }
    const maturity = formatDateProse(tranche.maturity);
    if (maturity) {
      prose += `, maturing ${maturity}`;
    }
    prose += '.';

    const amortization = tranche.amortization
      ? expressionToString(tranche.amortization)
      : null;
    if (amortization) {
      prose += ` The ${tranche.name} shall amortize in equal quarterly `;
      prose += `installments in an aggregate annual amount equal to ${amortization} `;
      prose += `of the original principal amount thereof.`;
    }

    const sublimit = tranche.lcSublimit ? expressionToString(tranche.lcSublimit) : null;
    if (sublimit) {
      prose += ` Letters of credit may be issued under the ${tranche.name} in an `;
      prose += `aggregate face amount not to exceed ${sublimit} at any time outstanding.`;
    }
  }

  const nettingCap = facility.cashNettingCap
    ? expressionToString(facility.cashNettingCap)
    : null;
  if (nettingCap) {
    prose += ` For purposes of calculating net leverage, unrestricted cash and `;
    prose += `cash equivalents may be netted against outstanding indebtedness in an `;
    prose += `aggregate amount not to exceed ${nettingCap}.`;
  }

  return prose;
}

export function renderReserveToWord(
  reserve: ReserveStatement,
  context?: WordTemplateContext
): string {
  // sectionRef available: context?.sectionPrefix || '9.01'
  const subsection = context?.subsectionLabel || '';

  const targetStr = expressionToString(reserve.target) || '';
  const minimumStr = reserve.minimum ? expressionToString(reserve.minimum) : null;

  let prose = `${subsection ? `${subsection} ` : ''}${reserve.name}. `;
  prose += `The Borrower shall maintain a ${reserve.name} in an amount `;
  prose += `equal to ${targetStr}`;

  if (minimumStr) {
    prose += ` (with a minimum balance of ${minimumStr})`;
  }

  prose += '. ';

  if (reserve.fundedBy && reserve.fundedBy.length > 0) {
    prose += `The ${reserve.name} shall be funded by `;
    prose += reserve.fundedBy.join(', ');
    prose += '. ';
  }

  if (reserve.releasedTo) {
    prose += `Amounts in the ${reserve.name} may be released to ${reserve.releasedTo}`;
    if (reserve.releasedFor) {
      prose += ` for ${reserve.releasedFor}`;
    }
    prose += '. ';
  }

  return prose.trim();
}

// =============================================================================
// WATERFALL TEMPLATE
// =============================================================================

export function renderWaterfallToWord(
  waterfall: WaterfallStatement,
  _context?: WordTemplateContext
): string {
  // sectionRef available: _context?.sectionPrefix || '10.01'

  let prose = `${waterfall.name}. `;
  prose += `On each ${formatFrequency(waterfall.frequency)} Payment Date, `;
  prose += `Available Cash shall be applied in the following order of priority:\n\n`;

  for (let i = 0; i < waterfall.tiers.length; i++) {
    const tier = waterfall.tiers[i];
    if (!tier) continue;

    const tierNum = romanNumeral(i + 1);
    prose += `(${tierNum}) `;

    // Build tier description from properties
    prose += `pay `;

    if (tier.payAmount) {
      const amountStr = expressionToString(tier.payAmount);
      prose += amountStr ? `${amountStr} ` : '';
    }

    if (tier.payTo) {
      prose += `to the ${tier.payTo}`;
    } else if (tier.name) {
      prose += `to ${tier.name}`;
    }

    if (tier.from) {
      prose += ` from ${tier.from}`;
    }

    if (tier.until) {
      const untilStr = expressionToString(tier.until);
      prose += ` until ${untilStr}`;
    }

    if (tier.condition) {
      const condStr = expressionToString(tier.condition);
      prose += `, provided that ${condStr}`;
    }

    if (tier.shortfall) {
      prose += ` (shortfall from: ${tier.shortfall})`;
    }

    prose += ';\n';
  }

  return prose.trim();
}

/**
 * Convert number to Roman numeral.
 */
function romanNumeral(num: number): string {
  const numerals: Array<[number, string]> = [
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i'],
  ];

  let result = '';
  let remaining = num;

  for (const [value, symbol] of numerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }

  return result;
}

// =============================================================================
// CONDITIONS PRECEDENT TEMPLATE
// =============================================================================

export function renderConditionsPrecedentToWord(
  cp: ConditionsPrecedentStatement,
  context?: WordTemplateContext
): string {
  const sectionRef = context?.sectionPrefix || '4.01';

  let prose = `Section ${sectionRef}. ${cp.name}.\n\n`;
  prose += `The obligation of the Lenders to make the initial Credit Extension `;
  prose += `hereunder is subject to the satisfaction (or waiver) of each of the `;
  prose += `following conditions precedent:\n\n`;

  for (const item of cp.conditions) {
    const desc = item.description || item.name;
    prose += `(${item.name}) ${desc}`;
    if (item.responsible) {
      prose += ` [Responsible Party: ${item.responsible}]`;
    }
    prose += '.\n\n';
  }

  return prose.trim();
}

// =============================================================================
// TEMPLATE REGISTRY
// =============================================================================

export const wordTemplates: Map<string, WordTemplate> = new Map([
  [
    'covenant',
    {
      id: 'covenant',
      elementType: 'Covenant',
      render: (element, context) =>
        renderCovenantToWord(element as CovenantStatement, context),
    },
  ],
  [
    'basket',
    {
      id: 'basket',
      elementType: 'Basket',
      render: (element, context) =>
        renderBasketToWord(element as BasketStatement, context),
    },
  ],
  [
    'definition',
    {
      id: 'definition',
      elementType: 'Define',
      render: (element, context) =>
        renderDefinitionToWord(element as DefineStatement, context),
    },
  ],
  [
    'condition',
    {
      id: 'condition',
      elementType: 'Condition',
      render: (element, context) =>
        renderConditionToWord(element as ConditionStatement, context),
    },
  ],
  [
    'phase',
    {
      id: 'phase',
      elementType: 'Phase',
      render: (element, context) =>
        renderPhaseToWord(element as PhaseStatement, context),
    },
  ],
  [
    'milestone',
    {
      id: 'milestone',
      elementType: 'Milestone',
      render: (element, context) =>
        renderMilestoneToWord(element as MilestoneStatement, context),
    },
  ],
  [
    'facility',
    {
      id: 'facility',
      elementType: 'Facility',
      render: (element, context) =>
        renderFacilityToWord(element as FacilityStatement, context),
    },
  ],
  [
    'reserve',
    {
      id: 'reserve',
      elementType: 'Reserve',
      render: (element, context) =>
        renderReserveToWord(element as ReserveStatement, context),
    },
  ],
  [
    'waterfall',
    {
      id: 'waterfall',
      elementType: 'Waterfall',
      render: (element, context) =>
        renderWaterfallToWord(element as WaterfallStatement, context),
    },
  ],
  [
    'cp',
    {
      id: 'cp',
      elementType: 'ConditionsPrecedent',
      render: (element, context) =>
        renderConditionsPrecedentToWord(element as ConditionsPrecedentStatement, context),
    },
  ],
]);

/**
 * Get a template by element type.
 */
export function getTemplate(elementType: string): WordTemplate | undefined {
  return wordTemplates.get(elementType.toLowerCase());
}

/**
 * Render any statement to Word prose.
 */
export function renderStatementToWord(
  statement: unknown,
  context?: WordTemplateContext
): string {
  if (!statement || typeof statement !== 'object') {
    return '';
  }

  const typed = statement as { type?: string };
  if (!typed.type) {
    return '';
  }

  const template = getTemplate(typed.type);
  if (template) {
    return template.render(statement, context);
  }

  // Fallback for unknown types
  return JSON.stringify(statement);
}
