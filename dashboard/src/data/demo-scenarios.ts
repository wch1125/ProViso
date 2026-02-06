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
// NEGOTIATION & CLOSING TYPES
// =============================================================================

export type DealParty = {
  id: string;
  dealId: string;
  name: string;
  shortName: string;
  role: string;
  partyType: 'borrower' | 'lender' | 'agent' | 'law_firm' | 'consultant' | 'tax_equity' | 'offtaker';
  primaryContact: {
    name: string;
    email: string;
    phone: string | null;
    title: string | null;
  };
  additionalContacts: Array<{
    name: string;
    email: string;
    phone: string | null;
    title: string | null;
  }>;
  counselPartyId: string | null;
};

export type ChangeImpact = 'borrower_favorable' | 'lender_favorable' | 'neutral' | 'unclear';

export type Change = {
  id: string;
  changeType: 'added' | 'removed' | 'modified';
  elementType: string;
  sectionReference: string;
  elementName: string;
  title: string;
  description: string;
  rationale: string | null;
  beforeCode: string | null;
  afterCode: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  impact: ChangeImpact;
  impactDescription: string | null;
  sourceForm: string | null;
  isManualEdit: boolean;
};

export type ChangeSummary = {
  versionFrom: number;
  versionTo: number;
  authorParty: string;
  createdAt: Date;
  totalChanges: number;
  covenantChanges: number;
  definitionChanges: number;
  basketChanges: number;
  otherChanges: number;
  borrowerFavorable: number;
  lenderFavorable: number;
  neutral: number;
  changes: Change[];
};

export type DealVersion = {
  id: string;
  dealId: string;
  versionNumber: number;
  versionLabel: string;
  creditLangCode: string;
  createdBy: string;
  authorParty: string;
  createdAt: Date;
  parentVersionId: string | null;
  status: 'draft' | 'sent' | 'received' | 'superseded' | 'executed';
  generatedWordDoc: string | null;
  changeSummary: ChangeSummary | null;
};

