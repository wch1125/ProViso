/**
 * ProViso Hub v2.0 — Change Classifier
 *
 * Analyzes element diffs to classify impact (borrower/lender favorable)
 * and generate human-readable titles and descriptions.
 */

import type { ElementDiff, FieldChange } from './differ.js';
import { expressionToString } from './differ.js';
import type { Change, ChangeImpact, ElementType } from '../types.js';
import { generateId } from '../store.js';
import type {
  CovenantStatement,
  BasketStatement,
  DefineStatement,
  Expression,
} from '../../types.js';

// =============================================================================
// CLASSIFIED CHANGE
// =============================================================================

/**
 * A fully classified change ready for display.
 */
export interface ClassifiedChange extends Change {
  /** The underlying diff */
  diff: ElementDiff;
}

// =============================================================================
// CHANGE CLASSIFICATION
// =============================================================================

/**
 * Classify a single diff into a fully-formed Change object.
 */
export function classifyChange(diff: ElementDiff, sectionReference?: string): ClassifiedChange {
  const impact = classifyImpact(diff);
  const { title, description } = generateTitleAndDescription(diff);
  const { beforeValue, afterValue, beforeCode, afterCode } = extractValues(diff);

  return {
    id: generateId(),
    changeType: diff.changeType,
    elementType: diff.elementType,
    sectionReference: sectionReference ?? getSectionReference(diff.elementType),
    elementName: diff.elementName,
    title,
    description,
    rationale: null,
    beforeCode,
    afterCode,
    beforeValue,
    afterValue,
    impact,
    impactDescription: generateImpactDescription(diff, impact),
    sourceForm: guessSourceForm(diff),
    isManualEdit: false,
    diff,
  };
}

/**
 * Classify the impact of a change.
 * Heuristics:
 * - Threshold increases on max covenants = borrower favorable
 * - Threshold decreases on max covenants = lender favorable
 * - Threshold increases on min covenants = lender favorable
 * - Threshold decreases on min covenants = borrower favorable
 * - Basket capacity increases = borrower favorable
 * - Basket capacity decreases = lender favorable
 * - Adding cure rights = borrower favorable
 * - Removing cure rights = lender favorable
 */
export function classifyImpact(diff: ElementDiff): ChangeImpact {
  if (diff.changeType === 'added') {
    return classifyAddedImpact(diff);
  }

  if (diff.changeType === 'removed') {
    return classifyRemovedImpact(diff);
  }

  // Modified - look at field changes
  return classifyModifiedImpact(diff);
}

/**
 * Classify impact for added elements.
 */
function classifyAddedImpact(diff: ElementDiff): ChangeImpact {
  switch (diff.elementType) {
    case 'covenant':
      // Adding a covenant is generally lender favorable
      return 'lender_favorable';
    case 'basket':
      // Adding a basket is generally borrower favorable
      return 'borrower_favorable';
    case 'definition':
      // Adding a definition is neutral (depends on usage)
      return 'neutral';
    default:
      return 'neutral';
  }
}

/**
 * Classify impact for removed elements.
 */
function classifyRemovedImpact(diff: ElementDiff): ChangeImpact {
  switch (diff.elementType) {
    case 'covenant':
      // Removing a covenant is borrower favorable
      return 'borrower_favorable';
    case 'basket':
      // Removing a basket is lender favorable
      return 'lender_favorable';
    default:
      return 'neutral';
  }
}

/**
 * Classify impact for modified elements.
 */
function classifyModifiedImpact(diff: ElementDiff): ChangeImpact {
  if (diff.elementType === 'covenant') {
    return classifyCovenantModification(diff);
  }

  if (diff.elementType === 'basket') {
    return classifyBasketModification(diff);
  }

  if (diff.elementType === 'definition') {
    return classifyDefinitionModification(diff);
  }

  return 'neutral';
}

/**
 * Classify covenant modification impact.
 */
