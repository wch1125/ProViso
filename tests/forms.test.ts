/**
 * ProViso Hub v2.0 — Form System Tests
 */

import { describe, it, expect } from 'vitest';
import {
  renderTemplate,
  createTemplateContext,
  createFormatHelpers,
  generateFormOutput,
  validateFormValues,
  getDefaultValues,
  covenantSimpleForm,
  basketFixedForm,
  basketGrowerForm,
  formDefinitions,
  getFormDefinition,
  getFormsByCategory,
} from '../src/hub/forms/index.js';

// =============================================================================
// TEMPLATE RENDERING TESTS
// =============================================================================

describe('Template Rendering', () => {
  describe('Variable Substitution', () => {
    it('replaces simple variables', () => {
      const template = 'Hello {{name}}!';
      const context = createTemplateContext({ name: 'World' });
      expect(renderTemplate(template, context)).toBe('Hello World!');
    });

    it('handles missing variables as empty string', () => {
      const template = 'Hello {{name}}!';
      const context = createTemplateContext({});
      expect(renderTemplate(template, context)).toBe('Hello !');
    });

    it('handles numeric values', () => {
      const template = 'Value: {{amount}}';
      const context = createTemplateContext({ amount: 42 });
      expect(renderTemplate(template, context)).toBe('Value: 42');
    });
  });

  describe('Conditional Blocks', () => {
    it('renders {{#if}} when truthy', () => {
      const template = '{{#if enabled}}Enabled{{/if}}';
      const context = createTemplateContext({ enabled: true });
      expect(renderTemplate(template, context)).toBe('Enabled');
    });

    it('skips {{#if}} when falsy', () => {
      const template = '{{#if enabled}}Enabled{{/if}}';
      const context = createTemplateContext({ enabled: false });
      expect(renderTemplate(template, context)).toBe('');
    });

    it('handles {{#if}}...{{else}}...{{/if}}', () => {
      const template = '{{#if enabled}}Yes{{else}}No{{/if}}';

      const contextTrue = createTemplateContext({ enabled: true });
      expect(renderTemplate(template, contextTrue)).toBe('Yes');

      const contextFalse = createTemplateContext({ enabled: false });
      expect(renderTemplate(template, contextFalse)).toBe('No');
    });

    it('renders {{#unless}} when falsy', () => {
      const template = '{{#unless disabled}}Active{{/unless}}';
      const context = createTemplateContext({ disabled: false });
      expect(renderTemplate(template, context)).toBe('Active');
    });
  });

  describe('Format Helpers', () => {
    const helpers = createFormatHelpers();

    it('formats currency with M suffix for millions', () => {
      expect(helpers.currency(25000000)).toBe('$25M');
      expect(helpers.currency(1000000)).toBe('$1M');
    });

    it('formats currency with commas for non-millions', () => {
      expect(helpers.currency(250000)).toBe('$250,000');
      expect(helpers.currency(1500)).toBe('$1,500');
    });

    it('formats percentage', () => {
      expect(helpers.percentage(10)).toBe('10%');
      expect(helpers.percentage(12.5)).toBe('12.5%');
    });

    it('formats ratio', () => {
      expect(helpers.ratio(5)).toBe('5.00x');
      expect(helpers.ratio(4.25)).toBe('4.25x');
    });

    it('formats date', () => {
      expect(helpers.date('2026-03-15')).toBe('2026-03-15');
      expect(helpers.date(new Date('2026-03-15'))).toBe('2026-03-15');
    });

    it('handles invalid currency', () => {
      expect(helpers.currency(NaN)).toBe('$0');
    });
  });
});

// =============================================================================
// FORM DEFINITION TESTS
// =============================================================================

