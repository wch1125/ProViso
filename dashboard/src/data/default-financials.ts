/**
 * Default financial data for dashboard initialization.
 * Desert Sun Solar Project - with near-breach tension for demo impact.
 *
 * Tension points:
 * - TotalLeverage at 4.35x vs 4.50x threshold (97%)
 * - Interest coverage near minimum
 */

export const DEFAULT_FINANCIALS = {
  // Income statement - adjusted for near-breach leverage
  net_income: 16_000_000,
  interest_expense: 14_000_000,
  tax_expense: 4_500_000,
  depreciation: 26_000_000,
  amortization: 2_500_000,

  // Debt structure - high leverage for tension
  senior_debt: 190_000_000,
  subordinated_debt: 28_000_000,
  senior_interest: 9_500_000,
  senior_principal: 6_000_000,

  // Project metrics
  total_project_cost: 280_000_000,
  equity_contributed: 84_000_000,

  // Cash flow items
  monthly_debt_service: 1_300_000,
  annual_capex_budget: 2_600_000,
  operating_expenses: 5_200_000,
  distributions: 6_000_000,
  Revenue: 38_000_000,

  // Balance sheet
  total_assets: 295_000_000,

  // Performance data (for v2.1 industry constructs)
  annual_gwh: 475,
  availability_pct: 98.2,
};

/**
 * Project metadata (not used by interpreter, but useful for display)
 */
export const DEFAULT_PROJECT_INFO = {
  name: 'Desert Sun Solar Project',
  facility: '$280M Construction + Term Loan',
  sponsor: 'Desert Sun Holdings LLC',
  borrower: 'Desert Sun Project Co LLC',
};

/**
 * Phase timeline info
 */
export const DEFAULT_PHASE_INFO = {
  current: 'Construction',
  constructionStart: '2025-01-15',
  codTarget: '2026-04-30',
  maturity: '2046-06-30',
};

/**
 * Tension points for demo narrative
 */
export const DEFAULT_TENSION_POINTS = [
  {
    type: 'near_breach',
    element: 'TotalLeverage',
    description: 'Leverage at 4.35x vs 4.50x threshold (97%)',
    severity: 'warning',
  },
  {
    type: 'at_risk_milestone',
    element: 'SubstationComplete',
    description: '5 days until longstop date',
    severity: 'danger',
  },
  {
    type: 'cure_used',
    element: 'InterestCoverage',
    description: '$3M equity cure applied in Q2 2025 (1 of 3 uses)',
    severity: 'warning',
  },
];
