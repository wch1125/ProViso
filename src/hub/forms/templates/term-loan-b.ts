/**
 * ProViso Deal Template — Term Loan B (Covenant-Lite)
 *
 * Leveraged finance term loan with incurrence-based covenants only.
 * No maintenance covenants — covenants are only tested upon specified actions
 * (incurrence of debt, making restricted payments, etc.).
 *
 * Generates a complete .proviso file with:
 * - DEFINE blocks (EBITDA, TotalDebt, Leverage, FixedChargeCoverage, SecuredLeverage)
 * - BASKET blocks with incurrence tests
 * - CONDITION blocks (incurrence-style — tested on action, not periodically)
 * - PROHIBIT blocks with ratio-based exceptions
 * - EVENT blocks (Payment, Cross-Default, Change of Control)
 */

import type { DealTemplate, FormDefinition } from '../types.js';

// =============================================================================
// FORM DEFINITION
// =============================================================================

const termLoanBForm: FormDefinition = {
  id: 'template-term-loan-b',
  name: 'template-term-loan-b',
  displayName: 'Term Loan B (Covenant-Lite)',
  category: 'templates',
  elementType: 'template',
  description: 'Leveraged finance term loan with incurrence-only covenants',

  fields: [
    // --- Deal Identity ---
    {
      id: 'borrowerName',
      name: 'borrowerName',
      label: 'Borrower Name',
      type: 'text',
      required: true,
      defaultValue: 'Acme Holdings LLC',
      options: null,
      helpText: 'Name of the borrowing entity',
      placeholder: 'e.g., Acme Holdings LLC',
      showWhen: null,
      validation: null,
    },
    {
      id: 'facilityAmount',
      name: 'facilityAmount',
      label: 'Term Loan Amount',
      type: 'currency',
      required: true,
      defaultValue: 750_000_000,
      options: null,
      helpText: 'Total term loan commitment',
      placeholder: '750,000,000',
      showWhen: null,
      validation: { min: 1_000_000 },
    },

    // --- Incurrence Ratios ---
    {
      id: 'incurrenceLeverage',
      name: 'incurrenceLeverage',
      label: 'Incurrence Leverage Test',
      type: 'ratio',
      required: true,
      defaultValue: 5.00,
      options: null,
      helpText: 'Maximum leverage ratio for permitting incremental debt (typical: 4.5x–6.0x)',
      placeholder: '5.00',
      showWhen: null,
      validation: { min: 1.0, max: 10.0 },
    },
    {
      id: 'securedLeverageCap',
      name: 'securedLeverageCap',
      label: 'Secured Leverage Cap',
      type: 'ratio',
      required: true,
      defaultValue: 3.50,
      options: null,
      helpText: 'Maximum secured debt / EBITDA for secured debt incurrence',
      placeholder: '3.50',
      showWhen: null,
      validation: { min: 1.0, max: 10.0 },
    },
    {
      id: 'fixedChargeCoverage',
      name: 'fixedChargeCoverage',
      label: 'Fixed Charge Coverage Ratio',
      type: 'ratio',
      required: true,
      defaultValue: 2.00,
      options: null,
      helpText: 'Minimum EBITDA / Fixed Charges for restricted payments (typical: 1.5x–2.5x)',
      placeholder: '2.00',
      showWhen: null,
      validation: { min: 1.0, max: 10.0 },
    },

    // --- Baskets ---
    {
      id: 'generalDebtBasket',
      name: 'generalDebtBasket',
      label: 'General Debt Basket',
      type: 'currency',
      required: true,
      defaultValue: 100_000_000,
      options: null,
      helpText: 'Free-and-clear debt capacity (no ratio test required)',
      placeholder: '100,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'rpCapacityFixed',
      name: 'rpCapacityFixed',
      label: 'Restricted Payments Basket (Fixed)',
      type: 'currency',
      required: true,
      defaultValue: 50_000_000,
      options: null,
      helpText: 'Fixed restricted payments capacity',
      placeholder: '50,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'rpCapacityPercentage',
      name: 'rpCapacityPercentage',
      label: 'RP Basket EBITDA %',
      type: 'percentage',
      required: true,
      defaultValue: 15,
      options: null,
      helpText: 'Greater-of alternative: percentage of EBITDA for restricted payments',
      placeholder: '15',
      showWhen: null,
      validation: { min: 0, max: 100 },
    },
    {
      id: 'investmentBasket',
      name: 'investmentBasket',
      label: 'Permitted Investments Basket',
      type: 'currency',
      required: true,
      defaultValue: 150_000_000,
      options: null,
      helpText: 'General investment basket capacity',
      placeholder: '150,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'investmentPercentage',
      name: 'investmentPercentage',
      label: 'Investment Basket EBITDA %',
      type: 'percentage',
      required: true,
      defaultValue: 25,
      options: null,
      helpText: 'Greater-of alternative: percentage of EBITDA for investments',
      placeholder: '25',
      showWhen: null,
      validation: { min: 0, max: 100 },
    },

    // --- Builder Basket ---
    {
      id: 'hasBuilderBasket',
      name: 'hasBuilderBasket',
      label: 'Include Builder Basket (Available Amount)',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'Accumulated capacity from retained earnings (the "Available Amount")',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'builderPercentage',
      name: 'builderPercentage',
      label: 'Available Amount Retention %',
      type: 'percentage',
      required: false,
      defaultValue: 50,
      options: null,
      helpText: 'Percentage of Consolidated Net Income accumulated',
      placeholder: '50',
      showWhen: {
        field: 'hasBuilderBasket',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0, max: 100 },
    },
    {
      id: 'builderStarting',
      name: 'builderStarting',
      label: 'Available Amount Starting',
      type: 'currency',
      required: false,
      defaultValue: 0,
      options: null,
      helpText: 'Initial available amount (often $0 or a nominal amount)',
      placeholder: '0',
      showWhen: {
        field: 'hasBuilderBasket',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0 },
    },

    // --- Events of Default ---
    {
      id: 'crossDefaultThreshold',
      name: 'crossDefaultThreshold',
      label: 'Cross Default Threshold',
      type: 'currency',
      required: true,
      defaultValue: 25_000_000,
      options: null,
      helpText: 'External debt default amount that triggers cross-default',
      placeholder: '25,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'changeOfControlTrigger',
      name: 'changeOfControlTrigger',
      label: 'Change of Control Trigger',
      type: 'select',
      required: true,
      defaultValue: 'majority',
      options: [
        { value: 'majority', label: '50%+ ownership change', description: 'Triggered when any person acquires more than 50% of voting stock' },
        { value: 'supermajority', label: '66%+ ownership change', description: 'Higher threshold — triggered at 66% ownership change' },
        { value: 'board', label: 'Board majority change', description: 'Triggered when incumbent board loses majority' },
      ],
      helpText: 'What constitutes a Change of Control',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
  ],

  validationRules: [
    {
      id: 'secured-less-than-total',
      fields: ['incurrenceLeverage', 'securedLeverageCap'],
      validate: (values) => {
        if ((values.securedLeverageCap as number) > (values.incurrenceLeverage as number)) {
          return 'Secured leverage cap should not exceed total leverage test';
        }
        return null;
      },
      message: 'Secured leverage cap should not exceed total leverage test',
    },
  ],

  codeTemplate: `// {{borrowerName}} — Term Loan B (Covenant-Lite)
// Generated by ProViso Template Library
// Facility Amount: \${{facilityAmount}}

// ==================== DEFINED TERMS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization
  EXCLUDING extraordinary_items

DEFINE TotalDebt AS
  funded_debt + capital_leases

DEFINE SecuredDebt AS
  secured_funded_debt + secured_capital_leases

DEFINE Leverage AS
  TotalDebt / EBITDA

DEFINE SecuredLeverage AS
  SecuredDebt / EBITDA

DEFINE FixedChargeCoverage AS
  EBITDA / fixed_charges

// ==================== BASKETS ====================

// Free-and-clear debt basket (no ratio test required)
BASKET GeneralDebtBasket
  CAPACITY \${{generalDebtBasket}}

// Ratio-based incremental debt basket
BASKET IncrementalDebt
  CAPACITY \${{facilityAmount}}
  SUBJECT TO IncurrenceLeverageTest

// Restricted payments — greater of fixed and percentage
BASKET RestrictedPayments
  CAPACITY GreaterOf(\${{rpCapacityFixed}}, {{rpCapacityPercentage}}% * EBITDA)
  SUBJECT TO RPIncurrenceTest

// General investments — greater of fixed and percentage
BASKET PermittedInvestments
  CAPACITY GreaterOf(\${{investmentBasket}}, {{investmentPercentage}}% * EBITDA)
  SUBJECT TO NoDefault
{{#if hasBuilderBasket}}
// ==================== BUILDER BASKET (Available Amount) ====================

BASKET AvailableAmount
  BUILDS_FROM {{builderPercentage}}% * net_income
  STARTING \${{builderStarting}}
  MAXIMUM \${{facilityAmount}}
  SUBJECT TO NoDefault
{{/if}}
// ==================== CONDITIONS (Incurrence Tests) ====================

// Incurrence leverage test — tested only when incurring debt
CONDITION IncurrenceLeverageTest AS
  Leverage <= {{incurrenceLeverage}} AND SecuredLeverage <= {{securedLeverageCap}}

// RP incurrence test — tested only when making restricted payments
CONDITION RPIncurrenceTest AS
  FixedChargeCoverage >= {{fixedChargeCoverage}}

CONDITION NoDefault AS
  NOT EXISTS(EventOfDefault) AND NOT EXISTS(UnmaturedDefault)

// ==================== NEGATIVE COVENANTS ====================

PROHIBIT DebtIncurrence
  EXCEPT WHEN
    | amount <= AVAILABLE(GeneralDebtBasket)
    | OR (amount <= AVAILABLE(IncrementalDebt) AND IncurrenceLeverageTest)

PROHIBIT RestrictedPayment
  EXCEPT WHEN
    | amount <= AVAILABLE(RestrictedPayments)
    | AND RPIncurrenceTest
    | AND NoDefault

PROHIBIT Investments
  EXCEPT WHEN
    | amount <= AVAILABLE(PermittedInvestments)
    | AND NoDefault

// ==================== EVENTS OF DEFAULT ====================

EVENT PaymentDefault
  TRIGGERS WHEN payment_due AND NOT payment_received
  GRACE_PERIOD 5 DAYS
  CONSEQUENCE EventOfDefault

EVENT CrossDefault
  TRIGGERS WHEN external_debt_default > {{crossDefaultThreshold}}
  CONSEQUENCE EventOfDefault

EVENT ChangeOfControl
  TRIGGERS WHEN ownership_change > {{changeOfControlThresholdValue}}
  CONSEQUENCE EventOfDefault`,

  wordTemplate: `This template generates ProViso code, not Word prose. Use element-level forms for document generation.`,
};

// =============================================================================
// DEAL TEMPLATE
// =============================================================================

export const termLoanBTemplate: DealTemplate = {
  id: 'term-loan-b',
  name: 'Term Loan B (Covenant-Lite)',
  description:
    'Leveraged finance term loan with incurrence-only covenants. No maintenance tests — covenants are only checked when the borrower takes specific actions (debt incurrence, restricted payments). Standard for sponsor-backed LBOs.',
  industry: 'leveraged_finance',
  complexity: 'standard',
  icon: 'TrendingUp',
  features: [
    'Incurrence-only covenants (no maintenance tests)',
    'Leverage & secured leverage ratio tests',
    'Fixed charge coverage for restricted payments',
    'Builder basket (Available Amount)',
    'Change of control event of default',
  ],
  form: termLoanBForm,
};

export default termLoanBTemplate;