export type Deal = {
  id: string;
  name: string;
  dealType: 'corporate' | 'project_finance';
  facilityAmount: number;
  currency: string;
  status: 'draft' | 'negotiation' | 'closing' | 'active' | 'matured';
  currentVersionId: string | null;
  parties: DealParty[];
  targetClosingDate: Date | null;
  actualClosingDate: Date | null;
  maturityDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

export type CPCategory =
  | 'corporate_documents'
  | 'credit_agreement'
  | 'security_documents'
  | 'ucc_filings'
  | 'legal_opinions'
  | 'certificates'
  | 'financial'
  | 'insurance'
  | 'kyc_aml'
  | 'permits'
  | 'technical'
  | 'tax_equity'
  | 'offtake'
  | 'other';

export type ConditionStatus = 'pending' | 'satisfied' | 'waived';
export type DocumentStatus = 'pending' | 'uploaded' | 'executed';
export type SignatureStatus = 'pending' | 'requested' | 'signed' | 'declined';

export interface Signature {
  id: string;
  documentId: string;
  partyId: string;
  signatoryName: string;
  signatoryTitle: string;
  status: SignatureStatus;
  signedAt: Date | null;
}

export interface ClosingDocument {
  id: string;
  dealId: string;
  documentType: string;
  title: string;
  fileName: string;
  fileType: string;
  storagePath: string;
  status: DocumentStatus;
  responsiblePartyId: string | null;
  uploadedAt: Date;
  uploadedBy: string;
  dueDate: Date | null;
  signatures: Signature[];
  satisfiesConditionIds: string[];
}

export interface ConditionPrecedent {
  id: string;
  dealId: string;
  versionId: string;
  sectionReference: string;
  category: CPCategory;
  title: string;
  description: string;
  responsiblePartyId: string;
  status: ConditionStatus;
  dueDate: Date | null;
  satisfiedAt: Date | null;
  satisfiedByDocumentIds: string[];
  waivedAt: Date | null;
  waiverApprovedBy: string | null;
  notes: string;
}

export interface ClosingDeal {
  id: string;
  name: string;
  facilityAmount: number;
  currency: string;
  targetClosingDate: Date;
  status: string;
}

export interface ClosingParty {
  id: string;
  dealId: string;
  name: string;
  shortName: string;
  role: string;
  partyType: string;
}

// =============================================================================
// DEMO SCENARIO TYPES
// =============================================================================

export interface NegotiationData {
  deal: Deal;
  parties: DealParty[];
  versions: DealVersion[];
}

export interface ClosingData {
  deal: ClosingDeal;
  parties: ClosingParty[];
  conditions: ConditionPrecedent[];
  documents: ClosingDocument[];
}

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
  // NEW: Unified negotiation and closing data
  negotiation: NegotiationData;
  closing: ClosingData;
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
  TAX_CREDIT_ALLOCATION 99/1
  DEPRECIATION_ALLOCATION 99/1
  CASH_ALLOCATION 10/90
  TARGET_RETURN 8.0
  BUYOUT_PRICE $5_000_000

TAX_CREDIT SolarITC
  CREDIT_TYPE itc
  RATE 30
  ADDER domestic_content + 10
  ADDER energy_community + 10
  ELIGIBLE_BASIS $240_000_000
  VESTING_PERIOD "5 YEARS"
  RECAPTURE_RISK "20"

DEPRECIATION_SCHEDULE SolarMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $240_000_000
  BONUS_DEPRECIATION 60

FLIP_EVENT TargetReturnFlip
  TRIGGER target_return 8.0
  PRE_FLIP_ALLOCATION 99/1
  POST_FLIP_ALLOCATION 5/95
  BUYOUT_OPTION fair_market_value

// ==================== TECHNICAL MILESTONES ====================

TECHNICAL_MILESTONE PileProgress
  TARGET 2025-06-30
  LONGSTOP 2025-09-30
  MEASUREMENT "piles driven"
  TARGET_VALUE 45000
  CURRENT_VALUE 38500
  PROGRESS_METRIC 85.6

TECHNICAL_MILESTONE ModuleProgress
  TARGET 2025-12-15
  LONGSTOP 2026-03-15
  MEASUREMENT "MW installed"
  TARGET_VALUE 200
  CURRENT_VALUE 140
  PROGRESS_METRIC 70

// ==================== PERFORMANCE GUARANTEES ====================

PERFORMANCE_GUARANTEE AnnualProduction
  METRIC annual_gwh
  P50 520
  P75 495
  P90 470
  P99 440
  GUARANTEE_PERIOD "10 YEARS"
  SHORTFALL_RATE $50

PERFORMANCE_GUARANTEE AvailabilityGuarantee
  METRIC availability_pct
  P50 99.0
  P75 98.5
  P90 97.5
  P99 96.0
  GUARANTEE_PERIOD "25 YEARS"

// ==================== DEGRADATION ====================

DEGRADATION_SCHEDULE PanelDegradation
  ASSET_TYPE bifacial_mono_perc
  INITIAL_CAPACITY 200
  YEAR_1_DEGRADATION 2.0
  ANNUAL_DEGRADATION 0.4
  MINIMUM_CAPACITY 80
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
  RATE 2.75
  ADDER domestic_content + 10
  VESTING_PERIOD "10 YEARS"

DEPRECIATION_SCHEDULE WindMACRS
  METHOD macrs_5yr
  DEPRECIABLE_BASIS $160_000_000
  BONUS_DEPRECIATION 60

// ==================== PERFORMANCE GUARANTEES ====================

PERFORMANCE_GUARANTEE NetCapacityFactor
  METRIC capacity_factor_pct
  P50 42.0
  P75 40.5
  P90 38.5
  P99 36.0
  GUARANTEE_PERIOD "15 YEARS"
  SHORTFALL_RATE $45

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
  CAPACITY GreaterOf($10_000_000, 0.05 * total_assets)

BASKET CapEx
  CAPACITY $20_000_000

BASKET PermittedAcquisitions
  CAPACITY $75_000_000
  SUBJECT TO NoDefault, ProFormaCompliance

// ==================== GROWER BASKETS ====================

BASKET EBITDAInvestments
  CAPACITY 0.15 * EBITDA
  FLOOR $15_000_000
  SUBJECT TO NoDefault

BASKET AssetBasedBasket
  CAPACITY 0.05 * total_assets
  FLOOR $5_000_000

// ==================== BUILDER BASKETS ====================

// Shows accumulation over time - currently at $18.5M
BASKET RetainedEarningsBasket
  BUILDS_FROM 0.50 * net_income
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

// =============================================================================
// ABC ACQUISITION SCENARIO
// Corporate LBO with traditional covenant package
// =============================================================================

const abcCode = `// ABC Acquisition Facility - Lender's Counter
// Version 3.0 - Simpson Thacher

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp
) EXCLUDING extraordinary_items
  CAP StockBasedComp AT $5_000_000 PER YEAR

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE Leverage AS TotalDebt / EBITDA

COVENANT MaxLeverage
  REQUIRES Leverage <= 5.00 UNTIL 2025-12-31, THEN <= 4.75
  TESTED quarterly
  CURE EquityCure MAX_USES 2 OVER "rolling 4 quarters" MAX_AMOUNT $20_000_000

COVENANT MinInterestCoverage
  REQUIRES EBITDA / InterestExpense >= 2.25
  TESTED quarterly

BASKET GeneralInvestments
  CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)

BASKET PermittedAcquisitions
  CAPACITY $60_000_000
  SUBJECT_TO ProFormaCompliance
`;

const abcFinancials: SimpleFinancialData = {
  net_income: 15_000_000,
  interest_expense: 7_500_000,
  tax_expense: 5_000_000,
  depreciation: 4_000_000,
  amortization: 2_000_000,
  senior_debt: 120_000_000,
  subordinated_debt: 30_000_000,
  total_assets: 300_000_000,
  cash: 20_000_000,
};

const abcHistoricalData: HistoricalPeriod[] = [
  {
    period: 'Q4 2025',
    periodEnd: '2025-12-31',
    data: abcFinancials,
    complianceStatus: 'compliant',
  },
  {
    period: 'Q1 2026',
    periodEnd: '2026-01-31',
    data: abcFinancials,
    complianceStatus: 'compliant',
  },
];

const abcMetadata: ScenarioMetadata = {
  industry: 'corporate',
  tensionPoints: [
    {
      type: 'near_breach',
      element: 'MaxLeverage',
      description: 'Leverage at 4.49x vs 5.00x threshold (90%)',
      severity: 'warning',
    },
  ],
  currentDate: '2026-02-05',
  phaseInfo: {
    current: 'Operating',
    startDate: '2026-01-10',
    targetDate: '2026-03-15',
    maturity: '2031-03-15',
  },
};

// ABC Negotiation Data
const abcNegotiationParties: DealParty[] = [
  {
    id: 'abc-party-borrower',
    dealId: 'abc-acquisition',
    name: 'ABC Holdings, Inc.',
    shortName: 'ABC',
    role: 'borrower',
    partyType: 'borrower',
    primaryContact: { name: 'Jennifer Chen', email: 'jchen@abcholdings.com', phone: '+1 (212) 555-0101', title: 'CFO' },
    additionalContacts: [{ name: 'Michael Rodriguez', email: 'mrodriguez@abcholdings.com', phone: '+1 (212) 555-0102', title: 'Treasurer' }],
    counselPartyId: 'abc-party-davis-polk',
  },
  {
    id: 'abc-party-agent',
    dealId: 'abc-acquisition',
    name: 'First National Bank',
    shortName: 'FNB',
    role: 'administrative_agent',
    partyType: 'agent',
    primaryContact: { name: 'Sarah Thompson', email: 'sthompson@fnb.com', phone: '+1 (212) 555-0201', title: 'Managing Director' },
    additionalContacts: [],
    counselPartyId: 'abc-party-simpson-thacher',
  },
  {
    id: 'abc-party-davis-polk',
    dealId: 'abc-acquisition',
    name: 'Davis Polk & Wardwell LLP',
    shortName: 'Davis Polk',
    role: 'borrower',
    partyType: 'law_firm',
    primaryContact: { name: 'Elizabeth Warren', email: 'elizabeth.warren@davispolk.com', phone: '+1 (212) 555-0401', title: 'Partner' },
    additionalContacts: [],
    counselPartyId: null,
  },
  {
    id: 'abc-party-simpson-thacher',
    dealId: 'abc-acquisition',
    name: 'Simpson Thacher & Bartlett LLP',
    shortName: 'Simpson Thacher',
    role: 'administrative_agent',
    partyType: 'law_firm',
    primaryContact: { name: 'William Harris', email: 'wharris@stblaw.com', phone: '+1 (212) 555-0501', title: 'Partner' },
    additionalContacts: [],
    counselPartyId: null,
  },
];

const abcNegotiationVersions: DealVersion[] = [
  {
    id: 'abc-version-1',
    dealId: 'abc-acquisition',
    versionNumber: 1,
    versionLabel: "Lender's Initial Draft",
    creditLangCode: `// ABC Acquisition Facility - Lender's Initial Draft
DEFINE EBITDA AS (NetIncome + InterestExpense + TaxExpense + DepreciationAmortization) EXCLUDING extraordinary_items
DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt
DEFINE Leverage AS TotalDebt / EBITDA
COVENANT MaxLeverage REQUIRES Leverage <= 5.00 TESTED quarterly
COVENANT MinInterestCoverage REQUIRES EBITDA / InterestExpense >= 2.50 TESTED quarterly
BASKET GeneralInvestments CAPACITY GreaterOf($25_000_000, 10% * EBITDA)
BASKET PermittedAcquisitions CAPACITY $50_000_000 SUBJECT_TO ProFormaCompliance`,
    createdBy: 'wharris@stblaw.com',
    authorParty: 'Simpson Thacher',
    createdAt: new Date('2026-01-10T09:00:00Z'),
    parentVersionId: null,
    status: 'superseded',
    generatedWordDoc: null,
    changeSummary: null,
  },
  {
    id: 'abc-version-2',
    dealId: 'abc-acquisition',
    versionNumber: 2,
    versionLabel: "Borrower's Markup",
    creditLangCode: `// ABC Acquisition Facility - Borrower's Markup
DEFINE EBITDA AS (NetIncome + InterestExpense + TaxExpense + DepreciationAmortization + StockBasedComp) EXCLUDING extraordinary_items
DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt
DEFINE Leverage AS TotalDebt / EBITDA
COVENANT MaxLeverage REQUIRES Leverage <= 5.25 TESTED quarterly CURE EquityCure MAX_USES 2 OVER "rolling 4 quarters" MAX_AMOUNT $25_000_000
COVENANT MinInterestCoverage REQUIRES EBITDA / InterestExpense >= 2.25 TESTED quarterly
BASKET GeneralInvestments CAPACITY GreaterOf($35_000_000, 15% * EBITDA)
BASKET PermittedAcquisitions CAPACITY $75_000_000 SUBJECT_TO ProFormaCompliance`,
    createdBy: 'elizabeth.warren@davispolk.com',
    authorParty: 'Davis Polk',
    createdAt: new Date('2026-01-15T14:30:00Z'),
    parentVersionId: 'abc-version-1',
    status: 'superseded',
    generatedWordDoc: null,
    changeSummary: {
      versionFrom: 1, versionTo: 2, authorParty: 'Davis Polk', createdAt: new Date('2026-01-15T14:30:00Z'),
      totalChanges: 5, covenantChanges: 2, definitionChanges: 1, basketChanges: 2, otherChanges: 0,
      borrowerFavorable: 5, lenderFavorable: 0, neutral: 0,
      changes: [
        { id: 'abc-c1', changeType: 'modified', elementType: 'covenant', sectionReference: '7.11(a)', elementName: 'MaxLeverage', title: 'Leverage ratio threshold increased', description: 'Maximum leverage ratio increased from 5.00x to 5.25x', rationale: 'Provides additional headroom for acquisition integration', beforeCode: 'REQUIRES Leverage <= 5.00', afterCode: 'REQUIRES Leverage <= 5.25', beforeValue: '5.00x', afterValue: '5.25x', impact: 'borrower_favorable', impactDescription: '+0.25x headroom at closing', sourceForm: 'covenant-simple', isManualEdit: false },
        { id: 'abc-c2', changeType: 'added', elementType: 'covenant', sectionReference: '7.11(a)', elementName: 'MaxLeverage', title: 'Equity cure right added', description: 'Added equity cure mechanism with 2 uses over rolling 4 quarters, max $25M', rationale: 'Standard borrower protection', beforeCode: null, afterCode: 'CURE EquityCure MAX_USES 2 OVER "rolling 4 quarters" MAX_AMOUNT $25_000_000', beforeValue: null, afterValue: '2 uses / $25M max', impact: 'borrower_favorable', impactDescription: 'Provides cure rights for leverage covenant breaches', sourceForm: 'covenant-cure', isManualEdit: false },
        { id: 'abc-c3', changeType: 'modified', elementType: 'covenant', sectionReference: '7.11(b)', elementName: 'MinInterestCoverage', title: 'Interest coverage threshold decreased', description: 'Minimum interest coverage reduced from 2.50x to 2.25x', rationale: null, beforeCode: 'REQUIRES EBITDA / InterestExpense >= 2.50', afterCode: 'REQUIRES EBITDA / InterestExpense >= 2.25', beforeValue: '2.50x', afterValue: '2.25x', impact: 'borrower_favorable', impactDescription: '-0.25x requirement provides more operational flexibility', sourceForm: 'covenant-simple', isManualEdit: false },
        { id: 'abc-c4', changeType: 'modified', elementType: 'basket', sectionReference: '7.02(f)', elementName: 'GeneralInvestments', title: 'General investment basket increased', description: 'Capacity increased from $25M/10% to $35M/15%', rationale: null, beforeCode: 'CAPACITY GreaterOf($25_000_000, 10% * EBITDA)', afterCode: 'CAPACITY GreaterOf($35_000_000, 15% * EBITDA)', beforeValue: '$25M / 10%', afterValue: '$35M / 15%', impact: 'borrower_favorable', impactDescription: '+$10M fixed capacity, +5% grower component', sourceForm: 'basket-grower', isManualEdit: false },
        { id: 'abc-c5', changeType: 'modified', elementType: 'basket', sectionReference: '7.02(g)', elementName: 'PermittedAcquisitions', title: 'Acquisition basket increased', description: 'Capacity increased from $50M to $75M', rationale: null, beforeCode: 'CAPACITY $50_000_000', afterCode: 'CAPACITY $75_000_000', beforeValue: '$50M', afterValue: '$75M', impact: 'borrower_favorable', impactDescription: '+$25M additional acquisition capacity', sourceForm: 'basket-fixed', isManualEdit: false },
      ],
    },
  },
  {
    id: 'abc-version-3',
    dealId: 'abc-acquisition',
    versionNumber: 3,
    versionLabel: "Lender's Counter",
    creditLangCode: abcCode,
    createdBy: 'wharris@stblaw.com',
    authorParty: 'Simpson Thacher',
    createdAt: new Date('2026-01-20T10:15:00Z'),
    parentVersionId: 'abc-version-2',
    status: 'draft',
    generatedWordDoc: null,
    changeSummary: {
      versionFrom: 2, versionTo: 3, authorParty: 'Simpson Thacher', createdAt: new Date('2026-01-20T10:15:00Z'),
      totalChanges: 4, covenantChanges: 2, definitionChanges: 1, basketChanges: 1, otherChanges: 0,
      borrowerFavorable: 0, lenderFavorable: 3, neutral: 1,
      changes: [
        { id: 'abc-c6', changeType: 'modified', elementType: 'covenant', sectionReference: '7.11(a)', elementName: 'MaxLeverage', title: 'Leverage step-down added', description: 'Opening 5.00x stepping to 4.75x after Dec 2025', rationale: 'Compromise on opening ratio with step-down', beforeCode: 'REQUIRES Leverage <= 5.25', afterCode: 'REQUIRES Leverage <= 5.00 UNTIL 2025-12-31, THEN <= 4.75', beforeValue: '5.25x', afterValue: '5.00x → 4.75x', impact: 'lender_favorable', impactDescription: 'Reverts to original 5.00x opening, adds step-down', sourceForm: 'covenant-stepdown', isManualEdit: false },
        { id: 'abc-c7', changeType: 'modified', elementType: 'covenant', sectionReference: '7.11(a)', elementName: 'MaxLeverage', title: 'Cure maximum reduced', description: 'Maximum cure amount reduced from $25M to $20M', rationale: null, beforeCode: 'MAX_AMOUNT $25_000_000', afterCode: 'MAX_AMOUNT $20_000_000', beforeValue: '$25M', afterValue: '$20M', impact: 'lender_favorable', impactDescription: '-$5M cure capacity', sourceForm: 'covenant-cure', isManualEdit: false },
        { id: 'abc-c8', changeType: 'modified', elementType: 'definition', sectionReference: '1.01', elementName: 'EBITDA', title: 'Stock-based comp add-back capped', description: 'Accepted SBC add-back but with $5M annual cap', rationale: 'Compromise: accept add-back but limit exposure', beforeCode: '+ StockBasedComp', afterCode: '+ StockBasedComp\n  CAP StockBasedComp AT $5_000_000 PER YEAR', beforeValue: 'Unlimited', afterValue: '$5M cap', impact: 'lender_favorable', impactDescription: 'Limits EBITDA benefit to $5M annually', sourceForm: 'definition-ebitda', isManualEdit: false },
        { id: 'abc-c9', changeType: 'modified', elementType: 'basket', sectionReference: '7.02(f)', elementName: 'GeneralInvestments', title: 'Investment basket compromise', description: 'Capacity set to $30M/12.5%', rationale: null, beforeCode: 'CAPACITY GreaterOf($35_000_000, 15% * EBITDA)', afterCode: 'CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)', beforeValue: '$35M / 15%', afterValue: '$30M / 12.5%', impact: 'neutral', impactDescription: 'Split the difference on basket sizing', sourceForm: 'basket-grower', isManualEdit: false },
      ],
    },
  },
];

const abcNegotiationDeal: Deal = {
  id: 'abc-acquisition',
  name: 'ABC Acquisition Facility',
  dealType: 'corporate',
  facilityAmount: 150_000_000,
  currency: 'USD',
  status: 'negotiation',
  currentVersionId: 'abc-version-3',
  parties: abcNegotiationParties,
  targetClosingDate: new Date('2026-03-15'),
  actualClosingDate: null,
  maturityDate: new Date('2031-03-15'),
  createdAt: new Date('2026-01-08T10:00:00Z'),
  updatedAt: new Date('2026-01-20T10:15:00Z'),
  createdBy: 'sthompson@fnb.com',
};

// ABC Closing Data
const abcClosingParties: ClosingParty[] = [
  { id: 'abc-cp-1', dealId: 'abc-acquisition', name: 'ABC Holdings, Inc.', shortName: 'Borrower', role: 'borrower', partyType: 'borrower' },
  { id: 'abc-cp-2', dealId: 'abc-acquisition', name: 'First National Bank', shortName: 'Agent', role: 'administrative_agent', partyType: 'agent' },
  { id: 'abc-cp-3', dealId: 'abc-acquisition', name: 'Regional Capital Partners', shortName: 'Lender 1', role: 'lender', partyType: 'lender' },
  { id: 'abc-cp-4', dealId: 'abc-acquisition', name: 'Midwest Credit Fund', shortName: 'Lender 2', role: 'lender', partyType: 'lender' },
  { id: 'abc-cp-5', dealId: 'abc-acquisition', name: 'Davis Polk & Wardwell', shortName: 'Borrower Counsel', role: 'counsel', partyType: 'law_firm' },
  { id: 'abc-cp-6', dealId: 'abc-acquisition', name: 'Simpson Thacher & Bartlett', shortName: 'Agent Counsel', role: 'counsel', partyType: 'law_firm' },
];

const abcClosingConditions: ConditionPrecedent[] = [
  { id: 'abc-cond-1', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(i)', category: 'corporate_documents', title: 'Certificate of Incorporation', description: 'Certified copy of the Certificate of Incorporation', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: ['abc-doc-1'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-2', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(ii)', category: 'corporate_documents', title: 'Bylaws', description: 'Certified copy of the Bylaws', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: ['abc-doc-2'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-3', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(iii)', category: 'corporate_documents', title: 'Board Resolutions', description: 'Board resolutions authorizing the Loan Documents', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-01-30'), satisfiedByDocumentIds: ['abc-doc-3'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-4', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(iv)', category: 'corporate_documents', title: 'Good Standing Certificate', description: 'Certificate of Good Standing from Delaware', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Requested from Delaware Secretary of State' },
  { id: 'abc-cond-5', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(b)(i)', category: 'credit_agreement', title: 'Credit Agreement Execution', description: 'Fully executed Credit Agreement', responsiblePartyId: 'abc-cp-5', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Final signatures pending' },
  { id: 'abc-cond-6', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(c)(i)', category: 'security_documents', title: 'Security Agreement', description: 'Security Agreement granting security interest', responsiblePartyId: 'abc-cp-5', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-01-31'), satisfiedByDocumentIds: ['abc-doc-5'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-7', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(c)(ii)', category: 'security_documents', title: 'Pledge Agreement', description: 'Pledge Agreement covering equity interests', responsiblePartyId: 'abc-cp-5', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-01-31'), satisfiedByDocumentIds: ['abc-doc-6'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-8', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(i)', category: 'ucc_filings', title: 'UCC-1 Financing Statement', description: 'UCC-1 filed with Delaware Secretary of State', responsiblePartyId: 'abc-cp-6', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Will file on closing date' },
  { id: 'abc-cond-9', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(e)(i)', category: 'legal_opinions', title: 'Borrower Counsel Opinion', description: 'Legal opinion of Davis Polk', responsiblePartyId: 'abc-cp-5', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Draft under review' },
  { id: 'abc-cond-10', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(f)(i)', category: 'certificates', title: "Officer's Certificate", description: 'Certificate certifying conditions precedent', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-11', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(f)(ii)', category: 'certificates', title: 'Solvency Certificate', description: 'Solvency Certificate from the CFO', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-12', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(g)(i)', category: 'insurance', title: 'Insurance Certificate', description: 'Certificate of insurance with Agent as loss payee', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'OVERDUE - Awaiting from insurance broker' },
  { id: 'abc-cond-13', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(h)(i)', category: 'kyc_aml', title: 'KYC Documentation', description: 'KYC documentation for all Lenders', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-14', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(i)(i)', category: 'financial', title: 'Financial Statements', description: 'Audited financial statements for FY 2025', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: ['abc-doc-10'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-15', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(i)(ii)', category: 'financial', title: 'Pro Forma Financial Model', description: 'Pro forma model showing projected compliance', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-22'), satisfiedByDocumentIds: ['abc-doc-11'], waivedAt: null, waiverApprovedBy: null, notes: '' },
];

const abcClosingDocuments: ClosingDocument[] = [
  { id: 'abc-doc-1', dealId: 'abc-acquisition', documentType: 'corporate', title: 'Certificate of Incorporation', fileName: 'ABC_Certificate_of_Incorporation.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-1.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-28'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['abc-cond-1'] },
  { id: 'abc-doc-2', dealId: 'abc-acquisition', documentType: 'corporate', title: 'Bylaws', fileName: 'ABC_Bylaws.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-2.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-28'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['abc-cond-2'] },
  { id: 'abc-doc-3', dealId: 'abc-acquisition', documentType: 'corporate', title: 'Board Resolutions', fileName: 'ABC_Board_Resolutions.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-3.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-30'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-12'), signatures: [], satisfiesConditionIds: ['abc-cond-3'] },
  { id: 'abc-doc-4', dealId: 'abc-acquisition', documentType: 'credit_agreement', title: 'Credit Agreement', fileName: 'ABC_Credit_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-4.pdf', status: 'pending', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-01-31'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-15'), signatures: [
    { id: 'abc-sig-1', documentId: 'abc-doc-4', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-31') },
    { id: 'abc-sig-2', documentId: 'abc-doc-4', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-02-01') },
    { id: 'abc-sig-3', documentId: 'abc-doc-4', partyId: 'abc-cp-3', signatoryName: 'Michael Brown', signatoryTitle: 'Partner', status: 'requested', signedAt: null },
    { id: 'abc-sig-4', documentId: 'abc-doc-4', partyId: 'abc-cp-4', signatoryName: 'Emily Davis', signatoryTitle: 'Senior VP', status: 'pending', signedAt: null },
  ], satisfiesConditionIds: ['abc-cond-5'] },
  { id: 'abc-doc-5', dealId: 'abc-acquisition', documentType: 'security', title: 'Security Agreement', fileName: 'ABC_Security_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-5.pdf', status: 'executed', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-01-31'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-12'), signatures: [
    { id: 'abc-sig-5', documentId: 'abc-doc-5', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-31') },
    { id: 'abc-sig-6', documentId: 'abc-doc-5', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-01-31') },
  ], satisfiesConditionIds: ['abc-cond-6'] },
  { id: 'abc-doc-6', dealId: 'abc-acquisition', documentType: 'security', title: 'Pledge Agreement', fileName: 'ABC_Pledge_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-6.pdf', status: 'executed', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-01-31'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-12'), signatures: [
    { id: 'abc-sig-7', documentId: 'abc-doc-6', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-31') },
  ], satisfiesConditionIds: ['abc-cond-7'] },
  { id: 'abc-doc-10', dealId: 'abc-acquisition', documentType: 'financial', title: '2025 Audited Financial Statements', fileName: 'ABC_2025_Audited_Financials.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-10.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-20'), uploadedBy: 'cfo@abcholdings.com', dueDate: new Date('2026-02-01'), signatures: [], satisfiesConditionIds: ['abc-cond-14'] },
  { id: 'abc-doc-11', dealId: 'abc-acquisition', documentType: 'financial', title: 'Pro Forma Financial Model', fileName: 'ABC_ProForma_Model.xlsx', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', storagePath: '/documents/abc-doc-11.xlsx', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-22'), uploadedBy: 'cfo@abcholdings.com', dueDate: new Date('2026-02-05'), signatures: [], satisfiesConditionIds: ['abc-cond-15'] },
];

const abcClosingDeal: ClosingDeal = {
  id: 'abc-acquisition',
  name: 'ABC Acquisition Facility',
  facilityAmount: 150_000_000,
  currency: 'USD',
  targetClosingDate: new Date('2026-02-15'),
  status: 'closing',
};

export const abcScenario: DemoScenario = {
  id: 'abc-acquisition',
  name: 'ABC Acquisition Facility',
  facility: '$150M Acquisition Facility',
  sponsor: 'First National Bank',
  borrower: 'ABC Holdings, Inc.',
  code: abcCode,
  financials: abcFinancials,
  historicalData: abcHistoricalData,
  metadata: abcMetadata,
  negotiation: {
    deal: abcNegotiationDeal,
    parties: abcNegotiationParties,
    versions: abcNegotiationVersions,
  },
  closing: {
    deal: abcClosingDeal,
    parties: abcClosingParties,
    conditions: abcClosingConditions,
    documents: abcClosingDocuments,
  },
};

// =============================================================================
// SOLAR NEGOTIATION & CLOSING DATA
// =============================================================================

const solarNegotiationParties: DealParty[] = [
  { id: 'solar-party-borrower', dealId: 'solar-demo', name: 'Desert Sun Project Co LLC', shortName: 'Borrower', role: 'borrower', partyType: 'borrower', primaryContact: { name: 'Robert Martinez', email: 'rmartinez@desertsun.com', phone: '+1 (602) 555-0100', title: 'Project Director' }, additionalContacts: [], counselPartyId: 'solar-party-latham' },
  { id: 'solar-party-sponsor', dealId: 'solar-demo', name: 'Desert Sun Holdings LLC', shortName: 'Sponsor', role: 'borrower', partyType: 'borrower', primaryContact: { name: 'Amanda Lee', email: 'alee@desertsun.com', phone: '+1 (602) 555-0101', title: 'CFO' }, additionalContacts: [], counselPartyId: 'solar-party-latham' },
  { id: 'solar-party-agent', dealId: 'solar-demo', name: 'CoBank', shortName: 'Agent', role: 'administrative_agent', partyType: 'agent', primaryContact: { name: 'Thomas White', email: 'twhite@cobank.com', phone: '+1 (303) 555-0200', title: 'Managing Director' }, additionalContacts: [], counselPartyId: 'solar-party-milbank' },
  { id: 'solar-party-taxequity', dealId: 'solar-demo', name: 'Tax Equity Fund LP', shortName: 'Tax Equity', role: 'lender', partyType: 'tax_equity', primaryContact: { name: 'Katherine Chen', email: 'kchen@taxequityfund.com', phone: '+1 (212) 555-0300', title: 'Partner' }, additionalContacts: [], counselPartyId: null },
  { id: 'solar-party-latham', dealId: 'solar-demo', name: 'Latham & Watkins LLP', shortName: 'Latham', role: 'borrower', partyType: 'law_firm', primaryContact: { name: 'David Kim', email: 'david.kim@lw.com', phone: '+1 (213) 555-0400', title: 'Partner' }, additionalContacts: [], counselPartyId: null },
  { id: 'solar-party-milbank', dealId: 'solar-demo', name: 'Milbank LLP', shortName: 'Milbank', role: 'administrative_agent', partyType: 'law_firm', primaryContact: { name: 'Jennifer Walsh', email: 'jwalsh@milbank.com', phone: '+1 (212) 555-0500', title: 'Partner' }, additionalContacts: [], counselPartyId: null },
];

const solarNegotiationVersions: DealVersion[] = [
  { id: 'solar-version-1', dealId: 'solar-demo', versionNumber: 1, versionLabel: "Lender's Initial Draft", creditLangCode: '// Solar - Lender Initial\nCOVENANT MinDSCR REQUIRES DSCR >= 1.35 TESTED quarterly', createdBy: 'jwalsh@milbank.com', authorParty: 'Milbank', createdAt: new Date('2025-11-01'), parentVersionId: null, status: 'superseded', generatedWordDoc: null, changeSummary: null },
  { id: 'solar-version-2', dealId: 'solar-demo', versionNumber: 2, versionLabel: "Sponsor's Markup", creditLangCode: '// Solar - Sponsor Markup\nCOVENANT MinDSCR REQUIRES DSCR >= 1.20 TESTED quarterly\nDEGRADATION_SCHEDULE PanelDegradation ANNUAL_DEGRADATION 0.5', createdBy: 'david.kim@lw.com', authorParty: 'Latham', createdAt: new Date('2025-11-15'), parentVersionId: 'solar-version-1', status: 'superseded', generatedWordDoc: null, changeSummary: { versionFrom: 1, versionTo: 2, authorParty: 'Latham', createdAt: new Date('2025-11-15'), totalChanges: 2, covenantChanges: 1, definitionChanges: 0, basketChanges: 0, otherChanges: 1, borrowerFavorable: 2, lenderFavorable: 0, neutral: 0, changes: [
    { id: 'solar-c1', changeType: 'modified', elementType: 'covenant', sectionReference: '7.01', elementName: 'MinDSCR', title: 'DSCR threshold reduced', description: 'Minimum DSCR reduced from 1.35x to 1.20x', rationale: 'Standard project finance threshold', beforeCode: 'REQUIRES DSCR >= 1.35', afterCode: 'REQUIRES DSCR >= 1.20', beforeValue: '1.35x', afterValue: '1.20x', impact: 'borrower_favorable', impactDescription: 'More operational flexibility during ramp-up', sourceForm: 'covenant-simple', isManualEdit: false },
    { id: 'solar-c2', changeType: 'modified', elementType: 'other', sectionReference: '6.05', elementName: 'PanelDegradation', title: 'Higher degradation allowance', description: 'Annual degradation increased from 0.4% to 0.5%', rationale: 'Reflects actual panel performance', beforeCode: 'ANNUAL_DEGRADATION 0.4', afterCode: 'ANNUAL_DEGRADATION 0.5', beforeValue: '0.4%', afterValue: '0.5%', impact: 'borrower_favorable', impactDescription: 'More conservative production assumptions', sourceForm: 'degradation', isManualEdit: false },
  ] } },
  { id: 'solar-version-3', dealId: 'solar-demo', versionNumber: 3, versionLabel: 'Agreed Terms', creditLangCode: solarCode, createdBy: 'jwalsh@milbank.com', authorParty: 'Milbank', createdAt: new Date('2025-12-01'), parentVersionId: 'solar-version-2', status: 'draft', generatedWordDoc: null, changeSummary: { versionFrom: 2, versionTo: 3, authorParty: 'Milbank', createdAt: new Date('2025-12-01'), totalChanges: 1, covenantChanges: 1, definitionChanges: 0, basketChanges: 0, otherChanges: 0, borrowerFavorable: 0, lenderFavorable: 1, neutral: 0, changes: [
    { id: 'solar-c3', changeType: 'modified', elementType: 'covenant', sectionReference: '7.01', elementName: 'MinDSCR', title: 'DSCR compromise', description: 'DSCR set at 1.25x as compromise', rationale: 'Split the difference', beforeCode: 'REQUIRES DSCR >= 1.20', afterCode: 'REQUIRES DSCR >= 1.25', beforeValue: '1.20x', afterValue: '1.25x', impact: 'lender_favorable', impactDescription: 'Compromise between 1.35x and 1.20x', sourceForm: 'covenant-simple', isManualEdit: false },
  ] } },
];

const solarNegotiationDeal: Deal = {
  id: 'solar-demo', name: 'Desert Sun Solar Project', dealType: 'project_finance', facilityAmount: 280_000_000, currency: 'USD', status: 'negotiation', currentVersionId: 'solar-version-3', parties: solarNegotiationParties, targetClosingDate: new Date('2026-03-01'), actualClosingDate: null, maturityDate: new Date('2046-06-30'), createdAt: new Date('2025-10-15'), updatedAt: new Date('2025-12-01'), createdBy: 'twhite@cobank.com',
};

const solarClosingParties: ClosingParty[] = [
  { id: 'solar-cp-1', dealId: 'solar-demo', name: 'Desert Sun Project Co LLC', shortName: 'Borrower', role: 'borrower', partyType: 'borrower' },
  { id: 'solar-cp-2', dealId: 'solar-demo', name: 'CoBank', shortName: 'Agent', role: 'administrative_agent', partyType: 'agent' },
  { id: 'solar-cp-3', dealId: 'solar-demo', name: 'Tax Equity Fund LP', shortName: 'Tax Equity', role: 'lender', partyType: 'tax_equity' },
  { id: 'solar-cp-4', dealId: 'solar-demo', name: 'Latham & Watkins', shortName: 'Borrower Counsel', role: 'counsel', partyType: 'law_firm' },
  { id: 'solar-cp-5', dealId: 'solar-demo', name: 'Milbank', shortName: 'Agent Counsel', role: 'counsel', partyType: 'law_firm' },
];

const solarClosingConditions: ConditionPrecedent[] = [
  { id: 'solar-cond-1', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(a)', category: 'credit_agreement', title: 'Credit Agreement Execution', description: 'Fully executed Credit Agreement', responsiblePartyId: 'solar-cp-4', status: 'pending', dueDate: new Date('2026-03-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-2', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(b)', category: 'offtake', title: 'PPA Executed', description: 'Executed Power Purchase Agreement with utility', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '25-year PPA with APS' },
  { id: 'solar-cond-3', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(c)', category: 'permits', title: 'Interconnection Agreement', description: 'Executed Large Generator Interconnection Agreement', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-20'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-4', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(d)', category: 'technical', title: 'EPC Contract', description: 'Executed EPC contract with creditworthy contractor', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-01-15'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'First Solar as EPC' },
  { id: 'solar-cond-5', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(e)', category: 'tax_equity', title: 'Tax Equity Commitment', description: 'Executed Tax Equity Partnership Agreement', responsiblePartyId: 'solar-cp-3', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Final diligence ongoing' },
  { id: 'solar-cond-6', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(f)', category: 'permits', title: 'Environmental Permits', description: 'All required environmental permits obtained', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-10'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'NEPA complete' },
  { id: 'solar-cond-7', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(g)', category: 'permits', title: 'ALTA Survey', description: 'ALTA/NSPS Land Title Survey', responsiblePartyId: 'solar-cp-1', status: 'pending', dueDate: new Date('2026-02-25'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Survey in progress' },
  { id: 'solar-cond-8', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(h)', category: 'insurance', title: 'Insurance Certificates', description: 'Builder\'s risk and liability insurance', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
];

const solarClosingDocuments: ClosingDocument[] = [
  { id: 'solar-doc-1', dealId: 'solar-demo', documentType: 'credit_agreement', title: 'Credit Agreement', fileName: 'DesertSun_Credit_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-1.pdf', status: 'pending', responsiblePartyId: 'solar-cp-4', uploadedAt: new Date('2026-02-01'), uploadedBy: 'david.kim@lw.com', dueDate: new Date('2026-03-01'), signatures: [], satisfiesConditionIds: ['solar-cond-1'] },
];

const solarClosingDeal: ClosingDeal = { id: 'solar-demo', name: 'Desert Sun Solar Project', facilityAmount: 280_000_000, currency: 'USD', targetClosingDate: new Date('2026-03-01'), status: 'closing' };

// =============================================================================
// WIND NEGOTIATION & CLOSING DATA
// =============================================================================

const windNegotiationParties: DealParty[] = [
  { id: 'wind-party-borrower', dealId: 'wind-demo', name: 'Prairie Wind Holdings LLC', shortName: 'Borrower', role: 'borrower', partyType: 'borrower', primaryContact: { name: 'James Cooper', email: 'jcooper@prairiewind.com', phone: '+1 (405) 555-0100', title: 'CEO' }, additionalContacts: [], counselPartyId: 'wind-party-kirkland' },
  { id: 'wind-party-agent', dealId: 'wind-demo', name: 'MUFG', shortName: 'Agent', role: 'administrative_agent', partyType: 'agent', primaryContact: { name: 'Lisa Yamamoto', email: 'lyamamoto@mufg.com', phone: '+1 (212) 555-0200', title: 'Director' }, additionalContacts: [], counselPartyId: 'wind-party-paulweiss' },
  { id: 'wind-party-kirkland', dealId: 'wind-demo', name: 'Kirkland & Ellis LLP', shortName: 'Kirkland', role: 'borrower', partyType: 'law_firm', primaryContact: { name: 'Mark Stevens', email: 'mstevens@kirkland.com', phone: '+1 (312) 555-0400', title: 'Partner' }, additionalContacts: [], counselPartyId: null },
  { id: 'wind-party-paulweiss', dealId: 'wind-demo', name: 'Paul, Weiss LLP', shortName: 'Paul Weiss', role: 'administrative_agent', partyType: 'law_firm', primaryContact: { name: 'Rachel Green', email: 'rgreen@paulweiss.com', phone: '+1 (212) 555-0500', title: 'Partner' }, additionalContacts: [], counselPartyId: null },
];

const windNegotiationVersions: DealVersion[] = [
  { id: 'wind-version-1', dealId: 'wind-demo', versionNumber: 1, versionLabel: "Lender's Initial Draft", creditLangCode: '// Wind - Lender Initial\nCOVENANT MinDSCR REQUIRES DSCR >= 1.40', createdBy: 'rgreen@paulweiss.com', authorParty: 'Paul Weiss', createdAt: new Date('2025-10-01'), parentVersionId: null, status: 'superseded', generatedWordDoc: null, changeSummary: null },
  { id: 'wind-version-2', dealId: 'wind-demo', versionNumber: 2, versionLabel: "Sponsor's Markup", creditLangCode: '// Wind - Sponsor Markup\nCOVENANT MinDSCR REQUIRES DSCR >= 1.25\nCOVENANT CurtailmentLimit REQUIRES curtailment_pct <= 7.0', createdBy: 'mstevens@kirkland.com', authorParty: 'Kirkland', createdAt: new Date('2025-10-20'), parentVersionId: 'wind-version-1', status: 'superseded', generatedWordDoc: null, changeSummary: { versionFrom: 1, versionTo: 2, authorParty: 'Kirkland', createdAt: new Date('2025-10-20'), totalChanges: 2, covenantChanges: 2, definitionChanges: 0, basketChanges: 0, otherChanges: 0, borrowerFavorable: 2, lenderFavorable: 0, neutral: 0, changes: [
    { id: 'wind-c1', changeType: 'modified', elementType: 'covenant', sectionReference: '7.01', elementName: 'MinDSCR', title: 'DSCR threshold reduced', description: 'Minimum DSCR reduced from 1.40x to 1.25x', rationale: 'Wind variability requires flexibility', beforeCode: 'REQUIRES DSCR >= 1.40', afterCode: 'REQUIRES DSCR >= 1.25', beforeValue: '1.40x', afterValue: '1.25x', impact: 'borrower_favorable', impactDescription: 'More operational flexibility', sourceForm: 'covenant-simple', isManualEdit: false },
    { id: 'wind-c2', changeType: 'modified', elementType: 'covenant', sectionReference: '7.02', elementName: 'CurtailmentLimit', title: 'Higher curtailment allowance', description: 'Curtailment limit increased from 5% to 7%', rationale: 'Grid constraints in region', beforeCode: 'REQUIRES curtailment_pct <= 5.0', afterCode: 'REQUIRES curtailment_pct <= 7.0', beforeValue: '5.0%', afterValue: '7.0%', impact: 'borrower_favorable', impactDescription: 'Accounts for expected grid curtailment', sourceForm: 'covenant-simple', isManualEdit: false },
  ] } },
  { id: 'wind-version-3', dealId: 'wind-demo', versionNumber: 3, versionLabel: 'Agreed Terms', creditLangCode: windCode, createdBy: 'rgreen@paulweiss.com', authorParty: 'Paul Weiss', createdAt: new Date('2025-11-15'), parentVersionId: 'wind-version-2', status: 'draft', generatedWordDoc: null, changeSummary: { versionFrom: 2, versionTo: 3, authorParty: 'Paul Weiss', createdAt: new Date('2025-11-15'), totalChanges: 1, covenantChanges: 1, definitionChanges: 0, basketChanges: 0, otherChanges: 0, borrowerFavorable: 0, lenderFavorable: 1, neutral: 0, changes: [
    { id: 'wind-c3', changeType: 'modified', elementType: 'covenant', sectionReference: '7.01', elementName: 'MinDSCR', title: 'DSCR compromise', description: 'DSCR set at 1.30x as compromise', rationale: 'Split the difference', beforeCode: 'REQUIRES DSCR >= 1.25', afterCode: 'REQUIRES DSCR >= 1.30', beforeValue: '1.25x', afterValue: '1.30x', impact: 'lender_favorable', impactDescription: 'Compromise between 1.40x and 1.25x', sourceForm: 'covenant-simple', isManualEdit: false },
  ] } },
];

const windNegotiationDeal: Deal = {
  id: 'wind-demo', name: 'Prairie Wind Farm', dealType: 'project_finance', facilityAmount: 200_000_000, currency: 'USD', status: 'negotiation', currentVersionId: 'wind-version-3', parties: windNegotiationParties, targetClosingDate: new Date('2026-02-20'), actualClosingDate: null, maturityDate: new Date('2041-03-31'), createdAt: new Date('2025-09-15'), updatedAt: new Date('2025-11-15'), createdBy: 'lyamamoto@mufg.com',
};

const windClosingParties: ClosingParty[] = [
  { id: 'wind-cp-1', dealId: 'wind-demo', name: 'Prairie Wind Holdings LLC', shortName: 'Borrower', role: 'borrower', partyType: 'borrower' },
  { id: 'wind-cp-2', dealId: 'wind-demo', name: 'MUFG', shortName: 'Agent', role: 'administrative_agent', partyType: 'agent' },
  { id: 'wind-cp-3', dealId: 'wind-demo', name: 'Kirkland & Ellis', shortName: 'Borrower Counsel', role: 'counsel', partyType: 'law_firm' },
  { id: 'wind-cp-4', dealId: 'wind-demo', name: 'Paul, Weiss', shortName: 'Agent Counsel', role: 'counsel', partyType: 'law_firm' },
];

const windClosingConditions: ConditionPrecedent[] = [
  { id: 'wind-cond-1', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(a)', category: 'credit_agreement', title: 'Credit Agreement Execution', description: 'Fully executed Credit Agreement', responsiblePartyId: 'wind-cp-3', status: 'pending', dueDate: new Date('2026-02-20'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-2', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(b)', category: 'technical', title: 'Turbine Supply Agreement', description: 'Executed TSA with Vestas', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-15'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'V150 4.2MW turbines' },
  { id: 'wind-cond-3', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(c)', category: 'technical', title: 'Wind Resource Study', description: 'Independent wind resource assessment', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-01-15'), satisfiedAt: new Date('2025-12-20'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'DNV completed P50/P90 analysis' },
  { id: 'wind-cond-4', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(d)', category: 'permits', title: 'FAA Determination', description: 'FAA No Hazard Determination for all turbines', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-10'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-5', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(e)', category: 'permits', title: 'Tribal Consultation', description: 'Completed tribal consultation process', responsiblePartyId: 'wind-cp-1', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Final meeting scheduled' },
  { id: 'wind-cond-6', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(f)', category: 'offtake', title: 'Hedge Agreement', description: 'Revenue hedge with investment grade counterparty', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '10-year fixed price hedge' },
];

const windClosingDocuments: ClosingDocument[] = [
  { id: 'wind-doc-1', dealId: 'wind-demo', documentType: 'credit_agreement', title: 'Credit Agreement', fileName: 'PrairieWind_Credit_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-1.pdf', status: 'pending', responsiblePartyId: 'wind-cp-3', uploadedAt: new Date('2026-02-01'), uploadedBy: 'mstevens@kirkland.com', dueDate: new Date('2026-02-20'), signatures: [], satisfiesConditionIds: ['wind-cond-1'] },
];

const windClosingDeal: ClosingDeal = { id: 'wind-demo', name: 'Prairie Wind Farm', facilityAmount: 200_000_000, currency: 'USD', targetClosingDate: new Date('2026-02-20'), status: 'closing' };

// =============================================================================
// CORPORATE NEGOTIATION & CLOSING DATA
// =============================================================================

const corporateNegotiationParties: DealParty[] = [
  { id: 'corp-party-borrower', dealId: 'corporate-demo', name: 'Apex Industries Inc.', shortName: 'Borrower', role: 'borrower', partyType: 'borrower', primaryContact: { name: 'Patricia Reynolds', email: 'preynolds@apexind.com', phone: '+1 (312) 555-0100', title: 'CFO' }, additionalContacts: [], counselPartyId: 'corp-party-simpson' },
  { id: 'corp-party-agent', dealId: 'corporate-demo', name: 'JPMorgan Chase', shortName: 'Agent', role: 'administrative_agent', partyType: 'agent', primaryContact: { name: 'Brian Mitchell', email: 'bmitchell@jpmorgan.com', phone: '+1 (212) 555-0200', title: 'Managing Director' }, additionalContacts: [], counselPartyId: 'corp-party-cahill' },
  { id: 'corp-party-simpson', dealId: 'corporate-demo', name: 'Simpson Thacher & Bartlett', shortName: 'Simpson Thacher', role: 'borrower', partyType: 'law_firm', primaryContact: { name: 'Andrew Blake', email: 'ablake@stblaw.com', phone: '+1 (212) 555-0400', title: 'Partner' }, additionalContacts: [], counselPartyId: null },
  { id: 'corp-party-cahill', dealId: 'corporate-demo', name: 'Cahill Gordon & Reindel', shortName: 'Cahill', role: 'administrative_agent', partyType: 'law_firm', primaryContact: { name: 'Susan Clark', email: 'sclark@cahill.com', phone: '+1 (212) 555-0500', title: 'Partner' }, additionalContacts: [], counselPartyId: null },
];

const corporateNegotiationVersions: DealVersion[] = [
  { id: 'corp-version-1', dealId: 'corporate-demo', versionNumber: 1, versionLabel: "Lender's Initial Draft", creditLangCode: '// Corporate - Lender Initial\nCOVENANT MaxLeverage REQUIRES Leverage <= 4.25\nBASKET GeneralInvestments CAPACITY $20_000_000', createdBy: 'sclark@cahill.com', authorParty: 'Cahill', createdAt: new Date('2024-05-01'), parentVersionId: null, status: 'superseded', generatedWordDoc: null, changeSummary: null },
  { id: 'corp-version-2', dealId: 'corporate-demo', versionNumber: 2, versionLabel: "Borrower's Markup", creditLangCode: '// Corporate - Borrower Markup\nCOVENANT MaxLeverage REQUIRES Leverage <= 4.75 CURE EquityCure MAX_USES 3\nBASKET GeneralInvestments CAPACITY $30_000_000\nBASKET EBITDAInvestments CAPACITY 0.20 * EBITDA FLOOR $20_000_000', createdBy: 'ablake@stblaw.com', authorParty: 'Simpson Thacher', createdAt: new Date('2024-05-15'), parentVersionId: 'corp-version-1', status: 'superseded', generatedWordDoc: null, changeSummary: { versionFrom: 1, versionTo: 2, authorParty: 'Simpson Thacher', createdAt: new Date('2024-05-15'), totalChanges: 3, covenantChanges: 1, definitionChanges: 0, basketChanges: 2, otherChanges: 0, borrowerFavorable: 3, lenderFavorable: 0, neutral: 0, changes: [
    { id: 'corp-c1', changeType: 'modified', elementType: 'covenant', sectionReference: '7.11', elementName: 'MaxLeverage', title: 'Leverage threshold increased', description: 'Maximum leverage increased from 4.25x to 4.75x with cure rights', rationale: 'Need M&A flexibility', beforeCode: 'REQUIRES Leverage <= 4.25', afterCode: 'REQUIRES Leverage <= 4.75 CURE EquityCure MAX_USES 3', beforeValue: '4.25x', afterValue: '4.75x + cure', impact: 'borrower_favorable', impactDescription: '+0.50x headroom plus cure protection', sourceForm: 'covenant-simple', isManualEdit: false },
    { id: 'corp-c2', changeType: 'modified', elementType: 'basket', sectionReference: '7.02(f)', elementName: 'GeneralInvestments', title: 'Fixed basket increased', description: 'General investments increased from $20M to $30M', rationale: null, beforeCode: 'CAPACITY $20_000_000', afterCode: 'CAPACITY $30_000_000', beforeValue: '$20M', afterValue: '$30M', impact: 'borrower_favorable', impactDescription: '+$10M investment capacity', sourceForm: 'basket-fixed', isManualEdit: false },
    { id: 'corp-c3', changeType: 'added', elementType: 'basket', sectionReference: '7.02(g)', elementName: 'EBITDAInvestments', title: 'Grower basket added', description: 'New 20% EBITDA grower basket with $20M floor', rationale: 'Scale with company growth', beforeCode: null, afterCode: 'CAPACITY 0.20 * EBITDA FLOOR $20_000_000', beforeValue: null, afterValue: '20% EBITDA / $20M floor', impact: 'borrower_favorable', impactDescription: 'Capacity grows with earnings', sourceForm: 'basket-grower', isManualEdit: false },
  ] } },
  { id: 'corp-version-3', dealId: 'corporate-demo', versionNumber: 3, versionLabel: 'Agreed Terms', creditLangCode: corporateCode, createdBy: 'sclark@cahill.com', authorParty: 'Cahill', createdAt: new Date('2024-06-01'), parentVersionId: 'corp-version-2', status: 'executed', generatedWordDoc: null, changeSummary: { versionFrom: 2, versionTo: 3, authorParty: 'Cahill', createdAt: new Date('2024-06-01'), totalChanges: 2, covenantChanges: 1, definitionChanges: 0, basketChanges: 1, otherChanges: 0, borrowerFavorable: 0, lenderFavorable: 1, neutral: 1, changes: [
    { id: 'corp-c4', changeType: 'modified', elementType: 'covenant', sectionReference: '7.11', elementName: 'MaxLeverage', title: 'Leverage compromise', description: 'Final leverage at 4.50x with cure', rationale: 'Split the difference', beforeCode: 'REQUIRES Leverage <= 4.75', afterCode: 'REQUIRES Leverage <= 4.50', beforeValue: '4.75x', afterValue: '4.50x', impact: 'lender_favorable', impactDescription: 'Compromise between 4.25x and 4.75x', sourceForm: 'covenant-simple', isManualEdit: false },
    { id: 'corp-c5', changeType: 'modified', elementType: 'basket', sectionReference: '7.02(g)', elementName: 'EBITDAInvestments', title: 'Grower basket adjusted', description: 'Grower reduced to 15% with $15M floor', rationale: null, beforeCode: 'CAPACITY 0.20 * EBITDA FLOOR $20_000_000', afterCode: 'CAPACITY 0.15 * EBITDA FLOOR $15_000_000', beforeValue: '20% / $20M', afterValue: '15% / $15M', impact: 'neutral', impactDescription: 'Compromise on grower sizing', sourceForm: 'basket-grower', isManualEdit: false },
  ] } },
];

const corporateNegotiationDeal: Deal = {
  id: 'corporate-demo', name: 'Apex Industries Credit Facility', dealType: 'corporate', facilityAmount: 150_000_000, currency: 'USD', status: 'active', currentVersionId: 'corp-version-3', parties: corporateNegotiationParties, targetClosingDate: new Date('2024-06-15'), actualClosingDate: new Date('2024-06-15'), maturityDate: new Date('2029-06-15'), createdAt: new Date('2024-04-15'), updatedAt: new Date('2024-06-15'), createdBy: 'bmitchell@jpmorgan.com',
};

const corporateClosingParties: ClosingParty[] = [
  { id: 'corp-cp-1', dealId: 'corporate-demo', name: 'Apex Industries Inc.', shortName: 'Borrower', role: 'borrower', partyType: 'borrower' },
  { id: 'corp-cp-2', dealId: 'corporate-demo', name: 'JPMorgan Chase', shortName: 'Agent', role: 'administrative_agent', partyType: 'agent' },
  { id: 'corp-cp-3', dealId: 'corporate-demo', name: 'Simpson Thacher', shortName: 'Borrower Counsel', role: 'counsel', partyType: 'law_firm' },
  { id: 'corp-cp-4', dealId: 'corporate-demo', name: 'Cahill Gordon', shortName: 'Agent Counsel', role: 'counsel', partyType: 'law_firm' },
];

const corporateClosingConditions: ConditionPrecedent[] = [
  { id: 'corp-cond-1', dealId: 'corporate-demo', versionId: 'corp-version-3', sectionReference: '4.01(a)', category: 'credit_agreement', title: 'Credit Agreement Execution', description: 'Fully executed Credit Agreement', responsiblePartyId: 'corp-cp-3', status: 'satisfied', dueDate: new Date('2024-06-15'), satisfiedAt: new Date('2024-06-15'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'corp-cond-2', dealId: 'corporate-demo', versionId: 'corp-version-3', sectionReference: '4.01(b)', category: 'corporate_documents', title: 'Corporate Documents', description: 'Charter, bylaws, and resolutions', responsiblePartyId: 'corp-cp-1', status: 'satisfied', dueDate: new Date('2024-06-10'), satisfiedAt: new Date('2024-06-08'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'corp-cond-3', dealId: 'corporate-demo', versionId: 'corp-version-3', sectionReference: '4.01(c)', category: 'security_documents', title: 'Security Agreement', description: 'Security Agreement and UCC filings', responsiblePartyId: 'corp-cp-3', status: 'satisfied', dueDate: new Date('2024-06-15'), satisfiedAt: new Date('2024-06-15'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'corp-cond-4', dealId: 'corporate-demo', versionId: 'corp-version-3', sectionReference: '4.01(d)', category: 'legal_opinions', title: 'Legal Opinions', description: 'Borrower counsel and local counsel opinions', responsiblePartyId: 'corp-cp-3', status: 'satisfied', dueDate: new Date('2024-06-15'), satisfiedAt: new Date('2024-06-14'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'corp-cond-5', dealId: 'corporate-demo', versionId: 'corp-version-3', sectionReference: '4.01(e)', category: 'certificates', title: 'Solvency Certificate', description: 'CFO solvency certificate', responsiblePartyId: 'corp-cp-1', status: 'satisfied', dueDate: new Date('2024-06-15'), satisfiedAt: new Date('2024-06-15'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'corp-cond-6', dealId: 'corporate-demo', versionId: 'corp-version-3', sectionReference: '4.01(f)', category: 'financial', title: 'Financial Statements', description: 'Audited financials and compliance certificate', responsiblePartyId: 'corp-cp-1', status: 'satisfied', dueDate: new Date('2024-06-10'), satisfiedAt: new Date('2024-06-05'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
];

const corporateClosingDocuments: ClosingDocument[] = [
  { id: 'corp-doc-1', dealId: 'corporate-demo', documentType: 'credit_agreement', title: 'Credit Agreement', fileName: 'Apex_Credit_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/corp-doc-1.pdf', status: 'executed', responsiblePartyId: 'corp-cp-3', uploadedAt: new Date('2024-06-15'), uploadedBy: 'ablake@stblaw.com', dueDate: new Date('2024-06-15'), signatures: [], satisfiesConditionIds: ['corp-cond-1'] },
];

const corporateClosingDeal: ClosingDeal = { id: 'corporate-demo', name: 'Apex Industries Credit Facility', facilityAmount: 150_000_000, currency: 'USD', targetClosingDate: new Date('2024-06-15'), status: 'active' };

// =============================================================================
// COMPLETE SCENARIO EXPORTS
// =============================================================================

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
  negotiation: { deal: solarNegotiationDeal, parties: solarNegotiationParties, versions: solarNegotiationVersions },
  closing: { deal: solarClosingDeal, parties: solarClosingParties, conditions: solarClosingConditions, documents: solarClosingDocuments },
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
  negotiation: { deal: windNegotiationDeal, parties: windNegotiationParties, versions: windNegotiationVersions },
  closing: { deal: windClosingDeal, parties: windClosingParties, conditions: windClosingConditions, documents: windClosingDocuments },
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
  negotiation: { deal: corporateNegotiationDeal, parties: corporateNegotiationParties, versions: corporateNegotiationVersions },
  closing: { deal: corporateClosingDeal, parties: corporateClosingParties, conditions: corporateClosingConditions, documents: corporateClosingDocuments },
};

// =============================================================================
// EXPORTS
// =============================================================================

export const demoScenarios: Record<string, DemoScenario> = {
  'abc-acquisition': abcScenario,
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
    case 'abc':
    case 'abc-acquisition':
      return abcScenario;
    default:
      return undefined;
  }
}

export function getAllScenarios(): DemoScenario[] {
  return Object.values(demoScenarios);
}

export default demoScenarios;