describe('Form Definitions', () => {
  describe('Registry', () => {
    it('has all expected forms', () => {
      expect(formDefinitions.length).toBeGreaterThanOrEqual(3);
    });

    it('can get form by ID', () => {
      const form = getFormDefinition('covenant-simple');
      expect(form).toBeDefined();
      expect(form?.name).toBe('covenant-simple');
    });

    it('returns undefined for unknown form', () => {
      expect(getFormDefinition('unknown-form')).toBeUndefined();
    });

    it('can filter by category', () => {
      const covenantForms = getFormsByCategory('covenants');
      expect(covenantForms.length).toBeGreaterThanOrEqual(1);
      expect(covenantForms.every((f) => f.category === 'covenants')).toBe(true);
    });
  });

  describe('Covenant Simple Form', () => {
    it('has required fields', () => {
      const requiredFields = covenantSimpleForm.fields.filter((f) => f.required);
      const fieldNames = requiredFields.map((f) => f.name);
      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('metric');
      expect(fieldNames).toContain('operator');
      expect(fieldNames).toContain('threshold');
      expect(fieldNames).toContain('frequency');
    });

    it('has code and word templates', () => {
      expect(covenantSimpleForm.codeTemplate).toBeTruthy();
      expect(covenantSimpleForm.wordTemplate).toBeTruthy();
    });
  });

  describe('Basket Fixed Form', () => {
    it('has capacity field', () => {
      const capacityField = basketFixedForm.fields.find((f) => f.name === 'capacity');
      expect(capacityField).toBeDefined();
      expect(capacityField?.type).toBe('currency');
      expect(capacityField?.required).toBe(true);
    });
  });

  describe('Basket Grower Form', () => {
    it('has fixedAmount and percentage fields', () => {
      const fixedField = basketGrowerForm.fields.find((f) => f.name === 'fixedAmount');
      const percentField = basketGrowerForm.fields.find((f) => f.name === 'percentage');
      expect(fixedField).toBeDefined();
      expect(percentField).toBeDefined();
    });

    it('has floor validation rule', () => {
      expect(basketGrowerForm.validationRules.length).toBeGreaterThanOrEqual(1);
      const floorRule = basketGrowerForm.validationRules.find(
        (r) => r.id === 'floor-less-than-fixed'
      );
      expect(floorRule).toBeDefined();
    });
  });
});

// =============================================================================
// CODE GENERATION TESTS
// =============================================================================

describe('Code Generation', () => {
  describe('Covenant Simple', () => {
    it('generates basic covenant code', () => {
      const values = {
        name: 'MaxLeverage',
        metric: 'Leverage',
        operator: '<=',
        threshold: 5.0,
        frequency: 'quarterly',
      };

      const output = generateFormOutput(covenantSimpleForm, values);
      expect(output.code).toContain('COVENANT MaxLeverage');
      expect(output.code).toContain('REQUIRES Leverage <= 5');
      expect(output.code).toContain('TESTED quarterly');
      expect(output.elementName).toBe('MaxLeverage');
    });

    it('handles custom expression', () => {
      const values = {
        name: 'CustomRatio',
        metric: 'Custom',
        customExpression: 'TotalDebt / EBITDA',
        operator: '<=',
        threshold: 4.5,
        frequency: 'quarterly',
      };

      const output = generateFormOutput(covenantSimpleForm, values);
      expect(output.code).toContain('REQUIRES TotalDebt / EBITDA <= 4.5');
    });
  });

  describe('Basket Fixed', () => {
    it('generates basic basket code', () => {
      const values = {
        name: 'GeneralInvestments',
        capacity: 25000000,
        hasSubjectTo: false,
        category: 'investments',
      };

      const output = generateFormOutput(basketFixedForm, values);
      expect(output.code).toContain('BASKET GeneralInvestments');
      expect(output.code).toContain('CAPACITY $25000000');
      expect(output.elementType).toBe('basket');
    });

    it('includes subject-to condition when enabled', () => {
      const values = {
        name: 'AcquisitionBasket',
        capacity: 50000000,
        hasSubjectTo: true,
        subjectToCondition: 'ProFormaCompliance',
        category: 'investments',
      };

      const output = generateFormOutput(basketFixedForm, values);
      expect(output.code).toContain('SUBJECT_TO ProFormaCompliance');
    });
  });

  describe('Basket Grower', () => {
    it('generates grower basket code', () => {
      const values = {
        name: 'GeneralInvestments',
        fixedAmount: 25000000,
        percentage: 10,
        metric: 'LTM_EBITDA',
        hasFloor: false,
        hasSubjectTo: false,
        category: 'investments',
      };

      const output = generateFormOutput(basketGrowerForm, values);
      expect(output.code).toContain('BASKET GeneralInvestments');
      expect(output.code).toContain('GreaterOf($25000000, 10% * LTM_EBITDA)');
    });

    it('includes floor when enabled', () => {
      const values = {
        name: 'GeneralInvestments',
        fixedAmount: 25000000,
        percentage: 10,
        metric: 'LTM_EBITDA',
        hasFloor: true,
        floor: 20000000,
        hasSubjectTo: false,
        category: 'investments',
      };

      const output = generateFormOutput(basketGrowerForm, values);
      expect(output.code).toContain('WITH FLOOR $20000000');
    });
  });
});

