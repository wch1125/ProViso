/**
 * ProViso Hub v2.0 — Basket Fixed Form
 *
 * Form for creating/editing fixed-capacity baskets.
 * Example: BASKET GeneralInvestments CAPACITY $25,000,000
 */

import type { FormDefinition } from '../types.js';

export const basketFixedForm: FormDefinition = {
  id: 'basket-fixed',
  name: 'basket-fixed',
  displayName: 'Fixed Basket',
  category: 'baskets',
  elementType: 'basket',
  description: 'A basket with a fixed dollar capacity',

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
      helpText: 'Title for the Word document (e.g., General Investment Basket)',
      placeholder: 'e.g., General Investment Basket',
      showWhen: null,
      validation: null,
    },
    {
      id: 'capacity',
      name: 'capacity',
      label: 'Capacity',
      type: 'currency',
      required: true,
      defaultValue: 25000000,
      options: null,
      helpText: 'Maximum permitted amount under this basket',
      placeholder: '25,000,000',
      showWhen: null,
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
      helpText: 'What type of restricted action does this basket permit?',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
  ],

  validationRules: [],

  codeTemplate: 'BASKET {{name}}\n  CAPACITY ${{capacity}}{{#if hasSubjectTo}}\n  SUBJECT_TO {{subjectToCondition}}{{/if}}',

  wordTemplate: '({{sectionRef}}) {{title}}; {{categoryDisplay}} made pursuant to this clause ({{sectionRef}}) not to exceed {{format.currency capacity}} in the aggregate outstanding at any time{{#if hasSubjectTo}}; provided that, at the time of making any such {{categoryActionDisplay}} and after giving pro forma effect thereto, {{subjectToDisplay}}{{/if}}.',
};

/**
 * Get human-readable category display name.
 */
export function getCategoryDisplay(category: string): string {
  const displays: Record<string, string> = {
    investments: 'Investments',
    indebtedness: 'Indebtedness',
    liens: 'Liens',
    restricted_payments: 'Restricted Payments',
    asset_sales: 'Asset Sales',
    affiliate_transactions: 'transactions with Affiliates',
    other: 'amounts',
  };
  return displays[category] || category;
}

/**
 * Get human-readable category action (verb form).
 */
export function getCategoryActionDisplay(category: string): string {
  const displays: Record<string, string> = {
    investments: 'Investment',
    indebtedness: 'incurrence',
    liens: 'Lien',
    restricted_payments: 'Restricted Payment',
    asset_sales: 'Disposition',
    affiliate_transactions: 'transaction',
    other: 'action',
  };
  return displays[category] || category;
}

/**
 * Get human-readable subject-to condition display.
 */
export function getSubjectToDisplay(condition: string): string {
  const displays: Record<string, string> = {
    ProFormaCompliance: 'no Default or Event of Default shall have occurred or would result therefrom and the Borrower shall be in pro forma compliance with all financial covenants',
    ProFormaLeverage: 'the Borrower shall be in pro forma compliance with the Maximum Leverage Ratio',
    NoDefault: 'no Default or Event of Default shall have occurred or would result therefrom',
  };
  return displays[condition] || condition;
}

export default basketFixedForm;