function classifyCovenantModification(diff: ElementDiff): ChangeImpact {
  const from = diff.fromElement as CovenantStatement | null;
  const to = diff.toElement as CovenantStatement | null;

  if (!from || !to) return 'unclear';

  // Check for cure right changes
  const cureChange = diff.fieldChanges.find((fc) => fc.field === 'cure');
  if (cureChange) {
    if (cureChange.fromValue === null && cureChange.toValue !== null) {
      return 'borrower_favorable'; // Added cure
    }
    if (cureChange.fromValue !== null && cureChange.toValue === null) {
      return 'lender_favorable'; // Removed cure
    }
  }

  // Check for threshold changes
  const requiresChange = diff.fieldChanges.find((fc) => fc.field === 'requires');
  if (requiresChange) {
    const fromThreshold = extractThreshold(from.requires);
    const toThreshold = extractThreshold(to.requires);
    const operator = extractOperator(from.requires);

    if (fromThreshold !== null && toThreshold !== null && operator) {
      // For <= (max covenants), higher threshold = borrower favorable
      if (operator === '<=') {
        if (toThreshold > fromThreshold) return 'borrower_favorable';
        if (toThreshold < fromThreshold) return 'lender_favorable';
      }
      // For >= (min covenants), lower threshold = borrower favorable
      if (operator === '>=') {
        if (toThreshold < fromThreshold) return 'borrower_favorable';
        if (toThreshold > fromThreshold) return 'lender_favorable';
      }
    }
  }

  return 'neutral';
}

/**
 * Classify basket modification impact.
 */
function classifyBasketModification(diff: ElementDiff): ChangeImpact {
  const from = diff.fromElement as BasketStatement | null;
  const to = diff.toElement as BasketStatement | null;

  if (!from || !to) return 'unclear';

  // Check capacity changes
  const capacityChange = diff.fieldChanges.find((fc) => fc.field === 'capacity');
  if (capacityChange) {
    const fromCap = extractNumericValue(from.capacity);
    const toCap = extractNumericValue(to.capacity);

    if (fromCap !== null && toCap !== null) {
      if (toCap > fromCap) return 'borrower_favorable';
      if (toCap < fromCap) return 'lender_favorable';
    }
  }

  // Check floor changes (higher floor = borrower favorable)
  const floorChange = diff.fieldChanges.find((fc) => fc.field === 'floor');
  if (floorChange) {
    const fromFloor = extractNumericValue(from.floor);
    const toFloor = extractNumericValue(to.floor);

    if (fromFloor !== null && toFloor !== null) {
      if (toFloor > fromFloor) return 'borrower_favorable';
      if (toFloor < fromFloor) return 'lender_favorable';
    }
    // Added floor where there was none
    if (fromFloor === null && toFloor !== null) return 'borrower_favorable';
  }

  // Check maximum changes (higher max = borrower favorable)
  const maxChange = diff.fieldChanges.find((fc) => fc.field === 'maximum');
  if (maxChange) {
    const fromMax = extractNumericValue(from.maximum);
    const toMax = extractNumericValue(to.maximum);

    if (fromMax !== null && toMax !== null) {
      if (toMax > fromMax) return 'borrower_favorable';
      if (toMax < fromMax) return 'lender_favorable';
    }
  }

  return 'neutral';
}

/**
 * Classify definition modification impact.
 */
function classifyDefinitionModification(_diff: ElementDiff): ChangeImpact {
  // Definition changes are hard to classify automatically
  // Would need semantic understanding of how the definition is used
  // For now, return neutral
  return 'neutral';
}

// =============================================================================
// TITLE AND DESCRIPTION GENERATION
// =============================================================================

/**
 * Generate human-readable title and description for a change.
 */
export function generateTitleAndDescription(diff: ElementDiff): { title: string; description: string } {
  const elementLabel = getElementTypeLabel(diff.elementType);

  if (diff.changeType === 'added') {
    return {
      title: `${elementLabel} added`,
      description: `Added ${elementLabel.toLowerCase()} "${diff.elementName}"`,
    };
  }

  if (diff.changeType === 'removed') {
    return {
      title: `${elementLabel} removed`,
      description: `Removed ${elementLabel.toLowerCase()} "${diff.elementName}"`,
    };
  }

  // Modified - describe the specific changes
  const fieldDescriptions = diff.fieldChanges.map((fc) => describeFieldChange(fc, diff));
  const mainChange = fieldDescriptions[0] || `${elementLabel} updated`;

  return {
    title: mainChange,
    description:
      fieldDescriptions.length > 1
        ? fieldDescriptions.join('; ')
        : `Modified ${elementLabel.toLowerCase()} "${diff.elementName}"`,
  };
}

