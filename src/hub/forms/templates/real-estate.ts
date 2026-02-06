/**
 * ProViso Deal Template — Commercial Real Estate
 *
 * CRE loan facility with LTV, DSCR, and tenant concentration covenants.
 * Includes property-specific baskets, lease rollover tracking, and
 * reserve accounts typical of commercial mortgage-backed structures.
 *
 * Generates a complete .proviso file with:
 * - DEFINE blocks (NOI, DSCR, LTV, DebtYield, TenantConcentration)
 * - COVENANT blocks (LTV, DSCR, DebtYield, tenant concentration)
 * - BASKET blocks (CapEx, TI/LC, leasing costs)
 * - RESERVE blocks (replacement, TI/LC, tax/insurance escrow)
 * - CONDITION blocks (lease approval thresholds)
 * - EVENT blocks (payment, covenant, lease-specific defaults)
 */

import type { DealTemplate, FormDefinition } from '../types.js';

// =============================================================================
// FORM DEFINITION
// =============================================================================

const realEstateForm: FormDefinition = {
  id: 'template-real-estate',
  name: 'template-real-estate',
  displayName: 'Commercial Real Estate Loan',
  category: 'templates',
  elementType: 'template',
  description: 'CRE loan with LTV, DSCR, debt yield, and tenant concentration covenants',

  fields: [
    // --- Property Identity ---
    {
      id: 'propertyName',
      name: 'propertyName',
      label: 'Property / Borrower Name',
      type: 'text',
      required: true,
      defaultValue: 'Metro Office Tower LLC',
      options: null,
      helpText: 'Name of the property SPV or borrower',
      placeholder: 'e.g., Metro Office Tower LLC',
      showWhen: null,
      validation: null,
    },
    {
      id: 'loanAmount',
      name: 'loanAmount',
      label: 'Loan Amount',
      type: 'currency',
      required: true,
      defaultValue: 100_000_000,
      options: null,
      helpText: 'Total mortgage loan amount',
      placeholder: '100,000,000',
      showWhen: null,
      validation: { min: 1_000_000 },
    },
    {
      id: 'propertyType',
      name: 'propertyType',
      label: 'Property Type',
      type: 'select',
      required: true,
      defaultValue: 'office',
      options: [
        { value: 'office', label: 'Office', description: 'Commercial office building' },
        { value: 'retail', label: 'Retail', description: 'Shopping center or retail space' },
        { value: 'industrial', label: 'Industrial', description: 'Warehouse or logistics' },
        { value: 'multifamily', label: 'Multifamily', description: 'Residential apartments' },
        { value: 'mixed_use', label: 'Mixed Use', description: 'Combined retail, office, and/or residential' },
      ],
      helpText: null,
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'appraised_value',
      name: 'appraised_value',
      label: 'Appraised Value',
      type: 'currency',
      required: true,
      defaultValue: 150_000_000,
      options: null,
      helpText: 'Current appraised value of the property',
      placeholder: '150,000,000',
      showWhen: null,
      validation: { min: 1_000_000 },
    },

    // --- Financial Covenants ---
    {
      id: 'maxLTV',
      name: 'maxLTV',
      label: 'Maximum Loan-to-Value (%)',
      type: 'percentage',
      required: true,
      defaultValue: 65,
      options: null,
      helpText: 'Maximum LTV ratio (typical: 55%–75%)',
      placeholder: '65',
      showWhen: null,
      validation: { min: 20, max: 95 },
    },
    {
      id: 'minDSCR',
      name: 'minDSCR',
      label: 'Minimum DSCR',
      type: 'ratio',
      required: true,
      defaultValue: 1.25,
      options: null,
      helpText: 'Minimum Debt Service Coverage Ratio (typical: 1.15x–1.40x)',
      placeholder: '1.25',
      showWhen: null,
      validation: { min: 1.0, max: 3.0 },
    },
    {
      id: 'hasDebtYield',
      name: 'hasDebtYield',
      label: 'Include Debt Yield Covenant',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'NOI / Loan Amount — measures property return on debt',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'minDebtYield',
      name: 'minDebtYield',
      label: 'Minimum Debt Yield (%)',
      type: 'percentage',
      required: false,
      defaultValue: 8,
      options: null,
      helpText: 'Minimum NOI / Loan Amount (typical: 7%–10%)',
      placeholder: '8',
      showWhen: {
        field: 'hasDebtYield',
        operator: 'equals',
        value: true,
      },
      validation: { min: 1, max: 30 },
    },

    // --- Tenant Concentration ---
    {
      id: 'hasTenantConcentration',
      name: 'hasTenantConcentration',
      label: 'Include Tenant Concentration Limit',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'Limit single-tenant revenue concentration',
      placeholder: null,
      showWhen: null,
      validation: null,
    },
    {
      id: 'maxTenantConcentration',
      name: 'maxTenantConcentration',
      label: 'Max Single Tenant Revenue %',
      type: 'percentage',
      required: false,
      defaultValue: 30,
      options: null,
      helpText: 'Maximum percentage of gross revenue from any single tenant',
      placeholder: '30',
      showWhen: {
        field: 'hasTenantConcentration',
        operator: 'equals',
        value: true,
      },
      validation: { min: 10, max: 100 },
    },
    {
      id: 'minOccupancy',
      name: 'minOccupancy',
      label: 'Minimum Occupancy Rate (%)',
      type: 'percentage',
      required: true,
      defaultValue: 80,
      options: null,
      helpText: 'Minimum physical or economic occupancy (typical: 75%–90%)',
      placeholder: '80',
      showWhen: null,
      validation: { min: 50, max: 100 },
    },

    // --- Baskets ---
    {
      id: 'capExBasket',
      name: 'capExBasket',
      label: 'Capital Improvements Basket',
      type: 'currency',
      required: true,
      defaultValue: 5_000_000,
      options: null,
      helpText: 'Permitted capital expenditures without lender consent',
      placeholder: '5,000,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'tiLcBasket',
      name: 'tiLcBasket',
      label: 'TI/LC Basket',
      type: 'currency',
      required: true,
      defaultValue: 3_000_000,
      options: null,
      helpText: 'Tenant improvement and leasing commission allowance',
      placeholder: '3,000,000',
      showWhen: null,
      validation: { min: 0 },
    },

    // --- Reserves ---
    {
      id: 'replacementReserve',
      name: 'replacementReserve',
      label: 'Replacement Reserve (per sq ft/yr)',
      type: 'currency',
      required: true,
      defaultValue: 250_000,
      options: null,
      helpText: 'Annual funding for replacement reserve account',
      placeholder: '250,000',
      showWhen: null,
      validation: { min: 0 },
    },
    {
      id: 'hasTaxInsuranceEscrow',
      name: 'hasTaxInsuranceEscrow',
      label: 'Include Tax & Insurance Escrow',
      type: 'checkbox',
      required: false,
      defaultValue: true,
      options: null,
      helpText: 'Monthly escrow for property taxes and insurance premiums',
      placeholder: null,
      showWhen: null,
      validation: null,
    },

    // --- Lease Approval ---
    {
      id: 'majorLeaseThreshold',
      name: 'majorLeaseThreshold',
      label: 'Major Lease Approval Threshold',
      type: 'currency',
      required: true,
      defaultValue: 2_000_000,
      options: null,
      helpText: 'Annual rent above which lender approval is required for new leases',
      placeholder: '2,000,000',
      showWhen: null,
      validation: { min: 0 },
    },

    // --- Events of Default ---
    {
      id: 'paymentGracePeriod',
      name: 'paymentGracePeriod',
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
  ],

  validationRules: [
    {
      id: 'ltv-consistency',
      fields: ['loanAmount', 'appraised_value'],
      validate: (values) => {
        const loanAmount = values.loanAmount as number;
        const appraisedValue = values.appraised_value as number;
        if (appraisedValue > 0 && (loanAmount / appraisedValue) * 100 > 95) {
          return 'Loan amount exceeds 95% of appraised value';
        }
        return null;
      },
      message: 'Loan amount exceeds 95% of appraised value',
    },
  ],

  codeTemplate: `// {{propertyName}} — Commercial Real Estate Loan
// Generated by ProViso Template Library
// Loan Amount: \${{loanAmount}}
// Property Type: {{propertyType}}

// ==================== DEFINED TERMS ====================

DEFINE NOI AS
  gross_rental_income + other_income - operating_expenses - management_fees
  EXCLUDING extraordinary_items

DEFINE DebtService AS
  interest_expense + principal_repayment

DEFINE DSCR AS
  NOI / DebtService

DEFINE LTV AS
  outstanding_loan_balance / appraised_value

DEFINE DebtYield AS
  NOI / outstanding_loan_balance

DEFINE OccupancyRate AS
  leased_sqft / total_sqft

DEFINE TenantConcentration AS
  largest_tenant_revenue / gross_rental_income

// ==================== FINANCIAL COVENANTS ====================

COVENANT MaxLTV
  REQUIRES LTV <= {{maxLTVDecimal}}
  TESTED QUARTERLY
  BREACH -> UnmaturedDefault

COVENANT MinDSCR
  REQUIRES DSCR >= {{minDSCR}}
  TESTED QUARTERLY
  BREACH -> UnmaturedDefault
{{#if hasDebtYield}}
COVENANT MinDebtYield
  REQUIRES DebtYield >= {{minDebtYieldDecimal}}
  TESTED QUARTERLY
  BREACH -> UnmaturedDefault
{{/if}}
COVENANT MinOccupancy
  REQUIRES OccupancyRate >= {{minOccupancyDecimal}}
  TESTED QUARTERLY
{{#if hasTenantConcentration}}
COVENANT MaxTenantConcentration
  REQUIRES TenantConcentration <= {{maxTenantConcentrationDecimal}}
  TESTED QUARTERLY
{{/if}}
// ==================== BASKETS ====================

BASKET CapitalImprovements
  CAPACITY \${{capExBasket}}

BASKET TenantImprovements
  CAPACITY \${{tiLcBasket}}
  SUBJECT TO NoDefault

// ==================== RESERVE ACCOUNTS ====================

RESERVE ReplacementReserve
  TARGET \${{replacementReserve}}
  MINIMUM $0
  FUNDED_BY operating_cashflow
  RELEASED_FOR capital_improvements
{{#if hasTaxInsuranceEscrow}}
RESERVE TaxInsuranceEscrow
  TARGET annual_tax_and_insurance
  MINIMUM $0
  FUNDED_BY monthly_escrow
  RELEASED_TO tax_insurance_payments
{{/if}}
// ==================== CONDITIONS ====================

CONDITION NoDefault AS
  NOT EXISTS(EventOfDefault) AND NOT EXISTS(UnmaturedDefault)

CONDITION MajorLeaseApproval AS
  lease_annual_rent > {{majorLeaseThreshold}}

// ==================== NEGATIVE COVENANTS ====================

PROHIBIT CapitalExpenditures
  EXCEPT WHEN
    | amount <= AVAILABLE(CapitalImprovements)
    | AND NoDefault

PROHIBIT TenantAllowances
  EXCEPT WHEN
    | amount <= AVAILABLE(TenantImprovements)
    | AND NoDefault

// ==================== EVENTS OF DEFAULT ====================

EVENT PaymentDefault
  TRIGGERS WHEN payment_due AND NOT payment_received
  GRACE_PERIOD {{paymentGracePeriod}} DAYS
  CONSEQUENCE EventOfDefault

EVENT DSCRDefault
  TRIGGERS WHEN NOT COMPLIANT(MinDSCR)
  GRACE_PERIOD 30 DAYS
  CONSEQUENCE EventOfDefault

EVENT OccupancyDefault
  TRIGGERS WHEN OccupancyRate < {{occupancyDefaultDecimal}}
  GRACE_PERIOD 90 DAYS
  CONSEQUENCE EventOfDefault`,

  wordTemplate: `This template generates ProViso code, not Word prose. Use element-level forms for document generation.`,
};

// =============================================================================
// DEAL TEMPLATE
// =============================================================================

export const realEstateTemplate: DealTemplate = {
  id: 'real-estate',
  name: 'Commercial Real Estate Loan',
  description:
    'CRE mortgage loan with LTV, DSCR, debt yield, and tenant concentration covenants. Includes capital improvement and TI/LC baskets, replacement reserves, tax/insurance escrow, and lease approval thresholds. Suitable for office, retail, industrial, and multifamily properties.',
  industry: 'real_estate',
  complexity: 'standard',
  icon: 'Building',
  features: [
    'LTV, DSCR, and debt yield covenants',
    'Tenant concentration limits',
    'Minimum occupancy requirements',
    'Capital improvement and TI/LC baskets',
    'Replacement and escrow reserve accounts',
    'Major lease approval conditions',
  ],
  form: realEstateForm,
};

export default realEstateTemplate;
