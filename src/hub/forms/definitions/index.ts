/**
 * ProViso Hub v2.0 — Form Definitions Index
 *
 * Registry of all available form definitions and deal templates.
 */

import { covenantSimpleForm } from './covenant-simple.js';
import { basketFixedForm } from './basket-fixed.js';
import { basketGrowerForm } from './basket-grower.js';
import type { FormDefinition } from '../types.js';

// Export individual forms
export { covenantSimpleForm } from './covenant-simple.js';
export { basketFixedForm } from './basket-fixed.js';
export { basketGrowerForm } from './basket-grower.js';

// Export helper functions
export {
  getMetricDisplay as getCovenantMetricDisplay,
  getOperatorDisplay,
  getFrequencyDisplay,
} from './covenant-simple.js';

export {
  getCategoryDisplay,
  getCategoryActionDisplay,
  getSubjectToDisplay,
} from './basket-fixed.js';

export { getMetricDisplay as getBasketMetricDisplay } from './basket-grower.js';

// Export deal templates
export {
  dealTemplates,
  dealTemplatesById,
  getDealTemplate,
  getDealTemplatesByIndustry,
  getDealTemplatesByComplexity,
  generateFromTemplate,
  enrichTemplateValues,
} from '../templates/index.js';

/**
 * All available form definitions (element-level).
 */
export const formDefinitions: FormDefinition[] = [
  covenantSimpleForm,
  basketFixedForm,
  basketGrowerForm,
];

/**
 * Form definitions indexed by ID.
 */
export const formDefinitionsById: Map<string, FormDefinition> = new Map(
  formDefinitions.map((form) => [form.id, form])
);

/**
 * Get a form definition by ID.
 */
export function getFormDefinition(id: string): FormDefinition | undefined {
  return formDefinitionsById.get(id);
}

/**
 * Get forms by category.
 */
export function getFormsByCategory(category: string): FormDefinition[] {
  return formDefinitions.filter((form) => form.category === category);
}

/**
 * Get forms by element type.
 */
export function getFormsByElementType(elementType: string): FormDefinition[] {
  return formDefinitions.filter((form) => form.elementType === elementType);
}
