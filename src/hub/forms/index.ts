/**
 * ProViso Hub v2.0 — Form System
 *
 * The form system enables form-based editing of credit agreement elements.
 * Forms generate both ProViso code and Word document prose.
 */

// Types
export type {
  FormDefinition,
  FormField,
  FormCategory,
  FormElementType,
  FieldType,
  FieldOption,
  ConditionalRule,
  FieldValidation,
  ValidationRule,
  FormState,
  FormOutput,
  StepDownEntry,
  TemplateContext,
} from './types.js';

// Template rendering
export {
  renderTemplate,
  createFormatHelpers,
  createTemplateContext,
  renderStepDownSchedule,
} from './templates.js';

// Form definitions
export {
  formDefinitions,
  formDefinitionsById,
  getFormDefinition,
  getFormsByCategory,
  getFormsByElementType,
  // Individual forms
  covenantSimpleForm,
  basketFixedForm,
  basketGrowerForm,
  // Helper functions
  getCovenantMetricDisplay,
  getOperatorDisplay,
  getFrequencyDisplay,
  getCategoryDisplay,
  getCategoryActionDisplay,
  getSubjectToDisplay,
  getBasketMetricDisplay,
} from './definitions/index.js';

// Form code generator
export {
  generateFormOutput,
  validateFormValues,
  getDefaultValues,
} from './generator.js';
