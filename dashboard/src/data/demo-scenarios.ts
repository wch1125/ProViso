/**
 * Demo Scenarios for ProViso Public Demo
 *
 * Each scenario includes:
 * - ProViso code defining the agreement structure
 * - Financial data with "tension points" to demonstrate value
 * - 6 quarters of historical compliance data
 * - Metadata for display
 *
 * Tension points:
 * - Near-breach covenant (92-97% of threshold)
 * - At-risk milestone (5-10 days to longstop)
 * - Recently used cure (demonstrates cure mechanics)
 */

import type { SimpleFinancialData } from '@proviso/types.js';

// =============================================================================
// TYPES
// =============================================================================

export interface DemoScenario {
  id: string;
  name: string;
  facility: string;
  sponsor: string;
  borrower: string;
  code: string;
  financials: SimpleFinancialData;
  historicalData: HistoricalPeriod[];
  metadata: ScenarioMetadata;
}

export interface HistoricalPeriod {
  period: string;
  periodEnd: string;
  data: SimpleFinancialData;
  complianceStatus: 'compliant' | 'cured' | 'breach';
  cureUsed?: string;
}

export interface ScenarioMetadata {
  industry: 'solar' | 'wind' | 'corporate';
  tensionPoints: TensionPoint[];
  currentDate: string;
  phaseInfo: {
    current: string;
    startDate: string;
    targetDate: string;
    maturity: string;
  };
}

export interface TensionPoint {
  type: 'near_breach' | 'at_risk_milestone' | 'cure_used' | 'reserve_low';
  element: string;
  description: string;
  severity: 'warning' | 'danger';
}

// =============================================================================
// SOLAR UTILITY SCENARIO
// 200MW Utility-Scale Solar with ITC Tax Equity
// =============================================================================

