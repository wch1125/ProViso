/**
 * ProViso Hub v2.0 — Covenant Simple Form
 *
 * Form for creating/editing simple covenants with a single threshold.
 * Examples: MaxLeverage <= 5.0, MinInterestCoverage >= 2.5
 */

import type { FormDefinition } from '../types.js';

export const covenantSimpleForm: FormDefinition = {
  id: 'covenant-simple',
  name: 'covenant-simple',
  displayName: 'Simple Covenant',
  category: 'covenants',
  elementType: 'covenant',
  description: 'A financial covenant with a single threshold (e.g., Maximum Leverage Ratio)',

  fields: [
    {
      id: 'name',
      name: 'name',
      label: 'Covenant Name',
      type: 'text',
      required: true,
      defaultValue: '',
      options: null,
      helpText: 'Internal name for the covenant (e.g., MaxLeverage)',
      placeholder: 'e.g., MaxLeverage',
      showWhen: null,
      validation: {
        pattern: '^[A-Za-z][A-Za-z0-9_]*$',
        patternMessage: 'Must start with a letter and contain only letters, numbers, and underscores',
      },
    },
    {
      id: 'title',
      name: 'title',
      label: 'Display Title',
      type: 'text',
      required: true,
      defaultValue: '',
      options: null,
      helpText: 'Title for the Word document (e.g., Maximum Leverage Ratio)',
      placeholder: 'e.g., Maximum Leverage Ratio',
      showWhen: null,
      validation: null,
    },
    {
      id: 'metric',
      name: 'metric',
      label: 'Financial Metric',
      type: 'select',
      required: true,
      defaultValue: 'Leverage',
      options: [
        { value: 'Leverage', label: 'Leverage Ratio', description: 'Total Debt / EBITDA' },
        { value: 'InterestCoverage', label: 'Interest Coverage', description: 'EBITDA / Interest Expense' },
        { value: 'DSCR', label: 'Debt Service Coverage', description: 'Cash Flow / Debt Service' },
        { value: 'FixedChargeCoverage', label: 'Fixed Charge Coverage', description: 'EBITDA / Fixed Charges' },
        { value: 'MinEBITDA', label: 'Minimum EBITDA', description: 'Absolute EBITDA amount' },
        { value: 'MaxCapEx', label: 'Maximum CapEx', description: 'Capital Expenditure limit' },
        { value: 'MinLiquidity', label: 'Minimum Liquidity', description: 'Cash + available revolving' },
        { value: 'Custom', label: 'Custom Expression', description: 'Define custom calculation' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'customExpression',
      name: 'customExpression',
      label: 'Custom Expression',
      type: 'expression',
      required: true,
      defaultValue: '',
      options: null,
      helpText: 'ProViso expression for the metric',
      placeholder: 'e.g., TotalDebt / EBITDA',
      showWhen: {
        field: 'metric',
        operator: 'equals',
        value: 'Custom',
      },
      validation: null,
    },
    {
      id: 'operator',
      name: 'operator',
      label: 'Test Operator',
      type: 'select',
      required: true,
      defaultValue: '<=',
      options: [
        { value: '<=', label: 'shall not exceed (≤)', description: 'Maximum covenant' },
        { value: '>=', label: 'shall not be less than (≥)', description: 'Minimum covenant' },
        { value: '<', label: 'shall be less than (<)', description: 'Strictly less than' },
        { value: '>', label: 'shall be greater than (>)', description: 'Strictly greater than' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'threshold',
      name: 'threshold',
      label: 'Threshold',
      type: 'ratio',
      required: true,
      defaultValue: 5.0,
      options: null,
      helpText: 'The covenant threshold value',
      placeholder: 'e.g., 5.00',
      showWhen: null,
      validation: {
        min: 0,
      },
    },
    {
      id: 'frequency',
      name: 'frequency',
      label: 'Testing Frequency',
      type: 'select',
      required: true,
      defaultValue: 'quarterly',
      options: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'semi-annually', label: 'Semi-Annually' },
        { value: 'annually', label: 'Annually' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'sectionRef',
      name: 'sectionRef',
      label: 'Section Reference',
      type: 'section-reference',
      required: false,
      defaultValue: '',
      options: null,
      helpText: 'Credit agreement section number (e.g., 7.11(a))',
      placeholder: '7.11(a)',
      showWhen: null,
      validation: null,
    },
  ],

  validationRules: [],

  codeTemplate: `COVENANT {{name}}
  REQUIRES {{#if customExpression}}{{customExpression}}{{else}}{{metric}}{{/if}} {{operator}} {{threshold}}
  TESTED {{frequency}}`,

  wordTemplate: `({{sectionRef}}) {{title}}. The Borrower shall not permit the {{metricDisplay}} as of the last day of any {{frequencyDisplay}} to {{operatorDisplay}} {{threshold}} to 1.00.`,
};

/**
 * Get human-readable metric display name.
 */
export function getMetricDisplay(metric: string): string {
  const displays: Record<string, string> = {
    Leverage: 'Leverage Ratio (Total Debt to Consolidated EBITDA)',
    InterestCoverage: 'Interest Coverage Ratio (Consolidated EBITDA to Interest Expense)',
    DSCR: 'Debt Service Coverage Ratio',
    FixedChargeCoverage: 'Fixed Charge Coverage Ratio',
    MinEBITDA: 'Consolidated EBITDA',
    MaxCapEx: 'Capital Expenditures',
    MinLiquidity: 'Liquidity',
  };
  return displays[metric] || metric;
}

/**
 * Get human-readable operator display.
 */
export function getOperatorDisplay(operator: string): string {
  const displays: Record<string, string> = {
    '<=': 'exceed',
    '>=': 'be less than',
    '<': 'equal or exceed',
    '>': 'equal or be less than',
  };
  return displays[operator] || operator;
}

/**
 * Get human-readable frequency display.
 */
export function getFrequencyDisplay(frequency: string): string {
  const displays: Record<string, string> = {
    monthly: 'fiscal month',
    quarterly: 'fiscal quarter',
    'semi-annually': 'semi-annual period',
    annually: 'fiscal year',
  };
  return displays[frequency] || frequency;
}

export default covenantSimpleForm;