// =============================================================================
// VALIDATION TESTS
// =============================================================================

describe('Form Validation', () => {
  describe('Required Fields', () => {
    it('validates required fields', () => {
      const result = validateFormValues(covenantSimpleForm, {});
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
      expect(result.errors.name).toBeDefined();
    });

    it('passes with all required fields', () => {
      const values = {
        name: 'MaxLeverage',
        title: 'Maximum Leverage Ratio',
        metric: 'Leverage',
        operator: '<=',
        threshold: 5.0,
        frequency: 'quarterly',
      };
      const result = validateFormValues(covenantSimpleForm, values);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });

  describe('Pattern Validation', () => {
    it('validates name pattern', () => {
      const values = {
        name: '123Invalid', // Starts with number
        title: 'Test',
        metric: 'Leverage',
        operator: '<=',
        threshold: 5.0,
        frequency: 'quarterly',
      };
      const result = validateFormValues(covenantSimpleForm, values);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('accepts valid name pattern', () => {
      const values = {
        name: 'MaxLeverage_2',
        title: 'Test',
        metric: 'Leverage',
        operator: '<=',
        threshold: 5.0,
        frequency: 'quarterly',
      };
      const result = validateFormValues(covenantSimpleForm, values);
      expect(result.errors.name).toBeUndefined();
    });
  });

  describe('Cross-Field Validation', () => {
    it('validates floor less than fixed amount', () => {
      const values = {
        name: 'TestBasket',
        title: 'Test',
        fixedAmount: 20000000,
        percentage: 10,
        metric: 'LTM_EBITDA',
        hasFloor: true,
        floor: 25000000, // Greater than fixedAmount - invalid
        category: 'investments',
      };
      const result = validateFormValues(basketGrowerForm, values);
      expect(result.formErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Conditional Fields', () => {
    it('skips validation for hidden fields', () => {
      const values = {
        name: 'MaxLeverage',
        title: 'Test',
        metric: 'Leverage', // Not 'Custom', so customExpression is hidden
        operator: '<=',
        threshold: 5.0,
        frequency: 'quarterly',
        // customExpression is missing but should not be validated
      };
      const result = validateFormValues(covenantSimpleForm, values);
      expect(result.errors.customExpression).toBeUndefined();
    });
  });
});

// =============================================================================
// DEFAULT VALUES TESTS
// =============================================================================

describe('Default Values', () => {
  it('extracts defaults from covenant form', () => {
    const defaults = getDefaultValues(covenantSimpleForm);
    expect(defaults.metric).toBe('Leverage');
    expect(defaults.operator).toBe('<=');
    expect(defaults.threshold).toBe(5.0);
    expect(defaults.frequency).toBe('quarterly');
  });

  it('extracts defaults from basket grower form', () => {
    const defaults = getDefaultValues(basketGrowerForm);
    expect(defaults.fixedAmount).toBe(25000000);
    expect(defaults.percentage).toBe(10);
    expect(defaults.metric).toBe('LTM_EBITDA');
    expect(defaults.hasFloor).toBe(false);
  });
});
