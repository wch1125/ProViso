/**
 * ProViso Hub v2.0 — Form System Types
 *
 * Form definitions for editing credit agreement elements.
 * Forms generate both ProViso code and Word document prose.
 */

// =============================================================================
// FORM DEFINITION
// =============================================================================

/**
 * A complete form definition for editing a credit agreement element.
 */
export interface FormDefinition {
  /** Unique identifier for the form */
  id: string;
  /** Internal name for the form */
  name: string;
  /** Display name shown in UI */
  displayName: string;
  /** Category for grouping in menus */
  category: FormCategory;
  /** What type of credit agreement element this form creates/edits */
  elementType: FormElementType;
  /** Description of what this form does */
  description: string;

  /** The fields in this form */
  fields: FormField[];
  /** Validation rules that span multiple fields */
  validationRules: ValidationRule[];

  /** Template for generating ProViso code (Handlebars-like syntax) */
  codeTemplate: string;
  /** Template for generating Word document prose */
  wordTemplate: string;
}

export type FormCategory =
  | 'covenants'
  | 'baskets'
  | 'definitions'
  | 'conditions'
  | 'events'
  | 'project_finance'
  | 'templates';

export type FormElementType =
  | 'covenant'
  | 'basket'
  | 'definition'
  | 'condition'
  | 'prohibition'
  | 'event'
  | 'phase'
  | 'milestone'
  | 'reserve'
  | 'waterfall'
  | 'cp'
  | 'template';

// =============================================================================
// DEAL TEMPLATES
// =============================================================================

/**
 * A deal template generates a complete .proviso file from user-configurable parameters.
 * Unlike element forms (which produce a single COVENANT or BASKET), deal templates
 * produce an entire credit agreement with DEFINEs, COVENANTs, BASKETs, CONDITIONs, etc.
 */
export interface DealTemplate {
  /** Unique template identifier */
  id: string;
  /** Display name shown in picker */
  name: string;
  /** Template description */
  description: string;
  /** Target industry / deal type */
  industry: DealTemplateIndustry;
  /** Complexity rating for UX */
  complexity: 'starter' | 'standard' | 'advanced';
  /** Icon name from Lucide (for UI) */
  icon: string;
  /** Key features of this template */
  features: string[];
  /** The underlying form definition that generates the code */
  form: FormDefinition;
}

export type DealTemplateIndustry =
  | 'corporate'
  | 'leveraged_finance'
  | 'project_finance'
  | 'real_estate'
  | 'infrastructure';

// =============================================================================
// FORM FIELDS
// =============================================================================

/**
 * A single field in a form.
 */
export interface FormField {
  /** Unique ID within the form */
  id: string;
  /** Field name (used in templates) */
  name: string;
  /** Label shown to user */
  label: string;
  /** Field type determines the input component */
  type: FieldType;
  /** Is this field required? */
  required: boolean;
  /** Default value */
  defaultValue: unknown;
  /** Options for select/multi-select fields */
  options: FieldOption[] | null;
  /** Help text shown below the field */
  helpText: string | null;
  /** Placeholder text */
  placeholder: string | null;
  /** Conditional display rule */
  showWhen: ConditionalRule | null;
  /** Validation rules for this field */
  validation: FieldValidation | null;
}

/**
 * Available field types.
 */
export type FieldType =
  // Basic types
  | 'text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'ratio'
  | 'date'
  // Selection types
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'radio'
  // Special types for credit agreements
  | 'expression'          // ProViso expression builder
  | 'step-down-table'     // Covenant step-down schedule
  | 'party-select'        // Select from deal parties
  | 'section-reference'   // Section number input
  | 'metric-select'       // Select from defined metrics
  | 'threshold-input';    // Threshold with operator

/**
 * An option for select/radio fields.
 */
export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Rule for conditional field display.
 */
export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_set';
  value?: unknown;
}

/**
 * Validation rules for a field.
 */
export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  custom?: (value: unknown, formValues: Record<string, unknown>) => string | null;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Cross-field validation rule.
 */
export interface ValidationRule {
  id: string;
  /** Fields involved in this rule */
  fields: string[];
  /** Validation function returning error message or null */
  validate: (values: Record<string, unknown>) => string | null;
  /** Error message if validation fails */
  message: string;
}

// =============================================================================
// FORM STATE
// =============================================================================

/**
 * State for a form instance.
 */
export interface FormState {
  /** Current field values */
  values: Record<string, unknown>;
  /** Field-level errors */
  errors: Record<string, string>;
  /** Form-level errors */
  formErrors: string[];
  /** Fields that have been touched (blurred) */
  touched: Record<string, boolean>;
  /** Is the form currently submitting? */
  isSubmitting: boolean;
  /** Has the form been modified? */
  isDirty: boolean;
  /** Is the form valid? */
  isValid: boolean;
}

// =============================================================================
// FORM OUTPUT
// =============================================================================

/**
 * Output from rendering form values with templates.
 */
export interface FormOutput {
  /** Generated ProViso code */
  code: string;
  /** Generated Word document prose */
  wordProse: string;
  /** The element type created */
  elementType: FormElementType;
  /** Element name (e.g., covenant name, basket name) */
  elementName: string;
  /** Section reference if provided */
  sectionReference: string | null;
}

// =============================================================================
// STEP-DOWN SCHEDULE (special field type)
// =============================================================================

/**
 * A step in a step-down schedule (for covenant thresholds).
 */
export interface StepDownEntry {
  threshold: number;
  endDate: string | null;  // null for final (permanent) threshold
}

// =============================================================================
// TEMPLATE CONTEXT
// =============================================================================

/**
 * Context available to templates during rendering.
 */
export interface TemplateContext {
  /** Form field values */
  values: Record<string, unknown>;
  /** Deal metadata (if available) */
  deal?: {
    name: string;
    facilityAmount: number;
    currency: string;
  };
  /** Today's date */
  today: Date;
  /** Format helpers */
  format: {
    currency: (amount: number) => string;
    percentage: (value: number) => string;
    ratio: (value: number) => string;
    date: (date: Date | string) => string;
  };
}
