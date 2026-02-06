/**
 * ProViso Hub v2.0 — Form Output Generator
 *
 * Generates ProViso code and Word prose from form values.
 */

import type { FormDefinition, FormOutput } from './types.js';
import { renderTemplate, createTemplateContext } from './templates.js';
import {
  getCovenantMetricDisplay,
  getOperatorDisplay,
  getFrequencyDisplay,
  getCategoryDisplay,
  getCategoryActionDisplay,
  getSubjectToDisplay,
  getBasketMetricDisplay,
} from './definitions/index.js';
import { enrichTemplateValues } from './templates/index.js';

/**
 * Generate ProViso code and Word prose from form values.
 */
export function generateFormOutput(
  formDef: FormDefinition,
  values: Record<string, unknown>,
  deal?: { name: string; facilityAmount: number; currency: string }
): FormOutput {
  // Enrich values with display names
  const enrichedValues = enrichValuesForTemplates(formDef, values);

  // Create template context
  const context = createTemplateContext(enrichedValues, deal);

  // Render templates
  const code = renderTemplate(formDef.codeTemplate, context);
  const wordProse = renderTemplate(formDef.wordTemplate, context);

  // Extract element name
  const elementName = (values.name as string) || 'Unknown';
  const sectionReference = (values.sectionRef as string) || null;

  return {
    code,
    wordProse,
    elementType: formDef.elementType,
    elementName,
    sectionReference,
  };
}

/**
 * Enrich form values with display names for Word templates.
 */
function enrichValuesForTemplates(
  formDef: FormDefinition,
  values: Record<string, unknown>
): Record<string, unknown> {
  const enriched = { ...values };

  // Add display names based on form type
  switch (formDef.id) {
    case 'covenant-simple':
      enriched.metricDisplay = getCovenantMetricDisplay(values.metric as string);
      enriched.operatorDisplay = getOperatorDisplay(values.operator as string);
      enriched.frequencyDisplay = getFrequencyDisplay(values.frequency as string);
      break;

    case 'basket-fixed':
      enriched.categoryDisplay = getCategoryDisplay(values.category as string);
      enriched.categoryActionDisplay = getCategoryActionDisplay(values.category as string);
      if (values.hasSubjectTo && values.subjectToCondition) {
        enriched.subjectToDisplay = getSubjectToDisplay(values.subjectToCondition as string);
      }
      break;

    case 'basket-grower':
      enriched.categoryDisplay = getCategoryDisplay(values.category as string);
      enriched.categoryActionDisplay = getCategoryActionDisplay(values.category as string);
      enriched.metricDisplay = getBasketMetricDisplay(values.metric as string);
      if (values.hasSubjectTo && values.subjectToCondition) {
        enriched.subjectToDisplay = getSubjectToDisplay(values.subjectToCondition as string);
      }
      break;

    default:
      // Handle deal template enrichment for template-* forms
      if (formDef.id.startsWith('template-')) {
        const templateEnriched = enrichTemplateValues(formDef.id, values);
        Object.assign(enriched, templateEnriched);
      }
      break;
  }

  return enriched;
}

/**
 * Validate form values against field definitions and validation rules.
 */
export function validateFormValues(
  formDef: FormDefinition,
  values: Record<string, unknown>
): { isValid: boolean; errors: Record<string, string>; formErrors: string[] } {
  const errors: Record<string, string> = {};
  const formErrors: string[] = [];

  // Validate each field
  for (const field of formDef.fields) {
    // Check if field should be visible
    if (field.showWhen && !evaluateCondition(field.showWhen, values)) {
      continue;
    }

    const value = values[field.name];

    // Check required
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    // Skip validation if no value and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Field-level validation
    if (field.validation) {
      const validation = field.validation;

      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          errors[field.name] = `${field.label} must be at least ${validation.min}`;
        }
        if (validation.max !== undefined && value > validation.max) {
          errors[field.name] = `${field.label} must be at most ${validation.max}`;
        }
      }

      if (typeof value === 'string') {
        if (validation.minLength !== undefined && value.length < validation.minLength) {
          errors[field.name] = `${field.label} must be at least ${validation.minLength} characters`;
        }
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
          errors[field.name] = `${field.label} must be at most ${validation.maxLength} characters`;
        }
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            errors[field.name] = validation.patternMessage || `${field.label} has an invalid format`;
          }
        }
      }

      if (validation.custom) {
        const customError = validation.custom(value, values);
        if (customError) {
          errors[field.name] = customError;
        }
      }
    }
  }

  // Run cross-field validation rules
  for (const rule of formDef.validationRules) {
    const error = rule.validate(values);
    if (error) {
      formErrors.push(error);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0 && formErrors.length === 0,
    errors,
    formErrors,
  };
}

/**
 * Evaluate a conditional rule against form values.
 */
function evaluateCondition(
  rule: { field: string; operator: string; value?: unknown },
  values: Record<string, unknown>
): boolean {
  const fieldValue = values[rule.field];

  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;
    case 'not_equals':
      return fieldValue !== rule.value;
    case 'greater_than':
      return typeof fieldValue === 'number' && fieldValue > (rule.value as number);
    case 'less_than':
      return typeof fieldValue === 'number' && fieldValue < (rule.value as number);
    case 'contains':
      return (
        typeof fieldValue === 'string' &&
        typeof rule.value === 'string' &&
        fieldValue.includes(rule.value)
      );
    case 'is_set':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    default:
      return false;
  }
}

/**
 * Get default values for a form definition.
 */
export function getDefaultValues(formDef: FormDefinition): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const field of formDef.fields) {
    defaults[field.name] = field.defaultValue;
  }

  return defaults;
}