/**
 * Describe a specific field change.
 */
function describeFieldChange(fc: FieldChange, _diff: ElementDiff): string {
  switch (fc.field) {
    case 'requires':
      return 'Threshold changed';
    case 'capacity':
      return 'Capacity changed';
    case 'cure':
      if (fc.fromValue === null) return 'Cure rights added';
      if (fc.toValue === null) return 'Cure rights removed';
      return 'Cure rights modified';
    case 'floor':
      if (fc.fromValue === null) return 'Floor added';
      return 'Floor changed';
    case 'tested':
      return `Testing frequency changed`;
    case 'expression':
      return 'Expression changed';
    case 'modifiers':
      return 'Modifiers changed';
    case 'targetDate':
      return 'Target date changed';
    case 'longstopDate':
      return 'Longstop date changed';
    default:
      return `${fc.field} changed`;
  }
}

/**
 * Generate impact description.
 */
export function generateImpactDescription(diff: ElementDiff, impact: ChangeImpact): string | null {
  if (impact === 'neutral' || impact === 'unclear') return null;

  const direction = impact === 'borrower_favorable' ? 'increased' : 'decreased';

  if (diff.elementType === 'covenant') {
    const requiresChange = diff.fieldChanges.find((fc) => fc.field === 'requires');
    if (requiresChange && requiresChange.fromValue && requiresChange.toValue) {
      return `Covenant ${direction === 'increased' ? 'loosened' : 'tightened'}`;
    }

    const cureChange = diff.fieldChanges.find((fc) => fc.field === 'cure');
    if (cureChange) {
      if (cureChange.fromValue === null) return 'Provides cure rights for covenant breaches';
      if (cureChange.toValue === null) return 'Removes cure rights protection';
    }
  }

  if (diff.elementType === 'basket') {
    const capacityChange = diff.fieldChanges.find((fc) => fc.field === 'capacity');
    if (capacityChange) {
      return `Capacity ${direction}`;
    }
  }

  return null;
}

// =============================================================================
// VALUE EXTRACTION
// =============================================================================

/**
 * Extract before/after values and code from a diff.
 */
function extractValues(diff: ElementDiff): {
  beforeValue: string | null;
  afterValue: string | null;
  beforeCode: string | null;
  afterCode: string | null;
} {
  if (diff.changeType === 'added') {
    return {
      beforeValue: null,
      afterValue: formatElementSummary(diff.toElement),
      beforeCode: null,
      afterCode: formatElementCode(diff.toElement),
    };
  }

  if (diff.changeType === 'removed') {
    return {
      beforeValue: formatElementSummary(diff.fromElement),
      afterValue: null,
      beforeCode: formatElementCode(diff.fromElement),
      afterCode: null,
    };
  }

  // Modified - show the changed values
  const mainChange = diff.fieldChanges[0];
  if (mainChange) {
    return {
      beforeValue: mainChange.fromValue,
      afterValue: mainChange.toValue,
      beforeCode: formatElementCode(diff.fromElement),
      afterCode: formatElementCode(diff.toElement),
    };
  }

  return {
    beforeValue: null,
    afterValue: null,
    beforeCode: null,
    afterCode: null,
  };
}

/**
 * Format a brief summary of an element.
 */
function formatElementSummary(element: unknown): string | null {
  if (!element || typeof element !== 'object') return null;

  const stmt = element as { type?: string };
  switch (stmt.type) {
    case 'Covenant': {
      const cov = element as CovenantStatement;
      return expressionToString(cov.requires);
    }
    case 'Basket': {
      const bsk = element as BasketStatement;
      return expressionToString(bsk.capacity);
    }
    case 'Define': {
      const def = element as DefineStatement;
      return expressionToString(def.expression);
    }
    default:
      return null;
  }
}

