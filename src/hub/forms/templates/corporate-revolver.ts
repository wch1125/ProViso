/**
 * ProViso Deal Template — Corporate Revolving Credit Facility
 *
 * Standard corporate revolver with maintenance covenants, baskets,
 * negative covenants, and events of default. This is the most common
 * credit agreement structure for investment-grade and crossover borrowers.
 *
 * Generates a complete .proviso file with:
 * - DEFINE blocks (EBITDA, TotalDebt, Leverage, InterestCoverage)
 * - COVENANT blocks (MaxLeverage, MinInterestCoverage, MinLiquidity)
 * - BASKET blocks (GeneralInvestments, RestrictedPayments, CapEx, PermittedAcquisitions)
 * - GROWER BASKET (EBITDA-linked investment basket)
 * - BUILDER BASKET (retained earnings)
 * - CONDITION blocks (NoDefault, ProFormaCompliance)
 * - PROHIBIT blocks (Investments, Dividends, CapEx)
 * - EVENT blocks (PaymentDefault, CovenantDefault, CrossDefault)
 */

import type { DealTemplate, FormDefinition } from '../types.js';

// =============================================================================
// FORM DEFINITION
// =============================================================================

const corporateRevolverForm: FormDefinition = {
  id: 'template-corporate-revolver',
  name: 'template-corporate-revolver',
  displayName: 'Corporate Revolving Credit Facility',
  category: 'templates',
  elementType: 'template',
  description: 'Standard corporate revolver with maintenance covenants, baskets, and events of default',

  fields: [
    // --- Deal Identity ---
    {
      id: 'borrowerName',
      name: 'borrowerName',
      label: 'Borrower Name',
      type: 'text',
      required: true,
      defaultValue: 'Acme Corp',
      options: null,
      helpText: 'Name of the borrowing entity',
      placeholder: 'e.g., Acme Corp',
      showWhen: null,
      validation: null,
    },
    {
      id: 'facilityAmount',
      name: 'facilityAmount',
      label: 'Facility Amount',
      type: 'currency',
      required: true,
      defaultValue: 500_000_000,
      options: null,
      helpText: 'Total revolving credit facility commitment',
      placeholder: '500,000,000',
      showWhen: null,
      validation: { min: 1_000_000 },
    },

    // --- Financial Covenants ---
    {
      id: 'maxLeverage',
      name: 'maxLeverage',
      label: 'Maximum Leverage Ratio',
      type: 'ratio',
      required: true,
      defaultValue: 4.50,
      options: null,
      helpText: 'Maximum Total Debt / EBITDA (typical range: 3.0x–5.5x)',
      placeholder: '4.50',
      showWhen: null,
      validation: { min: 1.0, max: 10.0 },
    },
    {
      id: 'minInterestCoverage',
      name: 'minInterestCoverage',
      label: 'Minimum Interest Coverage',
      type: 'ratio',
      required: true,
      defaultValue: 2.50,
      options: null,
      helpText: 'Minimum EBITDA / Interest Expense (typical range: 1.5x–3.0x)',
      placeholder: '2.50',
      showWhen: null,
      validation: { min: 1.0, max: 10.0 },
    },
    {
      id: 'hasLiquidityCovenant',
      name: 'hasLiquidityCovenant',
      label: 'Include Minimum Liquidity Covenant',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'Require minimum cash on hand',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'minLiquidity',
      name: 'minLiquidity',
      label: 'Minimum Liquidity',
      type: 'currency',
      required: false,
      defaultValue: 15_000_000,
      options: null,
      helpText: 'Minimum cash balance required at all times',
      placeholder: '15,000,000',
      showWhen: {
        field: 'hasLiquidityCovenant',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0 },
    },
    {
      id: 'covenantFrequency',
      name: 'covenantFrequency',
      label: 'Testing Frequency',
      type: 'select',
      required: true,
      defaultValue: 'QUARTERLY',
      options: [
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'QUARTERLY', label: 'Quarterly' },
        { value: 'SEMI_ANNUALLY', label: 'Semi-Annually' },
        { value: 'ANNUALLY', label: 'Annually' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: null,
      validation: null,
    },

    // --- Cure Rights ---
    {
      id: 'hasCureRight',
      name: 'hasCureRight',
      label: 'Include Equity Cure Right',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'Allow equity contributions to cure covenant breaches',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'cureMaxUses',
      name: 'cureMaxUses',
      label: 'Maximum Cure Uses',
      type: 'number',
      required: false,
      defaultValue: 3,
      options: null,
      helpText: 'Maximum number of equity cures over the life of the facility',
      placeholder: '3',
      showWhen: {
        field: 'hasCureRight',
        operator: 'equals',
        value: true,
      },
      validation: { min: 1, max: 10 },
    },
    {
      id: 'cureMaxAmount',
      name: 'cureMaxAmount',
      label: 'Maximum Cure Amount',
      type: 'currency',
      required: false,
      defaultValue: 20_000_000,
      options: null,
      helpText: 'Maximum amount per equity cure',
      placeholder: '20,000,000',
      showWhen: {
        field: 'hasCureRight',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0 },
    },

    // --- Baskets ---
    {
      id: 'generalInvestmentBasket',
      name: 'generalInvestmentBasket',
      label: 'General Investment Basket',
      type: 'currency',
      required: true,
      defaultValue: 25_000_000,
      options: null,
      helpText: 'Fixed capacity for permitted investments',
      placeholder: '25,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'restrictedPaymentsBasket',
      name: 'restrictedPaymentsBasket',
      label: 'Restricted Payments Basket',
      type: 'currency',
      required: true,
      defaultValue: 10_000_000,
      options: null,
      helpText: 'Fixed component of restricted payments basket',
      placeholder: '10,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'rpBasketAssetPercentage',
      name: 'rpBasketAssetPercentage',
      label: 'RP Basket Asset %',
      type: 'percentage',
      required: true,
      defaultValue: 5,
      options: null,
      helpText: 'Alternative: percentage of total assets for restricted payments',
      placeholder: '5',
      showWhen: null,
      validation: { min: 0, max: 100 },
    },
    {
      id: 'capExBasket',
      name: 'capExBasket',
      label: 'Capital Expenditures Basket',
      type: 'currency',
      required: true,
      defaultValue: 20_000_000,
      options: null,
      helpText: 'Maximum permitted capital expenditures',
      placeholder: '20,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'permittedAcquisitionBasket',
      name: 'permittedAcquisitionBasket',
      label: 'Permitted Acquisition Basket',
      type: 'currency',
      required: true,
      defaultValue: 75_000_000,
      options: null,
      helpText: 'Maximum permitted acquisition size (subject to pro forma compliance)',
      placeholder: '75,000,000',
      showWhen: null,
      validation: { min: 0 },
    },

    // --- Grower Basket ---
    {
      id: 'hasGrowerBasket',
      name: 'hasGrowerBasket',
      label: 'Include EBITDA Grower Basket',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'Investment basket that grows with EBITDA',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'growerPercentage',
      name: 'growerPercentage',
      label: 'Grower Basket EBITDA %',
      type: 'percentage',
      required: false,
      defaultValue: 15,
      options: null,
      helpText: 'Percentage of EBITDA for grower basket capacity',
      placeholder: '15',
      showWhen: {
        field: 'hasGrowerBasket',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0, max: 100 },
    },
    {
      id: 'growerFloor',
      name: 'growerFloor',
      label: 'Grower Basket Floor',
      type: 'currency',
      required: false,
      defaultValue: 15_000_000,
      options: null,
      helpText: 'Minimum capacity regardless of EBITDA',
      placeholder: '15,000,000',
      showWhen: {
        field: 'hasGrowerBasket',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0 },
    },

    // --- Builder Basket ---
    {
      id: 'hasBuilderBasket',
      name: 'hasBuilderBasket',
      label: 'Include Builder Basket (Retained Earnings)',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'Basket that accumulates from retained earnings',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'builderPercentage',
      name: 'builderPercentage',
      label: 'Builder Basket Retention %',
      type: 'percentage',
      required: false,
      defaultValue: 50,
      options: null,
      helpText: 'Percentage of net income accumulated each period',
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
      label: 'Builder Basket Starting Amount',
      type: 'currency',
      required: false,
      defaultValue: 10_000_000,
      options: null,
      helpText: 'Initial capacity of the builder basket',
      placeholder: '10,000,000',
      showWhen: {
        field: 'hasBuilderBasket',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0 },
    },
    {
      id: 'builderMaximum',
      name: 'builderMaximum',
      label: 'Builder Basket Maximum',
      type: 'currency',
      required: false,
      defaultValue: 75_000_000,
      options: null,
      helpText: 'Maximum capacity of the builder basket',
      placeholder: '75,000,000',
      showWhen: {
        field: 'hasBuilderBasket',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0 },
    },

    // --- Events of Default ---
    {
      id: 'paymentDefaultGracePeriod',
      name: 'paymentDefaultGracePeriod',
      label: 'Payment Default Grace Period (days)',
      type: 'number',
      required: true,
      defaultValue: 5,
      options: null,
      helpText: 'Days after payment due before Event of Default',
      placeholder: '5',
      showWhen: null,
      validation: { min: 0, max: 30 },
    },
    {
      id: 'covenantDefaultGracePeriod',
      name: 'covenantDefaultGracePeriod',
      label: 'Covenant Default Grace Period (days)',
      type: 'number',
      required: true,
      defaultValue: 30,
      options: null,
      helpText: 'Days after covenant breach before Event of Default',
      placeholder: '30',
      showWhen: null,
      validation: { min: 0, max: 90 },
    },
    {
      id: 'crossDefaultThreshold',
      name: 'crossDefaultThreshold',
      label: 'Cross Default Threshold',
      type: 'currency',
      required: true,
      defaultValue: 10_000_000,
      options: null,
      helpText: 'External debt default amount that triggers cross-default',
      placeholder: '10,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
  ],

  validationRules: [
    {
      id: 'builder-max-gte-starting',
      fields: ['hasBuilderBasket', 'builderMaximum', 'builderStarting'],
      validate: (values) => {
        if (
          values.hasBuilderBasket &&
          (values.builderMaximum as number) < (values.builderStarting as number)
        ) {
          return 'Builder basket maximum must be greater than starting amount';
        }
        return null;
      },
      message: 'Builder basket maximum must be greater than starting amount',
    },
  ],

  codeTemplate: `// {{borrowerName}} — Revolving Credit Facility
// Generated by ProViso Template Library
// Facility Amount: \${{facilityAmount}}

// ==================== DEFINED TERMS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization
  EXCLUDING extraordinary_items

DEFINE TotalDebt AS
  funded_debt + capital_leases

DEFINE Leverage AS
  TotalDebt / EBITDA

DEFINE InterestCoverage AS
  EBITDA / interest_expense

// ==================== FINANCIAL COVENANTS ====================

COVENANT MaxLeverage
  REQUIRES Leverage <= {{maxLeverage}}
  TESTED {{covenantFrequency}}{{#if hasCureRight}}
  CURE EquityCure MAX_USES {{cureMaxUses}} OVER life_of_facility MAX_AMOUNT \${{cureMaxAmount}}{{/if}}
  BREACH -> UnmaturedDefault

COVENANT MinInterestCoverage
  REQUIRES InterestCoverage >= {{minInterestCoverage}}
  TESTED {{covenantFrequency}}{{#if hasCureRight}}
  CURE EquityCure MAX_USES {{cureMaxUses}} OVER life_of_facility{{/if}}
  BREACH -> UnmaturedDefault
{{#if hasLiquidityCovenant}}
COVENANT MinLiquidity
  REQUIRES cash >= {{minLiquidity}}
  TESTED {{covenantFrequency}}
{{/if}}
// ==================== BASKETS ====================

BASKET GeneralInvestments
  CAPACITY \${{generalInvestmentBasket}}

BASKET RestrictedPayments
  CAPACITY GreaterOf(\${{restrictedPaymentsBasket}}, {{rpBasketAssetPercentage}}% * total_assets)

BASKET CapEx
  CAPACITY \${{capExBasket}}

BASKET PermittedAcquisitions
  CAPACITY \${{permittedAcquisitionBasket}}
  SUBJECT TO NoDefault, ProFormaCompliance
{{#if hasGrowerBasket}}
// ==================== GROWER BASKETS ====================

BASKET EBITDAInvestments
  CAPACITY {{growerPercentage}}% * EBITDA
  FLOOR \${{growerFloor}}
  SUBJECT TO NoDefault
{{/if}}{{#if hasBuilderBasket}}
// ==================== BUILDER BASKETS ====================

BASKET RetainedEarningsBasket
  BUILDS_FROM {{builderPercentage}}% * net_income
  STARTING \${{builderStarting}}
  MAXIMUM \${{builderMaximum}}
  SUBJECT TO NoDefault
{{/if}}
// ==================== CONDITIONS ====================

CONDITION NoDefault AS
  NOT EXISTS(EventOfDefault) AND NOT EXISTS(UnmaturedDefault)

CONDITION ProFormaCompliance AS
  COMPLIANT(MaxLeverage) AND COMPLIANT(MinInterestCoverage)

// ==================== NEGATIVE COVENANTS ====================

PROHIBIT Investments
  EXCEPT WHEN
    | amount <= AVAILABLE(GeneralInvestments)
    | AND NoDefault

PROHIBIT Dividends
  EXCEPT WHEN
    | amount <= AVAILABLE(RestrictedPayments)
    | AND NoDefault
    | AND COMPLIANT(MaxLeverage)

PROHIBIT CapitalExpenditures
  EXCEPT WHEN
    | amount <= AVAILABLE(CapEx)

// ==================== EVENTS OF DEFAULT ====================

EVENT PaymentDefault
  TRIGGERS WHEN payment_due AND NOT payment_received
  GRACE_PERIOD {{paymentDefaultGracePeriod}} DAYS
  CONSEQUENCE EventOfDefault

EVENT CovenantDefault
  TRIGGERS WHEN NOT COMPLIANT(MaxLeverage) OR NOT COMPLIANT(MinInterestCoverage)
  GRACE_PERIOD {{covenantDefaultGracePeriod}} DAYS
  CONSEQUENCE EventOfDefault

EVENT CrossDefault
  TRIGGERS WHEN external_debt_default > {{crossDefaultThreshold}}
  CONSEQUENCE EventOfDefault`,

  wordTemplate: `This template generates ProViso code, not Word prose. Use element-level forms for document generation.`,
};

// =============================================================================
// DEAL TEMPLATE
// =============================================================================

export const corporateRevolverTemplate: DealTemplate = {
  id: 'corporate-revolver',
  name: 'Corporate Revolving Credit Facility',
  description:
    'Standard corporate revolver with maintenance covenants (leverage, interest coverage), investment and restricted payment baskets, grower/builder baskets, and events of default. Suitable for investment-grade and crossover credits.',
  industry: 'corporate',
  complexity: 'standard',
  icon: 'Building2',
  features: [
    'Leverage & interest coverage covenants',
    'Equity cure rights',
    'Fixed, grower, and builder baskets',
    'Negative covenants with exceptions',
    'Payment, covenant, and cross-default events',
  ],
  form: corporateRevolverForm,
};

export default corporateRevolverTemplate;
