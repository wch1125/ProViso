/**
 * ProViso Hub v2.0 — Basket Grower Form
 *
 * Form for creating/editing grower baskets (capacity scales with metrics).
 * Example: BASKET GeneralInvestments CAPACITY GreaterOf($25M, 10% * EBITDA) WITH FLOOR $20M
 */

import type { FormDefinition } from '../types.js';

export const basketGrowerForm: FormDefinition = {
  id: 'basket-grower',
  name: 'basket-grower',
  displayName: 'Grower Basket',
  category: 'baskets',
  elementType: 'basket',
  description: 'A basket that grows with company size (greater of fixed amount or percentage of a metric)',

  fields: [
    {
      id: 'name',
      name: 'name',
      label: 'Basket Name',
      type: 'text',
      required: true,
      defaultValue: '',
      options: null,
      helpText: 'Internal name for the basket (e.g., GeneralInvestments)',
      placeholder: 'e.g., GeneralInvestments',
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
      helpText: 'Title for the Word document',
      placeholder: 'e.g., General Investment Basket',
      showWhen: null,
      validation: null,
    },
    {
      id: 'fixedAmount',
      name: 'fixedAmount',
      label: 'Fixed Amount (Dollar Floor)',
      type: 'currency',
      required: true,
      defaultValue: 25000000,
      options: null,
      helpText: 'The fixed dollar amount component',
      placeholder: '25,000,000',
      showWhen: null,
      validation: {
        min: 0,
      },
    },
    {
      id: 'percentage',
      name: 'percentage',
      label: 'Percentage',
      type: 'percentage',
      required: true,
      defaultValue: 10,
      options: null,
      helpText: 'Percentage of the reference metric',
      placeholder: '10',
      showWhen: null,
      validation: {
        min: 0,
        max: 100,
      },
    },
    {
      id: 'metric',
      name: 'metric',
      label: 'Reference Metric',
      type: 'select',
      required: true,
      defaultValue: 'LTM_EBITDA',
      options: [
        { value: 'LTM_EBITDA', label: 'LTM EBITDA', description: 'Last twelve months EBITDA' },
        { value: 'EBITDA', label: 'Consolidated EBITDA', description: 'Most recent period EBITDA' },
        { value: 'TotalAssets', label: 'Total Assets', description: 'Consolidated total assets' },
        { value: 'ConsolidatedNetIncome', label: 'Consolidated Net Income', description: 'Net income for the period' },
        { value: 'TangibleNetWorth', label: 'Tangible Net Worth', description: 'Total equity less intangibles' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'hasFloor',
      name: 'hasFloor',
      label: 'Add Minimum Floor',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      options: null,
      helpText: 'Set a minimum capacity that cannot be reduced',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'floor',
      name: 'floor',
      label: 'Floor Amount',
      type: 'currency',
      required: false,
      defaultValue: 20000000,
      options: null,
      helpText: 'Minimum capacity even if percentage calculation is lower',
      placeholder: '20,000,000',
      showWhen: {
        field: 'hasFloor',
        operator: 'equals',
        value: true,
      },
      validation: {
        min: 0,
      },
    },
    {
      id: 'hasSubjectTo',
      name: 'hasSubjectTo',
      label: 'Subject to Pro Forma Compliance',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      options: null,
      helpText: 'Require pro forma covenant compliance for usage',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'subjectToCondition',
      name: 'subjectToCondition',
      label: 'Compliance Condition',
      type: 'select',
      required: false,
      defaultValue: 'ProFormaCompliance',
      options: [
        { value: 'ProFormaCompliance', label: 'Pro Forma Compliance', description: 'All financial covenants must be satisfied pro forma' },
        { value: 'ProFormaLeverage', label: 'Pro Forma Leverage', description: 'Leverage covenant must be satisfied pro forma' },
        { value: 'NoDefault', label: 'No Default', description: 'No Event of Default shall have occurred' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: {
        field: 'hasSubjectTo',
        operator: 'equals',
        value: true,
      },
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
      helpText: 'Credit agreement section number (e.g., 7.02(f))',
      placeholder: '7.02(f)',
      showWhen: null,
      validation: null,
    },
    {
      id: 'category',
      name: 'category',
      label: 'Basket Category',
      type: 'select',
      required: true,
      defaultValue: 'investments',
      options: [
        { value: 'investments', label: 'Investments' },
        { value: 'indebtedness', label: 'Indebtedness' },
        { value: 'liens', label: 'Liens' },
        { value: 'restricted_payments', label: 'Restricted Payments' },
        { value: 'asset_sales', label: 'Asset Sales' },
        { value: 'affiliate_transactions', label: 'Affiliate Transactions' },
        { value: 'other', label: 'Other' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: null,
      validation: null,
    },
  ],

  validationRules: [
    {
      id: 'floor-less-than-fixed',
      fields: ['floor', 'fixedAmount', 'hasFloor'],
      validate: (values) => {
        if (values.hasFloor && (values.floor as number) > (values.fixedAmount as number)) {
          return 'Floor cannot exceed the fixed amount';
        }
        return null;
      },
      message: 'Floor cannot exceed the fixed amount',
    },
  ],

  codeTemplate: 'BASKET {{name}}\n  CAPACITY GreaterOf(${{fixedAmount}}, {{percentage}}% * {{metric}}){{#if hasFloor}}\n  WITH FLOOR ${{floor}}{{/if}}{{#if hasSubjectTo}}\n  SUBJECT_TO {{subjectToCondition}}{{/if}}',

  wordTemplate: '({{sectionRef}}) {{title}}; {{categoryDisplay}} made pursuant to this clause ({{sectionRef}}) not to exceed the greater of (x) {{format.currency fixedAmount}} and (y) {{percentage}}% of {{metricDisplay}}{{#if hasFloor}} (but in no event less than {{format.currency floor}}){{/if}} in the aggregate outstanding at any time{{#if hasSubjectTo}}; provided that, at the time of making any such {{categoryActionDisplay}} and after giving pro forma effect thereto, {{subjectToDisplay}}{{/if}}.',
};

/**
 * Get human-readable metric display name.
 */
export function getMetricDisplay(metric: string): string {
  const displays: Record<string, string> = {
    LTM_EBITDA: 'Consolidated EBITDA for the most recently ended Test Period',
    EBITDA: 'Consolidated EBITDA',
    TotalAssets: 'Total Assets as of the most recently ended fiscal quarter',
    ConsolidatedNetIncome: 'Consolidated Net Income',
    TangibleNetWorth: 'Tangible Net Worth',
  };
  return displays[metric] || metric;
}

export default basketGrowerForm;