const solarCode = `// Desert Sun Solar Project
// $280M Construction + Term Loan
// ProViso v2.1

// ==================== PHASES ====================

PHASE Construction
  UNTIL COD_Achieved
  COVENANTS SUSPENDED TotalLeverage, MinDSCR
  REQUIRED MinEquityContribution

PHASE Operations
  FROM COD_Achieved
  COVENANTS ACTIVE TotalLeverage, SeniorLeverage, InterestCoverage, MinDSCR

TRANSITION COD_Achieved
  WHEN ALL_OF(
    SubstantialCompletion,
    GridSynchronization,
    FinalInspection
  )

// ==================== MILESTONES ====================

MILESTONE SitePrepComplete
  TARGET 2025-03-15
  LONGSTOP 2025-05-15
  TRIGGERS Draw2Available

MILESTONE PileInstallation
  TARGET 2025-06-30
  LONGSTOP 2025-09-30
  REQUIRES SitePrepComplete
  TRIGGERS Draw3Available

MILESTONE TrackerInstallation
  TARGET 2025-09-30
  LONGSTOP 2025-12-31
  REQUIRES PileInstallation

MILESTONE ModuleInstallation
  TARGET 2025-12-15
  LONGSTOP 2026-03-15
  REQUIRES TrackerInstallation
  TRIGGERS Draw4Available

MILESTONE InverterCommissioning
  TARGET 2026-02-28
  LONGSTOP 2026-05-31
  REQUIRES ModuleInstallation

// AT-RISK: Only 5 days until longstop!
MILESTONE SubstationComplete
  TARGET 2026-01-31
  LONGSTOP 2026-02-10
  REQUIRES TrackerInstallation
  TRIGGERS SubstationCertification

MILESTONE GridSynchronization
  TARGET 2026-04-15
  LONGSTOP 2026-07-15
  REQUIRES ALL_OF(InverterCommissioning, SubstationComplete)

MILESTONE SubstantialCompletion
  TARGET 2026-04-30
  LONGSTOP 2026-07-31
  REQUIRES ALL_OF(GridSynchronization, FinalInspection)
  TRIGGERS COD_Achieved

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization

DEFINE TotalDebt AS
  senior_debt + subordinated_debt

DEFINE SeniorDebt AS
  senior_debt

DEFINE DebtService AS
  senior_interest + senior_principal

DEFINE DSCR AS
  EBITDA / DebtService

DEFINE Leverage AS
  TotalDebt / EBITDA

DEFINE SeniorLeverage AS
  SeniorDebt / EBITDA

// ==================== COVENANTS ====================

// NEAR-BREACH: Leverage at 4.35x vs 4.50x threshold (97%)
COVENANT TotalLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY

COVENANT SeniorLeverage
  REQUIRES SeniorLeverage <= 3.50
  TESTED QUARTERLY

COVENANT InterestCoverage
  REQUIRES EBITDA / interest_expense >= 2.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility

COVENANT MinDSCR
  REQUIRES DSCR >= 1.25
  TESTED QUARTERLY

COVENANT MinEquityContribution
  REQUIRES equity_contributed >= 0.30 * total_project_cost
  TESTED MONTHLY

// ==================== RESERVES ====================

RESERVE DebtServiceReserve
  TARGET 6 * monthly_debt_service
  MINIMUM 3 * monthly_debt_service
  FUNDED_BY Waterfall, EquityContribution
  RELEASED_TO Waterfall

RESERVE MaintenanceReserve
  TARGET annual_capex_budget
  MINIMUM 0.5 * annual_capex_budget
  FUNDED_BY Waterfall
  RELEASED_FOR PermittedCapEx

// ==================== WATERFALL ====================

WATERFALL OperatingWaterfall
  FREQUENCY monthly

  TIER 1 "Operating Expenses"
    PAY operating_expenses
    FROM Revenue

  TIER 2 "Senior Debt Service"
    PAY senior_interest + senior_principal
    FROM REMAINDER
    SHORTFALL -> DebtServiceReserve

  TIER 3 "DSRA Replenishment"
    PAY TO DebtServiceReserve
    UNTIL DebtServiceReserve >= 6 * monthly_debt_service
    FROM REMAINDER

  TIER 4 "Maintenance Reserve"
    PAY TO MaintenanceReserve
    UNTIL MaintenanceReserve >= annual_capex_budget
    FROM REMAINDER

  TIER 5 "Distributions"
    IF DSCR >= 1.50
    PAY distributions
    FROM REMAINDER

// ==================== TAX EQUITY ====================

TAX_EQUITY_STRUCTURE SolarPartnership
  STRUCTURE_TYPE partnership_flip
  TAX_INVESTOR "Tax Equity Fund LP"
  SPONSOR "Desert Sun Holdings LLC"
  TAX_CREDIT_ALLOCATION 99% investor, 1% sponsor
  DEPRECIATION_ALLOCATION 99% investor, 1% sponsor
  CASH_ALLOCATION 10% investor, 90% sponsor
  TARGET_RETURN 8.0%
  BUYOUT_PRICE $5_000_000

TAX_CREDIT SolarITC
  CREDIT_TYPE itc
  RATE 30%
  ADDER domestic_content 10%
  ADDER energy_community 10%
  ELIGIBLE_BASIS $240_000_000
  VESTING_PERIOD 5 YEARS
  RECAPTURE_RISK 20% per year

DEPRECIATION_SCHEDULE SolarMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $240_000_000
  BONUS_DEPRECIATION 60%

FLIP_EVENT TargetReturnFlip
  TRIGGER target_return
  TARGET_RETURN 8.0%
  PRE_FLIP_ALLOCATION 99% investor, 1% sponsor
  POST_FLIP_ALLOCATION 5% investor, 95% sponsor
  BUYOUT_OPTION fair_market_value

// ==================== TECHNICAL MILESTONES ====================

TECHNICAL_MILESTONE PileProgress
  TARGET 2025-06-30
  LONGSTOP 2025-09-30
  MEASUREMENT "piles driven"
  TARGET_VALUE 45000
  CURRENT_VALUE 38500
  PROGRESS_METRIC 85.6%

TECHNICAL_MILESTONE ModuleProgress
  TARGET 2025-12-15
  LONGSTOP 2026-03-15
  MEASUREMENT "MW installed"
  TARGET_VALUE 200
  CURRENT_VALUE 140
  PROGRESS_METRIC 70%

// ==================== PERFORMANCE GUARANTEES ====================

PERFORMANCE_GUARANTEE AnnualProduction
  METRIC annual_gwh
  P50 520
  P75 495
  P90 470
  P99 440
  GUARANTEE_PERIOD 10 YEARS
  SHORTFALL_RATE $50 per MWh

PERFORMANCE_GUARANTEE AvailabilityGuarantee
  METRIC availability_pct
  P50 99.0
  P75 98.5
  P90 97.5
  P99 96.0
  GUARANTEE_PERIOD 25 YEARS

// ==================== DEGRADATION ====================

DEGRADATION_SCHEDULE PanelDegradation
  ASSET_TYPE "bifacial_mono_perc"
  INITIAL_CAPACITY 200
  YEAR_1_DEGRADATION 2.0%
  ANNUAL_DEGRADATION 0.4%
  MINIMUM_CAPACITY 80%
  AFFECTS annual_gwh

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"

  CP ExecutedCreditAgreement
    DESCRIPTION "Executed Credit Agreement and all Loan Documents"
    RESPONSIBLE Agent
    STATUS satisfied

  CP LegalOpinions
    DESCRIPTION "Opinions of Borrower's Counsel and Local Counsel"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP EquityContribution
    DESCRIPTION "Evidence of Initial Equity Contribution"
    RESPONSIBLE Sponsor
    STATUS satisfied
    SATISFIES MinEquityContribution

  CP InsuranceCertificates
    DESCRIPTION "Evidence of Required Insurance Coverage"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP TaxEquityDocuments
    DESCRIPTION "Executed Tax Equity Partnership Agreement"
    RESPONSIBLE TaxCounsel
    STATUS satisfied
`;

