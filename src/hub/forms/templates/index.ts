/**
 * ProViso Hub — Deal Template Registry
 *
 * Registry of all available deal templates. Deal templates are higher-level
 * than element forms — they generate complete .proviso files with all
 * DEFINEs, COVENANTs, BASKETs, CONDITIONs, and EVENTs for a given deal type.
 */

import type { DealTemplate, DealTemplateIndustry } from '../types.js';
import { renderTemplate, createTemplateContext } from '../templates.js';
import { corporateRevolverTemplate } from './corporate-revolver.js';
import { termLoanBTemplate } from './term-loan-b.js';
import { projectFinanceTemplate } from './project-finance.js';
import { realEstateTemplate } from './real-estate.js';

// =============================================================================
// TEMPLATE EXPORTS
// =============================================================================

export { corporateRevolverTemplate } from './corporate-revolver.js';
export { termLoanBTemplate } from './term-loan-b.js';
export { projectFinanceTemplate } from './project-finance.js';
export { realEstateTemplate } from './real-estate.js';

// =============================================================================
// REGISTRY
// =============================================================================

/**
 * All available deal templates.
 */
export const dealTemplates: DealTemplate[] = [
  corporateRevolverTemplate,
  termLoanBTemplate,
  projectFinanceTemplate,
  realEstateTemplate,
];

/**
 * Deal templates indexed by ID.
 */
export const dealTemplatesById: Map<string, DealTemplate> = new Map(
  dealTemplates.map((t) => [t.id, t])
);

/**
 * Get a deal template by ID.
 */
export function getDealTemplate(id: string): DealTemplate | undefined {
  return dealTemplatesById.get(id);
}

/**
 * Get deal templates by industry.
 */
export function getDealTemplatesByIndustry(industry: DealTemplateIndustry): DealTemplate[] {
  return dealTemplates.filter((t) => t.industry === industry);
}

/**
 * Get deal templates by complexity.
 */
export function getDealTemplatesByComplexity(
  complexity: 'starter' | 'standard' | 'advanced'
): DealTemplate[] {
  return dealTemplates.filter((t) => t.complexity === complexity);
}

// =============================================================================
// TEMPLATE VALUE ENRICHMENT
// =============================================================================

/**
 * Enrich template form values with computed fields needed by code templates.
 *
 * Some templates need derived values — e.g., converting a percentage (65)
 * to a decimal (0.65) for use in covenant expressions, or computing a
 * threshold from user-provided values.
 */
export function enrichTemplateValues(
  templateId: string,
  values: Record<string, unknown>
): Record<string, unknown> {
  const enriched = { ...values };

  switch (templateId) {
    case 'template-real-estate':
      // Convert percentages to decimals for covenant expressions
      if (typeof values.maxLTV === 'number') {
        enriched.maxLTVDecimal = (values.maxLTV as number / 100).toFixed(2);
      }
      if (typeof values.minDebtYield === 'number') {
        enriched.minDebtYieldDecimal = (values.minDebtYield as number / 100).toFixed(2);
      }
      if (typeof values.maxTenantConcentration === 'number') {
        enriched.maxTenantConcentrationDecimal = (values.maxTenantConcentration as number / 100).toFixed(2);
      }
      if (typeof values.minOccupancy === 'number') {
        enriched.minOccupancyDecimal = (values.minOccupancy as number / 100).toFixed(2);
        // Occupancy default trigger is typically 10% below the covenant level
        enriched.occupancyDefaultDecimal = ((values.minOccupancy as number - 10) / 100).toFixed(2);
      }
      break;

    case 'template-term-loan-b':
      // Convert change of control trigger to a numeric threshold
      if (values.changeOfControlTrigger === 'majority') {
        enriched.changeOfControlThresholdValue = 50;
      } else if (values.changeOfControlTrigger === 'supermajority') {
        enriched.changeOfControlThresholdValue = 66;
      } else if (values.changeOfControlTrigger === 'board') {
        enriched.changeOfControlThresholdValue = 50;
      }
      break;

    default:
      // No enrichment needed for other templates
      break;
  }

  return enriched;
}

// =============================================================================
// TEMPLATE CODE GENERATION
// =============================================================================

/**
 * Generate ProViso code from a deal template and user-provided values.
 *
 * This is the main entry point for template-based code generation.
 * It enriches values, renders the template, and returns the complete
 * .proviso file content.
 */
export function generateFromTemplate(
  templateId: string,
  values: Record<string, unknown>
): { code: string; templateName: string } | null {
  const template = getDealTemplate(templateId);
  if (!template) {
    return null;
  }

  const enriched = enrichTemplateValues(template.form.id, values);
  const context = createTemplateContext(enriched);
  const code = renderTemplate(template.form.codeTemplate, context);

  return {
    code,
    templateName: template.name,
  };
}
