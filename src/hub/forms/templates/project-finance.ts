/**
 * ProViso Deal Template — Project Finance
 *
 * Non-recourse project finance facility with construction and operations phases,
 * milestone tracking, reserve accounts, waterfall distribution, and conditions
 * precedent. Designed for infrastructure, energy, and industrial projects.
 *
 * Generates a complete .proviso file with:
 * - DEFINE blocks (DSCR, LLCR, project-specific metrics)
 * - PHASE blocks (Construction, Operations, Tail)
 * - MILESTONE blocks with longstop dates
 * - COVENANT blocks (DSCR, LLCR — phase-specific)
 * - RESERVE blocks (DSRA, MRA, construction contingency)
 * - WATERFALL blocks (standard project finance waterfall)
 * - CONDITIONS_PRECEDENT for initial and subsequent draws
 */

import type { DealTemplate, FormDefinition } from '../types.js';

// =============================================================================
// FORM DEFINITION
// =============================================================================

const projectFinanceForm: FormDefinition = {
  id: 'template-project-finance',
  name: 'template-project-finance',
  displayName: 'Project Finance Facility',
  category: 'templates',
  elementType: 'template',
  description: 'Non-recourse project finance with phases, milestones, reserves, and waterfall',

  fields: [
    // --- Project Identity ---
    {
      id: 'projectName',
      name: 'projectName',
      label: 'Project Name',
      type: 'text',
      required: true,
      defaultValue: 'Greenfield Solar Project',
      options: null,
      helpText: 'Name of the project entity / SPV',
      placeholder: 'e.g., Greenfield Solar Project',
      showWhen: null,
      validation: null,
    },
    {
      id: 'facilityAmount',
      name: 'facilityAmount',
      label: 'Facility Amount',
      type: 'currency',
      required: true,
      defaultValue: 200_000_000,
      options: null,
      helpText: 'Total project finance facility commitment',
      placeholder: '200,000,000',
      showWhen: null,
      validation: { min: 1_000_000 },
    },
    {
      id: 'projectType',
      name: 'projectType',
      label: 'Project Type',
      type: 'select',
      required: true,
      defaultValue: 'solar',
      options: [
        { value: 'solar', label: 'Solar', description: 'Solar photovoltaic generation' },
        { value: 'wind', label: 'Wind', description: 'Onshore or offshore wind generation' },
        { value: 'infrastructure', label: 'Infrastructure', description: 'Roads, bridges, water treatment' },
        { value: 'industrial', label: 'Industrial', description: 'Manufacturing or processing facility' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: null,
      validation: null,
    },

    // --- Phase Configuration ---
    {
      id: 'constructionEndDate',
      name: 'constructionEndDate',
      label: 'Target Construction Completion',
      type: 'date',
      required: true,
      defaultValue: '2027-06-30',
      options: null,
      helpText: 'Expected date of commercial operations date (COD)',
      placeholder: 'YYYY-MM-DD',
      showWhen: null,
      validation: null,
    },
    {
      id: 'constructionLongstop',
      name: 'constructionLongstop',
      label: 'Construction Longstop Date',
      type: 'date',
      required: true,
      defaultValue: '2027-12-31',
      options: null,
      helpText: 'Backstop date — event of default if not met',
      placeholder: 'YYYY-MM-DD',
      showWhen: null,
      validation: null,
    },
    {
      id: 'tailEndDate',
      name: 'tailEndDate',
      label: 'Facility Maturity Date',
      type: 'date',
      required: true,
      defaultValue: '2045-12-31',
      options: null,
      helpText: 'Final maturity of the facility',
      placeholder: 'YYYY-MM-DD',
      showWhen: null,
      validation: null,
    },

    // --- Financial Covenants ---
    {
      id: 'minDSCR',
      name: 'minDSCR',
      label: 'Minimum DSCR',
      type: 'ratio',
      required: true,
      defaultValue: 1.20,
      options: null,
      helpText: 'Minimum Debt Service Coverage Ratio during operations (typical: 1.10x–1.40x)',
      placeholder: '1.20',
      showWhen: null,
      validation: { min: 1.0, max: 3.0 },
    },
    {
      id: 'lockupDSCR',
      name: 'lockupDSCR',
      label: 'Distribution Lock-Up DSCR',
      type: 'ratio',
      required: true,
      defaultValue: 1.10,
      options: null,
      helpText: 'DSCR below which distributions to equity are locked up',
      placeholder: '1.10',
      showWhen: null,
      validation: { min: 1.0, max: 3.0 },
    },
    {
      id: 'defaultDSCR',
      name: 'defaultDSCR',
      label: 'Default DSCR',
      type: 'ratio',
      required: true,
      defaultValue: 1.05,
      options: null,
      helpText: 'DSCR below which triggers an Event of Default',
      placeholder: '1.05',
      showWhen: null,
      validation: { min: 1.0, max: 2.0 },
    },
    {
      id: 'hasLLCR',
      name: 'hasLLCR',
      label: 'Include Loan Life Coverage Ratio',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'NPV of future cash flows / outstanding debt',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'minLLCR',
      name: 'minLLCR',
      label: 'Minimum LLCR',
      type: 'ratio',
      required: false,
      defaultValue: 1.30,
      options: null,
      helpText: 'Minimum Loan Life Coverage Ratio (typical: 1.20x–1.50x)',
      placeholder: '1.30',
      showWhen: {
        field: 'hasLLCR',
        operator: 'equals',
        value: true,
      },
      validation: { min: 1.0, max: 3.0 },
    },

    // --- Milestones ---
    {
      id: 'milestone1Name',
      name: 'milestone1Name',
      label: 'Milestone 1 Name',
      type: 'text',
      required: true,
      defaultValue: 'FoundationComplete',
      options: null,
      helpText: 'First construction milestone',
      placeholder: 'e.g., FoundationComplete',
      showWhen: null,
      validation: {
        pattern: '^[A-Za-z][A-Za-z0-9_]*$',
        patternMessage: 'Must start with a letter, letters/numbers/underscores only',
      },
    },
    {
      id: 'milestone1Target',
      name: 'milestone1Target',
      label: 'Milestone 1 Target Date',
      type: 'date',
      required: true,
      defaultValue: '2026-06-30',
      options: null,
      helpText: 'Target completion date for milestone 1',
      placeholder: 'YYYY-MM-DD',
      showWhen: null,
      validation: null,
    },
    {
      id: 'milestone1Longstop',
      name: 'milestone1Longstop',
      label: 'Milestone 1 Longstop Date',
      type: 'date',
      required: true,
      defaultValue: '2026-09-30',
      options: null,
      helpText: 'Backstop date for milestone 1',
      placeholder: 'YYYY-MM-DD',
      showWhen: null,
      validation: null,
    },
    {
      id: 'milestone2Name',
      name: 'milestone2Name',
      label: 'Milestone 2 Name',
      type: 'text',
      required: true,
      defaultValue: 'MechanicalCompletion',
      options: null,
      helpText: 'Second construction milestone',
      placeholder: 'e.g., MechanicalCompletion',
      showWhen: null,
      validation: {
        pattern: '^[A-Za-z][A-Za-z0-9_]*$',
        patternMessage: 'Must start with a letter, letters/numbers/underscores only',
      },
    },
    {
      id: 'milestone2Target',
      name: 'milestone2Target',
      label: 'Milestone 2 Target Date',
      type: 'date',
      required: true,
      defaultValue: '2027-03-31',
      options: null,
      helpText: 'Target completion date for milestone 2',
      placeholder: 'YYYY-MM-DD',
      showWhen: null,
      validation: null,
    },
    {
      id: 'milestone2Longstop',
      name: 'milestone2Longstop',
      label: 'Milestone 2 Longstop Date',
      type: 'date',
      required: true,
      defaultValue: '2027-06-30',
      options: null,
      helpText: 'Backstop date for milestone 2',
      placeholder: 'YYYY-MM-DD',
      showWhen: null,
      validation: null,
    },

    // --- Reserve Accounts ---
    {
      id: 'dsraMonths',
      name: 'dsraMonths',
      label: 'DSRA Target (months of debt service)',
      type: 'number',
      required: true,
      defaultValue: 6,
      options: null,
      helpText: 'Debt Service Reserve Account target in months of debt service',
      placeholder: '6',
      showWhen: null,
      validation: { min: 1, max: 12 },
    },
    {
      id: 'dsraMinimum',
      name: 'dsraMinimum',
      label: 'DSRA Minimum Balance',
      type: 'currency',
      required: true,
      defaultValue: 5_000_000,
      options: null,
      helpText: 'Minimum balance that must be maintained in the DSRA',
      placeholder: '5,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'hasMRA',
      name: 'hasMRA',
      label: 'Include Maintenance Reserve Account',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'Reserve for major maintenance and capital repairs',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'mraTarget',
      name: 'mraTarget',
      label: 'MRA Target Balance',
      type: 'currency',
      required: false,
      defaultValue: 3_000_000,
      options: null,
      helpText: 'Target balance for the maintenance reserve',
      placeholder: '3,000,000',
      showWhen: {
        field: 'hasMRA',
        operator: 'equals',
        value: true,
      },
      validation: { min: 0 },
    },

    // --- Waterfall Configuration ---
    {
      id: 'equityDistributionTest',
      name: 'equityDistributionTest',
      label: 'Equity Distribution Test',
      type: 'select',
      required: true,
      defaultValue: 'dscr_and_reserves',
      options: [
        { value: 'dscr_and_reserves', label: 'DSCR + Reserves Funded', description: 'Standard — both DSCR and reserve tests must pass' },
        { value: 'dscr_only', label: 'DSCR Only', description: 'Distributions permitted if DSCR exceeds lockup threshold' },
        { value: 'no_default', label: 'No Default Only', description: 'Distributions permitted if no event of default exists' },
      ],
      helpText: 'When can equity distributions be made?',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
  ],

  validationRules: [
    {
      id: 'dscr-ordering',
      fields: ['minDSCR', 'lockupDSCR', 'defaultDSCR'],
      validate: (values) => {
        const min = values.minDSCR as number;
        const lockup = values.lockupDSCR as number;
        const dflt = values.defaultDSCR as number;
        if (min < lockup) {
          return 'Minimum DSCR must be ≥ lock-up DSCR';
        }
        if (lockup < dflt) {
          return 'Lock-up DSCR must be ≥ default DSCR';
        }
        return null;
      },
      message: 'DSCR thresholds must be ordered: Minimum ≥ Lock-up ≥ Default',
    },
  ],

  codeTemplate: `// {{projectName}} — Project Finance Facility
// Generated by ProViso Template Library
// Facility Amount: \${{facilityAmount}}
// Project Type: {{projectType}}

// ==================== DEFINED TERMS ====================

DEFINE EBITDA AS
  revenue - operating_expenses
  EXCLUDING extraordinary_items

DEFINE DebtService AS
  interest_expense + principal_repayment

DEFINE DSCR AS
  EBITDA / DebtService

DEFINE TotalDebt AS
  funded_debt + capital_leases
{{#if hasLLCR}}
DEFINE LLCR AS
  npv_future_cashflows / TotalDebt
{{/if}}
// ==================== PHASES ====================

PHASE Construction
  UNTIL "{{constructionEndDate}}"
  COVENANTS SUSPENDED MaxLeverage
  REQUIRED {{milestone1Name}}, {{milestone2Name}}

PHASE Operations
  FROM "{{constructionEndDate}}"
  COVENANTS ACTIVE MinDSCR, DistributionLockup{{#if hasLLCR}}, MinLLCR{{/if}}

PHASE Tail
  FROM "{{tailEndDate}}"

// ==================== TRANSITIONS ====================

TRANSITION ConstructionToOperations
  ALL_OF
    COMPLETE({{milestone1Name}})
    COMPLETE({{milestone2Name}})

// ==================== MILESTONES ====================

MILESTONE {{milestone1Name}}
  TARGET "{{milestone1Target}}"
  LONGSTOP "{{milestone1Longstop}}"
  TRIGGERS ConstructionProgress

MILESTONE {{milestone2Name}}
  TARGET "{{milestone2Target}}"
  LONGSTOP "{{milestone2Longstop}}"
  REQUIRES {{milestone1Name}}
  TRIGGERS SubstantialCompletion

// ==================== FINANCIAL COVENANTS ====================

COVENANT MinDSCR
  REQUIRES DSCR >= {{minDSCR}}
  TESTED QUARTERLY
  BREACH -> UnmaturedDefault

COVENANT DistributionLockup
  REQUIRES DSCR >= {{lockupDSCR}}
  TESTED QUARTERLY
{{#if hasLLCR}}
COVENANT MinLLCR
  REQUIRES LLCR >= {{minLLCR}}
  TESTED SEMI_ANNUALLY
  BREACH -> UnmaturedDefault
{{/if}}
// ==================== RESERVE ACCOUNTS ====================

RESERVE DSRA
  TARGET {{dsraMonths}} * DebtService
  MINIMUM \${{dsraMinimum}}
  FUNDED_BY operating_cashflow
  RELEASED_TO DebtService
{{#if hasMRA}}
RESERVE MRA
  TARGET \${{mraTarget}}
  MINIMUM $0
  FUNDED_BY operating_cashflow
  RELEASED_FOR maintenance_capex
{{/if}}
// ==================== WATERFALL ====================

WATERFALL OperatingCashflow
  TIER 1 PAY operating_expenses FROM revenue
  TIER 2 PAY DebtService FROM operating_cashflow SHORTFALL DrawDSRA
  TIER 3 PAY dsra_funding FROM operating_cashflow UNTIL DSRA >= TARGET
{{#if hasMRA}}  TIER 4 PAY mra_funding FROM operating_cashflow UNTIL MRA >= TARGET
{{/if}}  TIER 5 PAY equity_distribution FROM operating_cashflow IF DistributionPermitted

// ==================== CONDITIONS ====================

CONDITION NoDefault AS
  NOT EXISTS(EventOfDefault) AND NOT EXISTS(UnmaturedDefault)

CONDITION DistributionPermitted AS
  DSCR >= {{lockupDSCR}} AND NoDefault

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialDraw
  CP PermitsObtained
    DESCRIPTION "All required permits and approvals obtained"
    RESPONSIBLE Borrower
    STATUS pending
  CP InsuranceInPlace
    DESCRIPTION "Required insurance policies in effect"
    RESPONSIBLE Borrower
    STATUS pending
  CP EquityContribution
    DESCRIPTION "Sponsor equity contribution funded"
    RESPONSIBLE Sponsor
    STATUS pending
  CP IndependentEngineerReport
    DESCRIPTION "Independent engineer report delivered"
    RESPONSIBLE IndependentEngineer
    STATUS pending

// ==================== EVENTS OF DEFAULT ====================

EVENT PaymentDefault
  TRIGGERS WHEN payment_due AND NOT payment_received
  GRACE_PERIOD 5 DAYS
  CONSEQUENCE EventOfDefault

EVENT DSCRDefault
  TRIGGERS WHEN DSCR < {{defaultDSCR}}
  GRACE_PERIOD 30 DAYS
  CONSEQUENCE EventOfDefault

EVENT MilestoneDefault
  TRIGGERS WHEN milestone_longstop_breached
  CONSEQUENCE EventOfDefault`,

  wordTemplate: `This template generates ProViso code, not Word prose. Use element-level forms for document generation.`,
};

// =============================================================================
// DEAL TEMPLATE
// =============================================================================

export const projectFinanceTemplate: DealTemplate = {
  id: 'project-finance',
  name: 'Project Finance Facility',
  description:
    'Non-recourse project finance with construction and operations phases, milestone tracking, DSCR/LLCR covenants, reserve accounts (DSRA, MRA), waterfall distribution, and conditions precedent. Ideal for energy, infrastructure, and industrial projects.',
  industry: 'project_finance',
  complexity: 'advanced',
  icon: 'Zap',
  features: [
    'Construction → Operations → Tail phases',
    'Milestone tracking with longstop dates',
    'DSCR & LLCR covenants',
    'Distribution lock-up mechanism',
    'DSRA and MRA reserve accounts',
    'Waterfall cash distribution',
    'Conditions precedent for draws',
  ],
  form: projectFinanceForm,
};

export default projectFinanceTemplate;