/**
 * Format element code (simplified reconstruction).
 */
function formatElementCode(element: unknown): string | null {
  if (!element || typeof element !== 'object') return null;

  const stmt = element as { type?: string; name?: string };
  switch (stmt.type) {
    case 'Covenant': {
      const cov = element as CovenantStatement;
      let code = `COVENANT ${cov.name}`;
      if (cov.requires) code += `\n  REQUIRES ${expressionToString(cov.requires)}`;
      if (cov.tested) code += `\n  TESTED ${cov.tested}`;
      return code;
    }
    case 'Basket': {
      const bsk = element as BasketStatement;
      let code = `BASKET ${bsk.name}`;
      if (bsk.capacity) code += `\n  CAPACITY ${expressionToString(bsk.capacity)}`;
      if (bsk.floor) code += `\n  FLOOR ${expressionToString(bsk.floor)}`;
      return code;
    }
    case 'Define': {
      const def = element as DefineStatement;
      return `DEFINE ${def.name} AS ${expressionToString(def.expression)}`;
    }
    default:
      return null;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract threshold value from a comparison expression.
 */
function extractThreshold(expr: Expression | null): number | null {
  if (!expr || typeof expr !== 'object') return null;

  if ('type' in expr && expr.type === 'Comparison') {
    return extractNumericValue(expr.right);
  }

  return null;
}

/**
 * Extract operator from a comparison expression.
 */
function extractOperator(expr: Expression | null): string | null {
  if (!expr || typeof expr !== 'object') return null;

  if ('type' in expr && expr.type === 'Comparison') {
    return expr.operator;
  }

  return null;
}

/**
 * Extract numeric value from an expression.
 */
function extractNumericValue(expr: Expression | null | undefined): number | null {
  if (expr === null || expr === undefined) return null;

  if (typeof expr === 'number') return expr;

  if (typeof expr === 'object' && 'type' in expr) {
    switch (expr.type) {
      case 'Number':
      case 'Currency':
      case 'Percentage':
      case 'Ratio':
        return expr.value;
      case 'FunctionCall':
        // For GreaterOf, try to extract the first argument
        if (expr.name === 'GreaterOf' && expr.arguments.length > 0) {
          return extractNumericValue(expr.arguments[0]);
        }
        break;
    }
  }

  return null;
}

/**
 * Get label for element type.
 */
function getElementTypeLabel(type: ElementType): string {
  const labels: Record<ElementType, string> = {
    covenant: 'Covenant',
    basket: 'Basket',
    definition: 'Definition',
    condition: 'Condition',
    phase: 'Phase',
    milestone: 'Milestone',
    reserve: 'Reserve',
    waterfall: 'Waterfall',
    cp: 'Condition Precedent',
    other: 'Element',
  };
  return labels[type];
}

/**
 * Get default section reference for element type.
 */
function getSectionReference(type: ElementType): string {
  const refs: Record<ElementType, string> = {
    definition: '1.01',
    covenant: '7.11',
    basket: '7.02',
    condition: '7.00',
    phase: '6.00',
    milestone: '6.01',
    reserve: '6.02',
    waterfall: '6.03',
    cp: '4.01',
    other: '',
  };
  return refs[type];
}

/**
 * Guess the source form based on element type and changes.
 */
function guessSourceForm(diff: ElementDiff): string | null {
  switch (diff.elementType) {
    case 'covenant':
      if (diff.fieldChanges.some((fc) => fc.field === 'cure')) return 'covenant-cure';
      return 'covenant-simple';
    case 'basket': {
      const bsk = (diff.toElement || diff.fromElement) as BasketStatement | null;
      if (bsk?.floor) return 'basket-grower';
      if (bsk?.buildsFrom) return 'basket-builder';
      return 'basket-fixed';
    }
    case 'definition':
      return 'definition-simple';
    default:
      return null;
  }
}