const solarFinancials: SimpleFinancialData = {
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

  // Performance data
  annual_gwh: 475,
  availability_pct: 98.2,
};

// Historical data showing Q2 2025 cure usage
const solarHistoricalData: HistoricalPeriod[] = [
  {
    period: 'Q4 2024',
    periodEnd: '2024-12-31',
    data: {
      net_income: 14_500_000,
      interest_expense: 13_800_000,
      tax_expense: 4_200_000,
      depreciation: 25_500_000,
      amortization: 2_400_000,
      senior_debt: 195_000_000,
      subordinated_debt: 30_000_000,
      senior_interest: 9_800_000,
      senior_principal: 5_800_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q1 2025',
    periodEnd: '2025-03-31',
    data: {
      net_income: 15_200_000,
      interest_expense: 13_900_000,
      tax_expense: 4_400_000,
      depreciation: 25_800_000,
      amortization: 2_450_000,
      senior_debt: 193_000_000,
      subordinated_debt: 29_000_000,
      senior_interest: 9_650_000,
      senior_principal: 5_900_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q2 2025',
    periodEnd: '2025-06-30',
    data: {
      // Weak quarter - breach cured
      net_income: 12_800_000,
      interest_expense: 14_100_000,
      tax_expense: 3_800_000,
      depreciation: 26_000_000,
      amortization: 2_500_000,
      senior_debt: 192_000_000,
      subordinated_debt: 28_500_000,
      senior_interest: 9_600_000,
      senior_principal: 6_000_000,
    },
    complianceStatus: 'cured',
    cureUsed: 'InterestCoverage - $3M equity cure applied',
  },
  {
    period: 'Q3 2025',
    periodEnd: '2025-09-30',
    data: {
      net_income: 15_800_000,
      interest_expense: 14_000_000,
      tax_expense: 4_600_000,
      depreciation: 26_000_000,
      amortization: 2_500_000,
      senior_debt: 191_000_000,
      subordinated_debt: 28_200_000,
      senior_interest: 9_550_000,
      senior_principal: 6_000_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q4 2025',
    periodEnd: '2025-12-31',
    data: {
      net_income: 16_200_000,
      interest_expense: 14_000_000,
      tax_expense: 4_700_000,
      depreciation: 26_000_000,
      amortization: 2_500_000,
      senior_debt: 190_500_000,
      subordinated_debt: 28_000_000,
      senior_interest: 9_500_000,
      senior_principal: 6_000_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q1 2026',
    periodEnd: '2026-01-31', // Current - partial quarter
    data: solarFinancials,
    complianceStatus: 'compliant',
  },
];

const solarMetadata: ScenarioMetadata = {
  industry: 'solar',
  tensionPoints: [
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
  ],
  currentDate: '2026-02-05',
  phaseInfo: {
    current: 'Construction',
    startDate: '2025-01-15',
    targetDate: '2026-04-30',
    maturity: '2046-06-30',
  },
};

export const solarScenario: DemoScenario = {
  id: 'solar-demo',
  name: 'Desert Sun Solar Project',
  facility: '$280M Construction + Term Loan',
  sponsor: 'Desert Sun Holdings LLC',
  borrower: 'Desert Sun Project Co LLC',
  code: solarCode,
  financials: solarFinancials,
  historicalData: solarHistoricalData,
  metadata: solarMetadata,
};

// =============================================================================
// WIND ONSHORE SCENARIO
// 150MW Wind Farm with PTC Tax Credits
// =============================================================================

const windCode = `// Prairie Wind Farm
// $200M Construction + Term Loan
// ProViso v2.1

// ==================== PHASES ====================

PHASE Construction
  UNTIL COD_Achieved
  COVENANTS SUSPENDED TotalLeverage, MinDSCR
  REQUIRED MinEquityContribution

PHASE Operations
  FROM COD_Achieved
  COVENANTS ACTIVE TotalLeverage, SeniorLeverage, InterestCoverage, MinDSCR, CurtailmentLimit

TRANSITION COD_Achieved
  WHEN ALL_OF(
    SubstantialCompletion,
    GridConnection,
    TurbineCommissioning
  )

// ==================== MILESTONES ====================

MILESTONE FoundationPours
  TARGET 2025-04-30
  LONGSTOP 2025-07-31
  TRIGGERS Draw2Available

MILESTONE TowerErection
  TARGET 2025-07-31
  LONGSTOP 2025-10-31
  REQUIRES FoundationPours
  TRIGGERS Draw3Available

MILESTONE NacelleInstallation
  TARGET 2025-09-30
  LONGSTOP 2025-12-31
  REQUIRES TowerErection

// AT-RISK: Only 7 days to longstop
MILESTONE BladeInstallation
  TARGET 2025-12-31
  LONGSTOP 2026-02-12
  REQUIRES NacelleInstallation
  TRIGGERS TurbineCommissioning

MILESTONE CollectorSystem
  TARGET 2026-01-15
  LONGSTOP 2026-03-15
  REQUIRES TowerErection

MILESTONE GridConnection
  TARGET 2026-02-28
  LONGSTOP 2026-05-31
  REQUIRES ALL_OF(CollectorSystem, SubstationComplete)

MILESTONE SubstantialCompletion
  TARGET 2026-03-31
  LONGSTOP 2026-06-30
  REQUIRES ALL_OF(GridConnection, TurbineCommissioning)
  TRIGGERS COD_Achieved

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization

DEFINE TotalDebt AS
  senior_debt + subordinated_debt

DEFINE SeniorDebt AS
  senior_debt

DEFINE DebtService AS
  senior_interest + senior_principal

DEFINE DSCR AS
  EBITDA / DebtService

DEFINE Leverage AS
  TotalDebt / EBITDA

// ==================== COVENANTS ====================

// NEAR-BREACH: Leverage at 4.28x vs 4.50x threshold (95%)
COVENANT TotalLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER life_of_facility MAX_AMOUNT $15_000_000

COVENANT SeniorLeverage
  REQUIRES SeniorDebt / EBITDA <= 3.25
  TESTED QUARTERLY

COVENANT InterestCoverage
  REQUIRES EBITDA / interest_expense >= 2.75
  TESTED QUARTERLY

COVENANT MinDSCR
  REQUIRES DSCR >= 1.30
  TESTED QUARTERLY

COVENANT MinEquityContribution
  REQUIRES equity_contributed >= 0.30 * total_project_cost
  TESTED MONTHLY

COVENANT CurtailmentLimit
  REQUIRES curtailment_pct <= 5.0
  TESTED MONTHLY

// ==================== RESERVES ====================

RESERVE DebtServiceReserve
  TARGET 6 * monthly_debt_service
  MINIMUM 3 * monthly_debt_service
  FUNDED_BY Waterfall, EquityContribution
  RELEASED_TO Waterfall

RESERVE GearboxReserve
  TARGET gearbox_replacement_cost
  MINIMUM 0.5 * gearbox_replacement_cost
  FUNDED_BY Waterfall
  RELEASED_FOR GearboxReplacement

// ==================== WATERFALL ====================

WATERFALL OperatingWaterfall
  FREQUENCY monthly

  TIER 1 "Operating Expenses"
    PAY operating_expenses
    FROM Revenue

  TIER 2 "Senior Debt Service"
    PAY senior_interest + senior_principal
    FROM REMAINDER
    SHORTFALL -> DebtServiceReserve

  TIER 3 "DSRA Replenishment"
    PAY TO DebtServiceReserve
    UNTIL DebtServiceReserve >= 6 * monthly_debt_service
    FROM REMAINDER

  TIER 4 "Gearbox Reserve"
    PAY TO GearboxReserve
    UNTIL GearboxReserve >= gearbox_replacement_cost
    FROM REMAINDER

  TIER 5 "Distributions"
    IF DSCR >= 1.50
    PAY distributions
    FROM REMAINDER

// ==================== TAX EQUITY ====================

TAX_CREDIT WindPTC
  CREDIT_TYPE ptc
  RATE 2.75 cents per kWh
  ADDER domestic_content 10%
  VESTING_PERIOD 10 YEARS

DEPRECIATION_SCHEDULE WindMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $160_000_000
  BONUS_DEPRECIATION 60%

// ==================== PERFORMANCE GUARANTEES ====================

PERFORMANCE_GUARANTEE NetCapacityFactor
  METRIC capacity_factor_pct
  P50 42.0
  P75 40.5
  P90 38.5
  P99 36.0
  GUARANTEE_PERIOD 15 YEARS
  SHORTFALL_RATE $45 per MWh

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"

  CP ExecutedCreditAgreement
    DESCRIPTION "Executed Credit Agreement"
    RESPONSIBLE Agent
    STATUS satisfied

  CP EquityContribution
    DESCRIPTION "Initial Equity Contribution"
    RESPONSIBLE Sponsor
    STATUS satisfied

  CP FAA_Determination
    DESCRIPTION "FAA No Hazard Determination"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP AvianProtectionPlan
    DESCRIPTION "Approved Avian Protection Plan"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP TribalConsultation
    DESCRIPTION "Completed Tribal Consultation"
    RESPONSIBLE Borrower
    STATUS pending
`;

const windFinancials: SimpleFinancialData = {
  // Income statement - near-breach leverage
  net_income: 12_000_000,
  interest_expense: 10_500_000,
  tax_expense: 3_400_000,
  depreciation: 18_000_000,
  amortization: 1_800_000,

  // Debt structure
  senior_debt: 140_000_000,
  subordinated_debt: 15_000_000,
  senior_interest: 7_000_000,
  senior_principal: 4_500_000,

  // Project metrics
  total_project_cost: 200_000_000,
  equity_contributed: 60_000_000,

  // Cash flow
  monthly_debt_service: 960_000,
  gearbox_replacement_cost: 8_000_000,
  operating_expenses: 3_800_000,
  distributions: 4_500_000,
  Revenue: 28_000_000,

  // Performance
  capacity_factor_pct: 39.2,
  curtailment_pct: 3.8,

  // Balance sheet
  total_assets: 215_000_000,
};

const windHistoricalData: HistoricalPeriod[] = [
  {
    period: 'Q4 2024',
    periodEnd: '2024-12-31',
    data: {
      net_income: 11_200_000,
      interest_expense: 10_800_000,
      tax_expense: 3_200_000,
      depreciation: 17_500_000,
      amortization: 1_700_000,
      senior_debt: 145_000_000,
      subordinated_debt: 16_000_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q1 2025',
    periodEnd: '2025-03-31',
    data: {
      net_income: 10_800_000,
      interest_expense: 10_700_000,
      tax_expense: 3_100_000,
      depreciation: 17_800_000,
      amortization: 1_750_000,
      senior_debt: 143_000_000,
      subordinated_debt: 15_500_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q2 2025',
    periodEnd: '2025-06-30',
    data: {
      net_income: 11_500_000,
      interest_expense: 10_600_000,
      tax_expense: 3_300_000,
      depreciation: 17_900_000,
      amortization: 1_780_000,
      senior_debt: 142_000_000,
      subordinated_debt: 15_200_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q3 2025',
    periodEnd: '2025-09-30',
    data: {
      // Weak quarter - curtailment high
      net_income: 10_200_000,
      interest_expense: 10_600_000,
      tax_expense: 2_900_000,
      depreciation: 17_950_000,
      amortization: 1_790_000,
      senior_debt: 141_000_000,
      subordinated_debt: 15_100_000,
    },
    complianceStatus: 'cured',
    cureUsed: 'TotalLeverage - $2M equity cure applied (1 of 2 uses)',
  },
  {
    period: 'Q4 2025',
    periodEnd: '2025-12-31',
    data: {
      net_income: 11_800_000,
      interest_expense: 10_500_000,
      tax_expense: 3_350_000,
      depreciation: 18_000_000,
      amortization: 1_800_000,
      senior_debt: 140_500_000,
      subordinated_debt: 15_000_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q1 2026',
    periodEnd: '2026-01-31',
    data: windFinancials,
    complianceStatus: 'compliant',
  },
];

const windMetadata: ScenarioMetadata = {
  industry: 'wind',
  tensionPoints: [
    {
      type: 'near_breach',
      element: 'TotalLeverage',
      description: 'Leverage at 4.28x vs 4.50x threshold (95%)',
      severity: 'warning',
    },
    {
      type: 'at_risk_milestone',
      element: 'BladeInstallation',
      description: '7 days until longstop date',
      severity: 'danger',
    },
    {
      type: 'cure_used',
      element: 'TotalLeverage',
      description: '$2M equity cure applied in Q3 2025 (1 of 2 uses)',
      severity: 'warning',
    },
  ],
  currentDate: '2026-02-05',
  phaseInfo: {
    current: 'Construction',
    startDate: '2025-01-01',
    targetDate: '2026-03-31',
    maturity: '2041-03-31',
  },
};

export const windScenario: DemoScenario = {
  id: 'wind-demo',
  name: 'Prairie Wind Farm',
  facility: '$200M Construction + Term Loan',
  sponsor: 'Prairie Energy Partners',
  borrower: 'Prairie Wind Holdings LLC',
  code: windCode,
  financials: windFinancials,
  historicalData: windHistoricalData,
  metadata: windMetadata,
};

// =============================================================================
// CORPORATE REVOLVER SCENARIO
// Traditional leveraged finance with covenant package
// =============================================================================

const corporateCode = `// Apex Industries Credit Facility
// $150M Revolving Credit Facility
// ProViso v2.0

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS
  net_income + interest_expense + tax_expense + depreciation + amortization
  EXCLUDING extraordinary_items

DEFINE TotalDebt AS
  funded_debt + capital_leases

DEFINE Leverage AS
  TotalDebt / EBITDA

DEFINE InterestCoverage AS
  EBITDA / interest_expense

DEFINE FixedChargeCoverage AS
  EBITDA / (interest_expense + principal_payments + capital_leases)

// ==================== COVENANTS ====================

// NEAR-BREACH: Leverage at 4.38x vs 4.50x threshold (97%)
COVENANT MaxLeverage
  REQUIRES Leverage <= 4.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility MAX_AMOUNT $20_000_000
  BREACH -> UnmaturedDefault

COVENANT MinInterestCoverage
  REQUIRES InterestCoverage >= 2.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3 OVER life_of_facility
  BREACH -> UnmaturedDefault

COVENANT MinFixedCharge
  REQUIRES FixedChargeCoverage >= 1.10
  TESTED QUARTERLY
  BREACH -> UnmaturedDefault

COVENANT MinLiquidity
  REQUIRES cash >= 15_000_000
  TESTED QUARTERLY

// ==================== BASKETS ====================

BASKET GeneralInvestments
  CAPACITY $25_000_000

BASKET RestrictedPayments
  CAPACITY GreaterOf($10_000_000, 5% * total_assets)

BASKET CapEx
  CAPACITY $20_000_000

BASKET PermittedAcquisitions
  CAPACITY $75_000_000
  SUBJECT TO NoDefault, ProFormaCompliance

// ==================== GROWER BASKETS ====================

BASKET EBITDAInvestments
  CAPACITY 15% * EBITDA
  FLOOR $15_000_000
  SUBJECT TO NoDefault

BASKET AssetBasedBasket
  CAPACITY 2.5% * total_assets
  FLOOR $5_000_000

// ==================== BUILDER BASKETS ====================

// Shows accumulation over time - currently at $18.5M
BASKET RetainedEarningsBasket
  BUILDS_FROM 50% * net_income
  STARTING $10_000_000
  MAXIMUM $75_000_000
  SUBJECT TO NoDefault

BASKET AssetSaleProceeds
  BUILDS_FROM asset_sale_reinvestment
  STARTING $0
  MAXIMUM $50_000_000

// ==================== CONDITIONS ====================

CONDITION NoDefault AS
  NOT EXISTS(EventOfDefault) AND NOT EXISTS(UnmaturedDefault)

CONDITION ProFormaCompliance AS
  COMPLIANT(MaxLeverage) AND COMPLIANT(MinInterestCoverage)

// ==================== PROHIBITIONS ====================

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
  GRACE_PERIOD 5 DAYS
  CONSEQUENCE EventOfDefault

EVENT CovenantDefault
  TRIGGERS WHEN NOT COMPLIANT(MaxLeverage) OR NOT COMPLIANT(MinInterestCoverage)
  GRACE_PERIOD 30 DAYS
  CONSEQUENCE EventOfDefault

EVENT CrossDefault
  TRIGGERS WHEN external_debt_default > 10_000_000
  CONSEQUENCE EventOfDefault
`;

const corporateFinancials: SimpleFinancialData = {
  // Income statement - near-breach leverage
  net_income: 17_000_000,
  interest_expense: 8_800_000,
  tax_expense: 5_800_000,
  depreciation: 5_200_000,
  amortization: 2_400_000,
  extraordinary_items: 0,

  // Debt structure - 97% of covenant
  funded_debt: 167_000_000,
  capital_leases: 4_500_000,
  principal_payments: 3_200_000,

  // Liquidity
  cash: 18_500_000,
  total_assets: 365_000_000,

  // Basket tracking
  asset_sale_reinvestment: 2_500_000,

  // Event triggers
  payment_due: 0, // false
  payment_received: 1, // true
  external_debt_default: 0,
};

const corporateHistoricalData: HistoricalPeriod[] = [
  {
    period: 'Q4 2024',
    periodEnd: '2024-12-31',
    data: {
      net_income: 15_500_000,
      interest_expense: 9_200_000,
      tax_expense: 5_300_000,
      depreciation: 5_000_000,
      amortization: 2_300_000,
      funded_debt: 175_000_000,
      capital_leases: 5_000_000,
      cash: 22_000_000,
      total_assets: 355_000_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q1 2025',
    periodEnd: '2025-03-31',
    data: {
      net_income: 14_200_000,
      interest_expense: 9_100_000,
      tax_expense: 4_800_000,
      depreciation: 5_100_000,
      amortization: 2_350_000,
      funded_debt: 173_000_000,
      capital_leases: 4_800_000,
      cash: 19_500_000,
      total_assets: 358_000_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q2 2025',
    periodEnd: '2025-06-30',
    data: {
      // Breach quarter - cured
      net_income: 11_800_000,
      interest_expense: 9_000_000,
      tax_expense: 4_000_000,
      depreciation: 5_150_000,
      amortization: 2_380_000,
      funded_debt: 172_000_000,
      capital_leases: 4_700_000,
      cash: 16_200_000,
      total_assets: 360_000_000,
    },
    complianceStatus: 'cured',
    cureUsed: 'MaxLeverage - $5M equity cure applied (1 of 3 uses)',
  },
  {
    period: 'Q3 2025',
    periodEnd: '2025-09-30',
    data: {
      net_income: 16_200_000,
      interest_expense: 8_900_000,
      tax_expense: 5_500_000,
      depreciation: 5_180_000,
      amortization: 2_390_000,
      funded_debt: 170_000_000,
      capital_leases: 4_600_000,
      cash: 17_800_000,
      total_assets: 362_000_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q4 2025',
    periodEnd: '2025-12-31',
    data: {
      net_income: 16_800_000,
      interest_expense: 8_850_000,
      tax_expense: 5_700_000,
      depreciation: 5_190_000,
      amortization: 2_395_000,
      funded_debt: 168_000_000,
      capital_leases: 4_550_000,
      cash: 18_200_000,
      total_assets: 364_000_000,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q1 2026',
    periodEnd: '2026-01-31',
    data: corporateFinancials,
    complianceStatus: 'compliant',
  },
];

const corporateMetadata: ScenarioMetadata = {
  industry: 'corporate',
  tensionPoints: [
    {
      type: 'near_breach',
      element: 'MaxLeverage',
      description: 'Leverage at 4.38x vs 4.50x threshold (97%)',
      severity: 'warning',
    },
    {
      type: 'cure_used',
      element: 'MaxLeverage',
      description: '$5M equity cure applied in Q2 2025 (1 of 3 uses)',
      severity: 'warning',
    },
    {
      type: 'reserve_low',
      element: 'RetainedEarningsBasket',
      description: 'Builder basket at $18.5M, approaching maximum',
      severity: 'warning',
    },
  ],
  currentDate: '2026-02-05',
  phaseInfo: {
    current: 'Operating',
    startDate: '2024-06-15',
    targetDate: 'N/A',
    maturity: '2029-06-15',
  },
};

export const corporateScenario: DemoScenario = {
  id: 'corporate-demo',
  name: 'Apex Industries Credit Facility',
  facility: '$150M Revolving Credit Facility',
  sponsor: 'Apex Industries Inc.',
  borrower: 'Apex Industries Inc.',
  code: corporateCode,
  financials: corporateFinancials,
  historicalData: corporateHistoricalData,
  metadata: corporateMetadata,
};

// =============================================================================
// EXPORTS
// =============================================================================

export const demoScenarios: Record<string, DemoScenario> = {
  'solar-demo': solarScenario,
  'wind-demo': windScenario,
  'corporate-demo': corporateScenario,
};

export function getScenarioById(id: string): DemoScenario | undefined {
  return demoScenarios[id];
}

export function getScenarioByIndustry(industry: string): DemoScenario | undefined {
  switch (industry) {
    case 'solar':
      return solarScenario;
    case 'wind':
      return windScenario;
    case 'corporate':
      return corporateScenario;
    default:
      return undefined;
  }
}

export default demoScenarios;
