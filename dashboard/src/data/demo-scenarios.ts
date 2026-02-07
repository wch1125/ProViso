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
  | 'real_estate'
  | 'project_documents'
  | 'construction'
  | 'accounts'
  | 'post_closing'
  | 'due_diligence'
  | 'consents'
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

MILESTONE FinalInspection
  TARGET 2026-04-20
  LONGSTOP 2026-07-20
  REQUIRES InverterCommissioning

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

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP PPAExecuted
    DESCRIPTION "Executed Power Purchase Agreement with utility"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP InterconnectionAgreement
    DESCRIPTION "Executed Large Generator Interconnection Agreement"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP EPCContract
    DESCRIPTION "Executed EPC contract with creditworthy contractor"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP TaxEquityCommitment
    DESCRIPTION "Executed Tax Equity Partnership Agreement"
    RESPONSIBLE TaxCounsel
    STATUS pending

  CP EnvironmentalPermits
    DESCRIPTION "All required environmental permits obtained"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP ALTASurvey
    DESCRIPTION "ALTA/NSPS Land Title Survey"
    RESPONSIBLE Borrower
    STATUS pending

  CP InsuranceCertificates
    DESCRIPTION "Builder's risk and liability insurance"
    RESPONSIBLE Borrower
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
      total_project_cost: 280_000_000,
      equity_contributed: 84_000_000,
      monthly_debt_service: 1_300_000,
      annual_capex_budget: 2_600_000,
      operating_expenses: 5_100_000,
      distributions: 5_500_000,
      Revenue: 36_500_000,
      total_assets: 298_000_000,
      annual_gwh: 460,
      availability_pct: 97.8,
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
      total_project_cost: 280_000_000,
      equity_contributed: 84_000_000,
      monthly_debt_service: 1_300_000,
      annual_capex_budget: 2_600_000,
      operating_expenses: 5_150_000,
      distributions: 5_800_000,
      Revenue: 37_200_000,
      total_assets: 297_000_000,
      annual_gwh: 465,
      availability_pct: 98.0,
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
      total_project_cost: 280_000_000,
      equity_contributed: 84_000_000,
      monthly_debt_service: 1_300_000,
      annual_capex_budget: 2_600_000,
      operating_expenses: 5_200_000,
      distributions: 5_500_000,
      Revenue: 36_000_000,
      total_assets: 296_000_000,
      annual_gwh: 450,
      availability_pct: 97.5,
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
      total_project_cost: 280_000_000,
      equity_contributed: 84_000_000,
      monthly_debt_service: 1_300_000,
      annual_capex_budget: 2_600_000,
      operating_expenses: 5_200_000,
      distributions: 6_000_000,
      Revenue: 37_800_000,
      total_assets: 296_000_000,
      annual_gwh: 470,
      availability_pct: 98.1,
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
      total_project_cost: 280_000_000,
      equity_contributed: 84_000_000,
      monthly_debt_service: 1_300_000,
      annual_capex_budget: 2_600_000,
      operating_expenses: 5_200_000,
      distributions: 6_000_000,
      Revenue: 38_000_000,
      total_assets: 295_500_000,
      annual_gwh: 473,
      availability_pct: 98.2,
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
// $320M Construction + Term Loan
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

MILESTONE SubstationComplete
  TARGET 2026-01-31
  LONGSTOP 2026-03-31
  REQUIRES TowerErection

MILESTONE TurbineCommissioning
  TARGET 2026-02-15
  LONGSTOP 2026-04-30
  REQUIRES BladeInstallation

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

PERFORMANCE_GUARANTEE TurbineAvailability
  METRIC availability_pct
  P50 97.0
  P75 96.0
  P90 95.0
  P99 93.0
  GUARANTEE_PERIOD "20 YEARS"

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialFunding
  SECTION "4.01"

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP TurbineSupplyAgreement
    DESCRIPTION "Executed TSA with Vestas"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP WindResourceStudy
    DESCRIPTION "Independent wind resource assessment"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP FAA_Determination
    DESCRIPTION "FAA No Hazard Determination for all turbines"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP TribalConsultation
    DESCRIPTION "Completed tribal consultation process"
    RESPONSIBLE Borrower
    STATUS pending

  CP HedgeAgreement
    DESCRIPTION "Revenue hedge with investment grade counterparty"
    RESPONSIBLE Borrower
    STATUS satisfied
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
  total_project_cost: 320_000_000,
  equity_contributed: 96_000_000,

  // Cash flow
  monthly_debt_service: 960_000,
  gearbox_replacement_cost: 8_000_000,
  operating_expenses: 3_800_000,
  distributions: 4_500_000,
  Revenue: 28_000_000,

  // Performance
  capacity_factor_pct: 39.2,
  curtailment_pct: 3.8,
  availability_pct: 96.5,

  // Balance sheet
  total_assets: 340_000_000,
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
      senior_interest: 7_200_000,
      senior_principal: 4_300_000,
      total_project_cost: 320_000_000,
      equity_contributed: 96_000_000,
      monthly_debt_service: 960_000,
      gearbox_replacement_cost: 8_000_000,
      operating_expenses: 3_700_000,
      distributions: 4_200_000,
      Revenue: 26_500_000,
      total_assets: 345_000_000,
      capacity_factor_pct: 38.5,
      curtailment_pct: 3.5,
      availability_pct: 96.2,
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
      senior_interest: 7_150_000,
      senior_principal: 4_400_000,
      total_project_cost: 320_000_000,
      equity_contributed: 96_000_000,
      monthly_debt_service: 960_000,
      gearbox_replacement_cost: 8_000_000,
      operating_expenses: 3_750_000,
      distributions: 4_300_000,
      Revenue: 27_000_000,
      total_assets: 344_000_000,
      capacity_factor_pct: 38.8,
      curtailment_pct: 3.6,
      availability_pct: 96.8,
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
      senior_interest: 7_100_000,
      senior_principal: 4_450_000,
      total_project_cost: 320_000_000,
      equity_contributed: 96_000_000,
      monthly_debt_service: 960_000,
      gearbox_replacement_cost: 8_000_000,
      operating_expenses: 3_780_000,
      distributions: 4_400_000,
      Revenue: 27_500_000,
      total_assets: 343_000_000,
      capacity_factor_pct: 39.0,
      curtailment_pct: 3.7,
      availability_pct: 97.1,
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
      senior_interest: 7_050_000,
      senior_principal: 4_500_000,
      total_project_cost: 320_000_000,
      equity_contributed: 96_000_000,
      monthly_debt_service: 960_000,
      gearbox_replacement_cost: 8_000_000,
      operating_expenses: 3_800_000,
      distributions: 4_200_000,
      Revenue: 26_000_000,
      total_assets: 342_000_000,
      capacity_factor_pct: 37.5,
      curtailment_pct: 4.8,
      availability_pct: 95.3,
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
      senior_interest: 7_000_000,
      senior_principal: 4_500_000,
      total_project_cost: 320_000_000,
      equity_contributed: 96_000_000,
      monthly_debt_service: 960_000,
      gearbox_replacement_cost: 8_000_000,
      operating_expenses: 3_800_000,
      distributions: 4_500_000,
      Revenue: 27_800_000,
      total_assets: 341_000_000,
      capacity_factor_pct: 39.0,
      curtailment_pct: 3.9,
      availability_pct: 96.7,
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

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialClosing
  SECTION "4.01"

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP CorporateDocuments
    DESCRIPTION "Charter, bylaws, and resolutions"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP SecurityAgreement
    DESCRIPTION "Security Agreement and UCC filings"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP LegalOpinions
    DESCRIPTION "Borrower counsel and local counsel opinions"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP SolvencyCertificate
    DESCRIPTION "CFO solvency certificate"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP FinancialStatements
    DESCRIPTION "Audited financials and compliance certificate"
    RESPONSIBLE Borrower
    STATUS satisfied
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
      extraordinary_items: 0,
      funded_debt: 175_000_000,
      capital_leases: 5_000_000,
      principal_payments: 3_400_000,
      cash: 22_000_000,
      total_assets: 355_000_000,
      asset_sale_reinvestment: 0,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
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
      extraordinary_items: 0,
      funded_debt: 173_000_000,
      capital_leases: 4_800_000,
      principal_payments: 3_300_000,
      cash: 19_500_000,
      total_assets: 358_000_000,
      asset_sale_reinvestment: 1_200_000,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
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
      extraordinary_items: 0,
      funded_debt: 172_000_000,
      capital_leases: 4_700_000,
      principal_payments: 3_250_000,
      cash: 16_200_000,
      total_assets: 360_000_000,
      asset_sale_reinvestment: 800_000,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
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
      extraordinary_items: 0,
      funded_debt: 170_000_000,
      capital_leases: 4_600_000,
      principal_payments: 3_200_000,
      cash: 17_800_000,
      total_assets: 362_000_000,
      asset_sale_reinvestment: 1_800_000,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
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
      extraordinary_items: 0,
      funded_debt: 168_000_000,
      capital_leases: 4_550_000,
      principal_payments: 3_200_000,
      cash: 18_200_000,
      total_assets: 364_000_000,
      asset_sale_reinvestment: 2_100_000,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
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
// $150M Revolver + Term Loan — Leveraged Acquisition

// ==================== DEFINITIONS ====================

DEFINE EBITDA AS (
  NetIncome
  + InterestExpense
  + TaxExpense
  + DepreciationAmortization
  + StockBasedComp
) EXCLUDING extraordinary_items
  CAPPED AT $5_000_000

DEFINE TotalDebt AS SeniorDebt + SubordinatedDebt

DEFINE SeniorDebtAmt AS SeniorDebt

DEFINE Leverage AS TotalDebt / EBITDA

DEFINE InterestCoverage AS EBITDA / InterestExpense

DEFINE FixedChargeCoverage AS
  EBITDA / (InterestExpense + principal_payments + capital_leases)

DEFINE DebtService AS InterestExpense + principal_payments

DEFINE DSCR AS EBITDA / DebtService

// ==================== COVENANTS ====================

// NEAR-BREACH: Leverage at 4.49x vs 4.75x threshold (95%)
COVENANT MaxLeverage
  REQUIRES Leverage <= 4.75
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $20_000_000
  BREACH -> UnmaturedDefault

COVENANT MinInterestCoverage
  REQUIRES InterestCoverage >= 2.25
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 2 OVER trailing_4_quarters
  BREACH -> UnmaturedDefault

COVENANT MinFixedCharge
  REQUIRES FixedChargeCoverage >= 1.10
  TESTED QUARTERLY
  BREACH -> UnmaturedDefault

COVENANT MinLiquidity
  REQUIRES cash >= 10_000_000
  TESTED QUARTERLY

COVENANT MinDSCR
  REQUIRES DSCR >= 1.15
  TESTED QUARTERLY

// ==================== BASKETS ====================

BASKET GeneralInvestments
  CAPACITY GreaterOf($30_000_000, 12.5% * EBITDA)

BASKET PermittedAcquisitions
  CAPACITY $60_000_000
  SUBJECT TO ProFormaCompliance

BASKET RestrictedPayments
  CAPACITY GreaterOf($10_000_000, 0.05 * total_assets)

BASKET CapEx
  CAPACITY $20_000_000

// ==================== GROWER BASKETS ====================

BASKET EBITDAInvestments
  CAPACITY 0.15 * EBITDA
  FLOOR $15_000_000
  SUBJECT TO NoDefault

BASKET AssetBasedBasket
  CAPACITY 0.05 * total_assets
  FLOOR $5_000_000

// ==================== BUILDER BASKETS ====================

BASKET RetainedEarningsBasket
  BUILDS_FROM 0.50 * NetIncome
  STARTING $8_000_000
  MAXIMUM $50_000_000
  SUBJECT TO NoDefault

BASKET AssetSaleProceeds
  BUILDS_FROM asset_sale_reinvestment
  STARTING $0
  MAXIMUM $35_000_000

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
  TRIGGERS WHEN external_debt_default > 5_000_000
  CONSEQUENCE EventOfDefault

// ==================== CONDITIONS PRECEDENT ====================

CONDITIONS_PRECEDENT InitialClosing
  SECTION "4.01"

  CP CreditAgreementExecution
    DESCRIPTION "Fully executed Credit Agreement"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP CommitmentLetter
    DESCRIPTION "Executed Commitment Letter from each Lender"
    RESPONSIBLE Agent
    STATUS satisfied

  CP FeeLetter
    DESCRIPTION "Executed Fee Letter between Borrower and Agent"
    RESPONSIBLE Agent
    STATUS satisfied

  CP SecurityAgreement
    DESCRIPTION "Security Agreement granting first-priority security interest"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP PledgeAgreement
    DESCRIPTION "Pledge Agreement covering equity interests in subsidiaries"
    RESPONSIBLE BorrowerCounsel
    STATUS satisfied

  CP Guaranty
    DESCRIPTION "Unconditional guaranty from Parent and material subsidiaries"
    RESPONSIBLE Guarantor
    STATUS satisfied

  CP CertificateOfFormation
    DESCRIPTION "Certified Certificate of Formation from Delaware"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP BoardResolutions
    DESCRIPTION "Board resolutions authorizing the Transaction"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP GoodStandingDE
    DESCRIPTION "Certificate of Good Standing from Delaware"
    RESPONSIBLE Borrower
    STATUS pending

  CP GoodStandingNY
    DESCRIPTION "Certificate of Good Standing from New York"
    RESPONSIBLE Borrower
    STATUS pending

  CP BorrowerCounselOpinion
    DESCRIPTION "Legal opinion of Davis Polk"
    RESPONSIBLE BorrowerCounsel
    STATUS pending

  CP AgentCounselOpinion
    DESCRIPTION "Legal opinion of Simpson Thacher"
    RESPONSIBLE AgentCounsel
    STATUS pending

  CP SolvencyCertificate
    DESCRIPTION "Solvency Certificate from the CFO"
    RESPONSIBLE Borrower
    STATUS pending

  CP InsuranceCertificate
    DESCRIPTION "Certificate of insurance with Agent as loss payee"
    RESPONSIBLE Borrower
    STATUS pending

  CP KYCDocumentation
    DESCRIPTION "KYC documentation for all Lenders"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP BeneficialOwnership
    DESCRIPTION "Beneficial Ownership Certification per 31 CFR 1010.230"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP FinancialStatements
    DESCRIPTION "Audited financial statements for FY 2023-2025"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP ProFormaFinancialModel
    DESCRIPTION "Pro forma model showing projected covenant compliance"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP QualityOfEarnings
    DESCRIPTION "Quality of Earnings report from independent accounting firm"
    RESPONSIBLE Borrower
    STATUS satisfied

  CP UCC1Borrower
    DESCRIPTION "UCC-1 Financing Statement (Borrower)"
    RESPONSIBLE AgentCounsel
    STATUS pending

  CP LienSearchResults
    DESCRIPTION "UCC, tax lien, and judgment search results"
    RESPONSIBLE AgentCounsel
    STATUS satisfied
`;

const abcFinancials: SimpleFinancialData = {
  // Income statement
  NetIncome: 15_000_000,
  InterestExpense: 7_500_000,
  TaxExpense: 5_000_000,
  DepreciationAmortization: 6_000_000,
  StockBasedComp: 1_200_000,
  extraordinary_items: 0,

  // Debt structure — 95% of covenant
  SeniorDebt: 120_000_000,
  SubordinatedDebt: 30_000_000,
  principal_payments: 4_800_000,
  capital_leases: 3_200_000,

  // Liquidity
  cash: 12_500_000,
  total_assets: 300_000_000,

  // Basket tracking
  asset_sale_reinvestment: 1_500_000,

  // Event triggers
  payment_due: 0,
  payment_received: 1,
  external_debt_default: 0,
};

const abcHistoricalData: HistoricalPeriod[] = [
  {
    period: 'Q4 2024',
    periodEnd: '2024-12-31',
    data: {
      NetIncome: 13_500_000,
      InterestExpense: 8_200_000,
      TaxExpense: 4_600_000,
      DepreciationAmortization: 5_800_000,
      StockBasedComp: 1_100_000,
      extraordinary_items: 0,
      SeniorDebt: 128_000_000,
      SubordinatedDebt: 32_000_000,
      principal_payments: 5_000_000,
      capital_leases: 3_500_000,
      cash: 16_000_000,
      total_assets: 295_000_000,
      asset_sale_reinvestment: 0,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q1 2025',
    periodEnd: '2025-03-31',
    data: {
      NetIncome: 12_800_000,
      InterestExpense: 8_000_000,
      TaxExpense: 4_300_000,
      DepreciationAmortization: 5_900_000,
      StockBasedComp: 1_150_000,
      extraordinary_items: 0,
      SeniorDebt: 126_000_000,
      SubordinatedDebt: 31_500_000,
      principal_payments: 4_900_000,
      capital_leases: 3_400_000,
      cash: 14_200_000,
      total_assets: 296_000_000,
      asset_sale_reinvestment: 600_000,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q2 2025',
    periodEnd: '2025-06-30',
    data: {
      // Weak quarter — leverage breach, cured
      NetIncome: 10_500_000,
      InterestExpense: 7_900_000,
      TaxExpense: 3_500_000,
      DepreciationAmortization: 5_950_000,
      StockBasedComp: 1_150_000,
      extraordinary_items: 0,
      SeniorDebt: 125_000_000,
      SubordinatedDebt: 31_200_000,
      principal_payments: 4_900_000,
      capital_leases: 3_350_000,
      cash: 11_800_000,
      total_assets: 297_000_000,
      asset_sale_reinvestment: 400_000,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
    },
    complianceStatus: 'cured',
    cureUsed: 'MaxLeverage - $4M equity cure applied (1 of 2 uses)',
  },
  {
    period: 'Q3 2025',
    periodEnd: '2025-09-30',
    data: {
      NetIncome: 14_200_000,
      InterestExpense: 7_700_000,
      TaxExpense: 4_800_000,
      DepreciationAmortization: 5_980_000,
      StockBasedComp: 1_180_000,
      extraordinary_items: 0,
      SeniorDebt: 123_000_000,
      SubordinatedDebt: 31_000_000,
      principal_payments: 4_850_000,
      capital_leases: 3_300_000,
      cash: 13_500_000,
      total_assets: 298_000_000,
      asset_sale_reinvestment: 900_000,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
    },
    complianceStatus: 'compliant',
  },
  {
    period: 'Q4 2025',
    periodEnd: '2025-12-31',
    data: {
      NetIncome: 14_800_000,
      InterestExpense: 7_600_000,
      TaxExpense: 4_950_000,
      DepreciationAmortization: 6_000_000,
      StockBasedComp: 1_200_000,
      extraordinary_items: 0,
      SeniorDebt: 121_000_000,
      SubordinatedDebt: 30_500_000,
      principal_payments: 4_800_000,
      capital_leases: 3_250_000,
      cash: 12_800_000,
      total_assets: 299_000_000,
      asset_sale_reinvestment: 1_200_000,
      payment_due: 0,
      payment_received: 1,
      external_debt_default: 0,
    },
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
      description: 'Leverage at 4.49x vs 4.75x threshold (95%)',
      severity: 'warning',
    },
    {
      type: 'cure_used',
      element: 'MaxLeverage',
      description: '$4M equity cure applied in Q2 2025 (1 of 2 uses)',
      severity: 'warning',
    },
    {
      type: 'near_breach',
      element: 'MinLiquidity',
      description: 'Cash at $12.5M vs $10M minimum (close to floor)',
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
COVENANT MaxLeverage REQUIRES Leverage <= 5.00 TESTED QUARTERLY
COVENANT MinInterestCoverage REQUIRES EBITDA / InterestExpense >= 2.50 TESTED QUARTERLY
BASKET GeneralInvestments CAPACITY GreaterOf($25_000_000, 10% * EBITDA)
BASKET PermittedAcquisitions CAPACITY $50_000_000 SUBJECT TO ProFormaCompliance`,
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
COVENANT MaxLeverage REQUIRES Leverage <= 5.25 TESTED QUARTERLY CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $25_000_000
COVENANT MinInterestCoverage REQUIRES EBITDA / InterestExpense >= 2.25 TESTED QUARTERLY
BASKET GeneralInvestments CAPACITY GreaterOf($35_000_000, 15% * EBITDA)
BASKET PermittedAcquisitions CAPACITY $75_000_000 SUBJECT TO ProFormaCompliance`,
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
        { id: 'abc-c2', changeType: 'added', elementType: 'covenant', sectionReference: '7.11(a)', elementName: 'MaxLeverage', title: 'Equity cure right added', description: 'Added equity cure mechanism with 2 uses over rolling 4 quarters, max $25M', rationale: 'Standard borrower protection', beforeCode: null, afterCode: 'CURE EquityCure MAX_USES 2 OVER trailing_4_quarters MAX_AMOUNT $25_000_000', beforeValue: null, afterValue: '2 uses / $25M max', impact: 'borrower_favorable', impactDescription: 'Provides cure rights for leverage covenant breaches', sourceForm: 'covenant-cure', isManualEdit: false },
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
        { id: 'abc-c6', changeType: 'modified', elementType: 'covenant', sectionReference: '7.11(a)', elementName: 'MaxLeverage', title: 'Leverage ratio tightened', description: 'Ratio tightened from 5.25x to 4.75x', rationale: 'Compromise — accepted SBC add-back but tightened covenant', beforeCode: 'REQUIRES Leverage <= 5.25', afterCode: 'REQUIRES Leverage <= 4.75', beforeValue: '5.25x', afterValue: '4.75x', impact: 'lender_favorable', impactDescription: 'Tightened from borrower markup, compromise on EBITDA definition', sourceForm: 'covenant-simple', isManualEdit: false },
        { id: 'abc-c7', changeType: 'modified', elementType: 'covenant', sectionReference: '7.11(a)', elementName: 'MaxLeverage', title: 'Cure maximum reduced', description: 'Maximum cure amount reduced from $25M to $20M', rationale: null, beforeCode: 'MAX_AMOUNT $25_000_000', afterCode: 'MAX_AMOUNT $20_000_000', beforeValue: '$25M', afterValue: '$20M', impact: 'lender_favorable', impactDescription: '-$5M cure capacity', sourceForm: 'covenant-cure', isManualEdit: false },
        { id: 'abc-c8', changeType: 'modified', elementType: 'definition', sectionReference: '1.01', elementName: 'EBITDA', title: 'Stock-based comp add-back capped', description: 'Accepted SBC add-back but with $5M annual cap', rationale: 'Compromise: accept add-back but limit exposure', beforeCode: '+ StockBasedComp', afterCode: '+ StockBasedComp\n  CAPPED AT $5_000_000', beforeValue: 'Unlimited', afterValue: '$5M cap', impact: 'lender_favorable', impactDescription: 'Limits EBITDA benefit to $5M annually', sourceForm: 'definition-ebitda', isManualEdit: false },
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
  { id: 'abc-cp-7', dealId: 'abc-acquisition', name: 'ABC Parent Corp.', shortName: 'Parent/HoldCo', role: 'guarantor', partyType: 'borrower' },
  { id: 'abc-cp-8', dealId: 'abc-acquisition', name: 'Richards Kibbe & Orbe', shortName: 'Local Counsel (NY)', role: 'counsel', partyType: 'law_firm' },
];

const abcClosingConditions: ConditionPrecedent[] = [
  // ── Credit Agreement (5) ──
  { id: 'abc-cond-1', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(i)', category: 'credit_agreement', title: 'Credit Agreement Execution', description: 'Fully executed Credit Agreement among Borrower, Lenders, and Administrative Agent', responsiblePartyId: 'abc-cp-5', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Final signatures pending from Lender 1 and Lender 2' },
  { id: 'abc-cond-2', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(ii)', category: 'credit_agreement', title: 'Commitment Letter', description: 'Executed Commitment Letter from each Lender', responsiblePartyId: 'abc-cp-2', status: 'satisfied', dueDate: new Date('2026-01-20'), satisfiedAt: new Date('2026-01-15'), satisfiedByDocumentIds: ['abc-doc-2'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-3', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(iii)', category: 'credit_agreement', title: 'Fee Letter', description: 'Executed Fee Letter between Borrower and Administrative Agent', responsiblePartyId: 'abc-cp-2', status: 'satisfied', dueDate: new Date('2026-01-25'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: ['abc-doc-3'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-4', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(iv)', category: 'credit_agreement', title: 'Closing Certificate', description: 'Borrower closing certificate certifying representations, no default, and satisfaction of conditions', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Will be executed on closing date' },
  { id: 'abc-cond-5', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(a)(v)', category: 'credit_agreement', title: 'Funds Flow Memorandum', description: 'Executed funds flow memorandum setting forth all closing date payments and wire instructions', responsiblePartyId: 'abc-cp-2', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Draft circulated, awaiting final wire instructions' },
  // ── Security Documents (6) ──
  { id: 'abc-cond-6', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(b)(i)', category: 'security_documents', title: 'Security Agreement', description: 'Security Agreement granting first-priority security interest in substantially all personal property assets of the Borrower', responsiblePartyId: 'abc-cp-5', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-01-31'), satisfiedByDocumentIds: ['abc-doc-5'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-7', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(b)(ii)', category: 'security_documents', title: 'Pledge Agreement', description: 'Pledge Agreement covering 100% of equity interests in domestic subsidiaries and 65% of first-tier foreign subsidiaries', responsiblePartyId: 'abc-cp-5', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-01-31'), satisfiedByDocumentIds: ['abc-doc-6'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-8', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(b)(iii)', category: 'security_documents', title: 'Guaranty', description: 'Unconditional guaranty from Parent and each material domestic subsidiary', responsiblePartyId: 'abc-cp-7', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: ['abc-doc-7'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-9', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(b)(iv)', category: 'security_documents', title: 'Account Control Agreements', description: 'Deposit account control agreements for all material deposit and securities accounts', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Awaiting executed copies from 2 depository banks' },
  { id: 'abc-cond-10', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(b)(v)', category: 'security_documents', title: 'IP Security Agreement', description: 'Intellectual Property Security Agreement covering trademarks, patents, and copyrights', responsiblePartyId: 'abc-cp-5', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-03'), satisfiedByDocumentIds: ['abc-doc-8'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-11', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(b)(vi)', category: 'security_documents', title: 'Perfection Certificate', description: 'Perfection Certificate identifying all collateral locations, entity names, and filing jurisdictions', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-02'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── UCC Filings (3) ──
  { id: 'abc-cond-12', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(c)(i)', category: 'ucc_filings', title: 'UCC-1 Financing Statement (Borrower)', description: 'UCC-1 Financing Statement naming Borrower as debtor, filed with Delaware Secretary of State', responsiblePartyId: 'abc-cp-6', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Will file on closing date' },
  { id: 'abc-cond-13', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(c)(ii)', category: 'ucc_filings', title: 'UCC-1 Financing Statement (Guarantor)', description: 'UCC-1 Financing Statement naming Parent/Guarantor as debtor', responsiblePartyId: 'abc-cp-6', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Will file on closing date' },
  { id: 'abc-cond-14', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(c)(iii)', category: 'ucc_filings', title: 'Lien Search Results', description: 'UCC, tax lien, judgment, and litigation search results for Borrower and Guarantor in all relevant jurisdictions', responsiblePartyId: 'abc-cp-6', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-04'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'No adverse findings' },
  // ── Corporate Documents (8) ──
  { id: 'abc-cond-15', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(i)', category: 'corporate_documents', title: "Officer's Certificate (Borrower)", description: 'Certificate of a Responsible Officer of the Borrower certifying names, incumbency, and signatures', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-02-05'), satisfiedByDocumentIds: ['abc-doc-9'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-16', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(ii)', category: 'corporate_documents', title: "Officer's Certificate (Parent/Guarantor)", description: 'Certificate of a Responsible Officer of the Parent certifying names, incumbency, and signatures', responsiblePartyId: 'abc-cp-7', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-02-05'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-17', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(iii)', category: 'corporate_documents', title: 'Certificate of Formation (Borrower)', description: 'Certified copy of the Certificate of Formation of the Borrower from Delaware Secretary of State', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: ['abc-doc-10'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-18', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(iv)', category: 'corporate_documents', title: 'LLC Agreement (Borrower)', description: 'Certified copy of the Amended and Restated LLC Agreement of the Borrower', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-19', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(v)', category: 'corporate_documents', title: 'Board Resolutions', description: 'Resolutions of the Board of Directors of the Borrower and Parent authorizing the Transaction and Loan Documents', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-01-30'), satisfiedByDocumentIds: ['abc-doc-11'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-20', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(vi)', category: 'corporate_documents', title: 'Good Standing Certificate (DE)', description: 'Certificate of Good Standing from the Delaware Secretary of State for Borrower', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Requested — typically 3-5 business day turnaround' },
  { id: 'abc-cond-21', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(vii)', category: 'corporate_documents', title: 'Good Standing Certificate (NY)', description: 'Certificate of Good Standing from the New York Secretary of State for Borrower', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Requested — expedited processing' },
  { id: 'abc-cond-22', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(d)(viii)', category: 'corporate_documents', title: 'Incumbency Certificate', description: 'Incumbency Certificate for each authorized officer of Borrower and Parent executing Loan Documents', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-02-05'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Legal Opinions (4) ──
  { id: 'abc-cond-23', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(e)(i)', category: 'legal_opinions', title: 'Borrower Counsel Opinion', description: 'Legal opinion of Davis Polk covering enforceability, no conflicts, authorization, and corporate matters', responsiblePartyId: 'abc-cp-5', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Draft under review by Agent Counsel' },
  { id: 'abc-cond-24', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(e)(ii)', category: 'legal_opinions', title: 'Agent Counsel Opinion', description: 'Legal opinion of Simpson Thacher covering perfection of security interests and UCC matters', responsiblePartyId: 'abc-cp-6', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Draft in preparation' },
  { id: 'abc-cond-25', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(e)(iii)', category: 'legal_opinions', title: 'Local Counsel Opinion (NY)', description: 'Legal opinion of local New York counsel on enforceability and good standing in New York', responsiblePartyId: 'abc-cp-8', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Engaged Richards Kibbe' },
  { id: 'abc-cond-26', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(e)(iv)', category: 'legal_opinions', title: 'Non-Consolidation Opinion', description: 'Non-consolidation opinion confirming separateness of Borrower from Parent for bankruptcy purposes', responsiblePartyId: 'abc-cp-5', status: 'waived', dueDate: new Date('2026-02-12'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: new Date('2026-02-03'), waiverApprovedBy: 'Agent', notes: 'Waived — structure does not require separateness' },
  // ── Certificates (5) ──
  { id: 'abc-cond-27', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(f)(i)', category: 'certificates', title: 'Closing Date Certificate', description: 'Certificate of Borrower certifying that all representations are true and correct in all material respects as of closing', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'To be delivered at closing' },
  { id: 'abc-cond-28', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(f)(ii)', category: 'certificates', title: 'Solvency Certificate', description: 'Certificate of CFO as to solvency of Borrower and its subsidiaries on a consolidated basis after giving effect to the Transaction', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'CFO reviewing final form' },
  { id: 'abc-cond-29', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(f)(iii)', category: 'certificates', title: 'Compliance Certificate', description: 'Initial Compliance Certificate demonstrating pro forma covenant compliance as of closing', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-30', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(f)(iv)', category: 'certificates', title: "Secretary's Certificate", description: "Secretary's Certificate attaching charter, bylaws, and resolutions for Borrower and Parent", responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-12'), satisfiedAt: new Date('2026-02-06'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-31', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(f)(v)', category: 'certificates', title: 'Responsible Officer Certificate', description: "Certificate of Responsible Officer confirming no Material Adverse Effect since latest audited financials", responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Financial (5) ──
  { id: 'abc-cond-32', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(g)(i)', category: 'financial', title: 'Audited Financial Statements', description: 'Audited consolidated financial statements for FY 2023, 2024, and 2025', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: ['abc-doc-14'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-33', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(g)(ii)', category: 'financial', title: 'Pro Forma Financial Model', description: 'Pro forma financial model showing projected covenant compliance through maturity', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-22'), satisfiedByDocumentIds: ['abc-doc-15'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-34', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(g)(iii)', category: 'financial', title: 'Acquisition Pro Forma', description: 'Pro forma balance sheet and income statement giving effect to the Acquisition and initial borrowings', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-35', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(g)(iv)', category: 'financial', title: 'Quality of Earnings Report', description: 'Quality of Earnings report from independent accounting firm acceptable to Agent', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-18'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Prepared by Deloitte' },
  { id: 'abc-cond-36', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(g)(v)', category: 'financial', title: 'Projected Financial Statements', description: 'Board-approved projected financial statements for FY 2026-2030', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Insurance (3) ──
  { id: 'abc-cond-37', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(h)(i)', category: 'insurance', title: 'Insurance Certificates (GL/Property)', description: 'Certificates of insurance evidencing general liability and property coverage with Agent named as additional insured and loss payee', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'OVERDUE — awaiting updated certificates from insurance broker' },
  { id: 'abc-cond-38', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(h)(ii)', category: 'insurance', title: 'D&O Insurance Policy', description: 'Evidence of Directors & Officers liability insurance with coverage amounts satisfactory to Agent', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-03'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-39', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(h)(iii)', category: 'insurance', title: 'Evidence of Insurance Premiums Paid', description: 'Evidence that all insurance premiums have been paid current through closing', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-02-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'OVERDUE — broker confirming premium payment' },
  // ── KYC/AML (3) ──
  { id: 'abc-cond-40', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(i)(i)', category: 'kyc_aml', title: 'KYC Documentation', description: 'Know Your Customer documentation for Borrower and all Guarantors, satisfactory to each Lender', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-41', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(i)(ii)', category: 'kyc_aml', title: 'Beneficial Ownership Certification', description: 'Beneficial Ownership Certification in the form required by 31 CFR 1010.230', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-42', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(i)(iii)', category: 'kyc_aml', title: 'OFAC/Sanctions Screening', description: 'Completed OFAC, sanctions, and PEP screening for Borrower, Parent, and all Guarantors', responsiblePartyId: 'abc-cp-2', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-22'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Clear — no matches' },
  // ── Due Diligence (4) ──
  { id: 'abc-cond-43', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(j)(i)', category: 'due_diligence', title: 'Business Due Diligence', description: 'Completion of business due diligence satisfactory to Agent and Required Lenders', responsiblePartyId: 'abc-cp-2', status: 'satisfied', dueDate: new Date('2026-01-31'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-44', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(j)(ii)', category: 'due_diligence', title: 'Legal Due Diligence', description: 'Completion of legal due diligence including review of material contracts, litigation, and regulatory compliance', responsiblePartyId: 'abc-cp-6', status: 'satisfied', dueDate: new Date('2026-01-31'), satisfiedAt: new Date('2026-01-29'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-45', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(j)(iii)', category: 'due_diligence', title: 'Environmental Assessment', description: 'Phase I Environmental Site Assessment for all owned real property', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'No recognized environmental conditions' },
  { id: 'abc-cond-46', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(j)(iv)', category: 'due_diligence', title: 'Tax Structure Opinion', description: 'Tax opinion confirming structure and treatment of Acquisition for federal and state income tax purposes', responsiblePartyId: 'abc-cp-5', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-30'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Real Estate (4) ──
  { id: 'abc-cond-47', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(k)(i)', category: 'real_estate', title: 'Title Report', description: 'Preliminary title report for all owned real property to be subject to Mortgage', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'abc-cond-48', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(k)(ii)', category: 'real_estate', title: 'Mortgage/Deed of Trust', description: 'Executed Mortgage or Deed of Trust for each owned real property with appraised value in excess of $5M', responsiblePartyId: 'abc-cp-5', status: 'pending', dueDate: new Date('2026-02-14'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Final form under review by local counsel' },
  { id: 'abc-cond-49', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(k)(iii)', category: 'real_estate', title: 'ALTA Survey', description: 'ALTA/NSPS survey for each mortgaged property', responsiblePartyId: 'abc-cp-1', status: 'waived', dueDate: new Date('2026-02-10'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: new Date('2026-02-04'), waiverApprovedBy: 'Agent', notes: 'Waived — existing surveys within 3 years deemed sufficient' },
  { id: 'abc-cond-50', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.01(k)(iv)', category: 'real_estate', title: 'Environmental Phase I', description: 'Phase I Environmental Site Assessment for each mortgaged property', responsiblePartyId: 'abc-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Post-Closing (5) ──
  { id: 'abc-cond-51', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.02(a)', category: 'post_closing', title: 'Final Title Policy', description: 'Delivery of final ALTA lender title insurance policy for each mortgaged property within 90 days of closing', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-05-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Post-closing obligation' },
  { id: 'abc-cond-52', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.02(b)', category: 'post_closing', title: 'Recorded Mortgage', description: 'Evidence of recording of Mortgage in each applicable county within 30 days of closing', responsiblePartyId: 'abc-cp-5', status: 'pending', dueDate: new Date('2026-03-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Post-closing obligation' },
  { id: 'abc-cond-53', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.02(c)', category: 'post_closing', title: 'Supplemental Perfection Certificate', description: 'Updated Perfection Certificate reflecting any changes identified after closing', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-03-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Post-closing obligation' },
  { id: 'abc-cond-54', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.02(d)', category: 'post_closing', title: 'Post-Closing Lien Searches', description: 'Updated UCC, tax lien, and judgment searches confirming first-priority lien status within 30 days', responsiblePartyId: 'abc-cp-6', status: 'pending', dueDate: new Date('2026-03-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Post-closing obligation' },
  { id: 'abc-cond-55', dealId: 'abc-acquisition', versionId: 'abc-version-3', sectionReference: '4.02(e)', category: 'post_closing', title: 'Landlord Estoppels', description: 'Estoppel certificates from landlords for each material leased location within 60 days of closing', responsiblePartyId: 'abc-cp-1', status: 'pending', dueDate: new Date('2026-04-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Post-closing obligation — 3 locations' },
];

const abcClosingDocuments: ClosingDocument[] = [
  // ── Credit Agreement Documents ──
  { id: 'abc-doc-1', dealId: 'abc-acquisition', documentType: 'credit_agreement', title: 'Credit Agreement', fileName: 'ABC_Credit_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-1.pdf', status: 'pending', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-01-31'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-15'), signatures: [
    { id: 'abc-sig-1', documentId: 'abc-doc-1', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-02-01') },
    { id: 'abc-sig-2', documentId: 'abc-doc-1', partyId: 'abc-cp-3', signatoryName: 'Michael Brown', signatoryTitle: 'Partner', status: 'requested', signedAt: null },
    { id: 'abc-sig-3', documentId: 'abc-doc-1', partyId: 'abc-cp-4', signatoryName: 'Emily Davis', signatoryTitle: 'Senior VP', status: 'pending', signedAt: null },
    { id: 'abc-sig-4', documentId: 'abc-doc-1', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-31') },
  ], satisfiesConditionIds: ['abc-cond-1'] },
  { id: 'abc-doc-2', dealId: 'abc-acquisition', documentType: 'credit_agreement', title: 'Commitment Letter', fileName: 'ABC_Commitment_Letter.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-2.pdf', status: 'executed', responsiblePartyId: 'abc-cp-2', uploadedAt: new Date('2026-01-15'), uploadedBy: 'sjohnson@fnb.com', dueDate: new Date('2026-01-20'), signatures: [
    { id: 'abc-sig-5', documentId: 'abc-doc-2', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-01-15') },
    { id: 'abc-sig-6', documentId: 'abc-doc-2', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-15') },
  ], satisfiesConditionIds: ['abc-cond-2'] },
  { id: 'abc-doc-3', dealId: 'abc-acquisition', documentType: 'credit_agreement', title: 'Fee Letter', fileName: 'ABC_Fee_Letter.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-3.pdf', status: 'executed', responsiblePartyId: 'abc-cp-2', uploadedAt: new Date('2026-01-20'), uploadedBy: 'sjohnson@fnb.com', dueDate: new Date('2026-01-25'), signatures: [
    { id: 'abc-sig-7', documentId: 'abc-doc-3', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-01-20') },
    { id: 'abc-sig-8', documentId: 'abc-doc-3', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-20') },
    { id: 'abc-sig-9', documentId: 'abc-doc-3', partyId: 'abc-cp-5', signatoryName: 'James Wilson', signatoryTitle: 'Partner', status: 'signed', signedAt: new Date('2026-01-20') },
  ], satisfiesConditionIds: ['abc-cond-3'] },
  { id: 'abc-doc-4', dealId: 'abc-acquisition', documentType: 'credit_agreement', title: 'Funds Flow Memorandum', fileName: 'ABC_Funds_Flow_Memo.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-4.pdf', status: 'pending', responsiblePartyId: 'abc-cp-2', uploadedAt: new Date('2026-02-05'), uploadedBy: 'sjohnson@fnb.com', dueDate: new Date('2026-02-14'), signatures: [], satisfiesConditionIds: ['abc-cond-5'] },
  // ── Security Documents ──
  { id: 'abc-doc-5', dealId: 'abc-acquisition', documentType: 'security', title: 'Security Agreement', fileName: 'ABC_Security_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-5.pdf', status: 'executed', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-01-31'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-12'), signatures: [
    { id: 'abc-sig-10', documentId: 'abc-doc-5', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-01-31') },
    { id: 'abc-sig-11', documentId: 'abc-doc-5', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-31') },
    { id: 'abc-sig-12', documentId: 'abc-doc-5', partyId: 'abc-cp-7', signatoryName: 'Richard Clarke', signatoryTitle: 'General Counsel', status: 'signed', signedAt: new Date('2026-02-01') },
  ], satisfiesConditionIds: ['abc-cond-6'] },
  { id: 'abc-doc-6', dealId: 'abc-acquisition', documentType: 'security', title: 'Pledge Agreement', fileName: 'ABC_Pledge_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-6.pdf', status: 'executed', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-01-31'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-12'), signatures: [
    { id: 'abc-sig-13', documentId: 'abc-doc-6', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-31') },
    { id: 'abc-sig-14', documentId: 'abc-doc-6', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-02-01') },
  ], satisfiesConditionIds: ['abc-cond-7'] },
  { id: 'abc-doc-7', dealId: 'abc-acquisition', documentType: 'security', title: 'Guaranty', fileName: 'ABC_Parent_Guaranty.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-7.pdf', status: 'executed', responsiblePartyId: 'abc-cp-7', uploadedAt: new Date('2026-02-01'), uploadedBy: 'rclarke@abcparent.com', dueDate: new Date('2026-02-12'), signatures: [
    { id: 'abc-sig-15', documentId: 'abc-doc-7', partyId: 'abc-cp-7', signatoryName: 'Richard Clarke', signatoryTitle: 'General Counsel', status: 'signed', signedAt: new Date('2026-02-01') },
    { id: 'abc-sig-16', documentId: 'abc-doc-7', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-02-01') },
  ], satisfiesConditionIds: ['abc-cond-8'] },
  { id: 'abc-doc-8', dealId: 'abc-acquisition', documentType: 'security', title: 'IP Security Agreement', fileName: 'ABC_IP_Security_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-8.pdf', status: 'executed', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-02-03'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-10'), signatures: [
    { id: 'abc-sig-17', documentId: 'abc-doc-8', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-02-03') },
  ], satisfiesConditionIds: ['abc-cond-10'] },
  // ── Corporate Documents ──
  { id: 'abc-doc-9', dealId: 'abc-acquisition', documentType: 'corporate', title: "Officer's Certificate (Borrower)", fileName: 'ABC_Officers_Certificate.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-9.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-02-05'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-12'), signatures: [], satisfiesConditionIds: ['abc-cond-15'] },
  { id: 'abc-doc-10', dealId: 'abc-acquisition', documentType: 'corporate', title: 'Certificate of Formation', fileName: 'ABC_Certificate_of_Formation.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-10.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-28'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['abc-cond-17'] },
  { id: 'abc-doc-11', dealId: 'abc-acquisition', documentType: 'corporate', title: 'Board Resolutions', fileName: 'ABC_Board_Resolutions.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-11.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-30'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-12'), signatures: [], satisfiesConditionIds: ['abc-cond-19'] },
  { id: 'abc-doc-12', dealId: 'abc-acquisition', documentType: 'corporate', title: 'Incumbency Certificate', fileName: 'ABC_Incumbency_Certificate.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-12.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-02-05'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-12'), signatures: [], satisfiesConditionIds: ['abc-cond-22'] },
  // ── Legal Opinions ──
  { id: 'abc-doc-13', dealId: 'abc-acquisition', documentType: 'legal_opinion', title: 'Borrower Counsel Opinion (Draft)', fileName: 'ABC_DavisPolk_Opinion_Draft.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-13.pdf', status: 'pending', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-02-05'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-14'), signatures: [], satisfiesConditionIds: ['abc-cond-23'] },
  // ── Financial Documents ──
  { id: 'abc-doc-14', dealId: 'abc-acquisition', documentType: 'financial', title: 'Audited Financial Statements (FY 2023-2025)', fileName: 'ABC_Audited_Financials_2023_2025.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-14.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-20'), uploadedBy: 'cfo@abcholdings.com', dueDate: new Date('2026-02-01'), signatures: [], satisfiesConditionIds: ['abc-cond-32'] },
  { id: 'abc-doc-15', dealId: 'abc-acquisition', documentType: 'financial', title: 'Pro Forma Financial Model', fileName: 'ABC_ProForma_Model.xlsx', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', storagePath: '/documents/abc-doc-15.xlsx', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-22'), uploadedBy: 'cfo@abcholdings.com', dueDate: new Date('2026-02-05'), signatures: [], satisfiesConditionIds: ['abc-cond-33'] },
  { id: 'abc-doc-16', dealId: 'abc-acquisition', documentType: 'financial', title: 'Quality of Earnings Report', fileName: 'ABC_QofE_Deloitte.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-16.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-18'), uploadedBy: 'cfo@abcholdings.com', dueDate: new Date('2026-02-01'), signatures: [], satisfiesConditionIds: ['abc-cond-35'] },
  // ── Insurance ──
  { id: 'abc-doc-17', dealId: 'abc-acquisition', documentType: 'insurance', title: 'D&O Insurance Policy', fileName: 'ABC_DO_Insurance_Policy.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-17.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-02-03'), uploadedBy: 'admin@abcholdings.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['abc-cond-38'] },
  // ── KYC/AML ──
  { id: 'abc-doc-18', dealId: 'abc-acquisition', documentType: 'kyc_aml', title: 'Beneficial Ownership Certification', fileName: 'ABC_Beneficial_Ownership_Cert.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-18.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-25'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-05'), signatures: [], satisfiesConditionIds: ['abc-cond-41'] },
  // ── Due Diligence ──
  { id: 'abc-doc-19', dealId: 'abc-acquisition', documentType: 'due_diligence', title: 'Phase I Environmental Assessment', fileName: 'ABC_Phase_I_ESA.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-19.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-20'), uploadedBy: 'admin@abcholdings.com', dueDate: new Date('2026-02-01'), signatures: [], satisfiesConditionIds: ['abc-cond-45'] },
  // ── Real Estate ──
  { id: 'abc-doc-20', dealId: 'abc-acquisition', documentType: 'real_estate', title: 'Title Report', fileName: 'ABC_Title_Report.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-20.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-28'), uploadedBy: 'admin@abcholdings.com', dueDate: new Date('2026-02-05'), signatures: [], satisfiesConditionIds: ['abc-cond-47'] },
  { id: 'abc-doc-21', dealId: 'abc-acquisition', documentType: 'real_estate', title: 'Mortgage/Deed of Trust', fileName: 'ABC_Mortgage.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-21.pdf', status: 'pending', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-02-05'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-14'), signatures: [
    { id: 'abc-sig-18', documentId: 'abc-doc-21', partyId: 'abc-cp-1', signatoryName: 'John Smith', signatoryTitle: 'CEO', status: 'requested', signedAt: null },
    { id: 'abc-sig-19', documentId: 'abc-doc-21', partyId: 'abc-cp-2', signatoryName: 'Sarah Johnson', signatoryTitle: 'Managing Director', status: 'pending', signedAt: null },
  ], satisfiesConditionIds: ['abc-cond-48'] },
  // ── Certificates ──
  { id: 'abc-doc-22', dealId: 'abc-acquisition', documentType: 'certificate', title: "Secretary's Certificate", fileName: 'ABC_Secretarys_Certificate.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-22.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-02-06'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-12'), signatures: [], satisfiesConditionIds: ['abc-cond-30'] },
  { id: 'abc-doc-23', dealId: 'abc-acquisition', documentType: 'certificate', title: 'Perfection Certificate', fileName: 'ABC_Perfection_Certificate.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-23.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-02-02'), uploadedBy: 'john.smith@abcholdings.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['abc-cond-11'] },
  // ── Tax Structure ──
  { id: 'abc-doc-24', dealId: 'abc-acquisition', documentType: 'due_diligence', title: 'Tax Structure Opinion', fileName: 'ABC_Tax_Structure_Opinion.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-24.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-5', uploadedAt: new Date('2026-01-30'), uploadedBy: 'partner@davispolk.com', dueDate: new Date('2026-02-05'), signatures: [], satisfiesConditionIds: ['abc-cond-46'] },
  // ── Projected Financials ──
  { id: 'abc-doc-25', dealId: 'abc-acquisition', documentType: 'financial', title: 'Projected Financial Statements (FY 2026-2030)', fileName: 'ABC_Projected_Financials.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-25.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-28'), uploadedBy: 'cfo@abcholdings.com', dueDate: new Date('2026-02-05'), signatures: [], satisfiesConditionIds: ['abc-cond-36'] },
  // ── Acquisition Pro Forma ──
  { id: 'abc-doc-26', dealId: 'abc-acquisition', documentType: 'financial', title: 'Acquisition Pro Forma', fileName: 'ABC_Acquisition_ProForma.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-26.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-1', uploadedAt: new Date('2026-01-25'), uploadedBy: 'cfo@abcholdings.com', dueDate: new Date('2026-02-05'), signatures: [], satisfiesConditionIds: ['abc-cond-34'] },
  // ── Lien Search Results ──
  { id: 'abc-doc-27', dealId: 'abc-acquisition', documentType: 'ucc', title: 'UCC and Lien Search Results', fileName: 'ABC_Lien_Search_Results.pdf', fileType: 'application/pdf', storagePath: '/documents/abc-doc-27.pdf', status: 'uploaded', responsiblePartyId: 'abc-cp-6', uploadedAt: new Date('2026-02-04'), uploadedBy: 'associate@simpsonthacher.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['abc-cond-14'] },
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
  { id: 'solar-version-1', dealId: 'solar-demo', versionNumber: 1, versionLabel: "Lender's Initial Draft", creditLangCode: '// Solar - Lender Initial\nCOVENANT MinDSCR REQUIRES DSCR >= 1.35 TESTED QUARTERLY', createdBy: 'jwalsh@milbank.com', authorParty: 'Milbank', createdAt: new Date('2025-11-01'), parentVersionId: null, status: 'superseded', generatedWordDoc: null, changeSummary: null },
  { id: 'solar-version-2', dealId: 'solar-demo', versionNumber: 2, versionLabel: "Sponsor's Markup", creditLangCode: '// Solar - Sponsor Markup\nCOVENANT MinDSCR REQUIRES DSCR >= 1.20 TESTED QUARTERLY\nDEGRADATION_SCHEDULE PanelDegradation ANNUAL_DEGRADATION 0.5', createdBy: 'david.kim@lw.com', authorParty: 'Latham', createdAt: new Date('2025-11-15'), parentVersionId: 'solar-version-1', status: 'superseded', generatedWordDoc: null, changeSummary: { versionFrom: 1, versionTo: 2, authorParty: 'Latham', createdAt: new Date('2025-11-15'), totalChanges: 2, covenantChanges: 1, definitionChanges: 0, basketChanges: 0, otherChanges: 1, borrowerFavorable: 2, lenderFavorable: 0, neutral: 0, changes: [
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
  { id: 'solar-cp-6', dealId: 'solar-demo', name: 'First Solar EPC LLC', shortName: 'EPC Contractor', role: 'contractor', partyType: 'consultant' },
  { id: 'solar-cp-7', dealId: 'solar-demo', name: 'Leidos Engineering', shortName: 'Indep. Engineer', role: 'consultant', partyType: 'consultant' },
  { id: 'solar-cp-8', dealId: 'solar-demo', name: 'Arizona Public Service', shortName: 'Offtaker/Utility', role: 'offtaker', partyType: 'offtaker' },
  { id: 'solar-cp-9', dealId: 'solar-demo', name: 'NextEra Energy Services', shortName: 'O&M Provider', role: 'contractor', partyType: 'consultant' },
];

const solarClosingConditions: ConditionPrecedent[] = [
  // ── Credit Agreement (4) ──
  { id: 'solar-cond-1', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(a)(i)', category: 'credit_agreement', title: 'Credit Agreement Execution', description: 'Fully executed Credit Agreement among Borrower, Lenders, and Administrative Agent', responsiblePartyId: 'solar-cp-4', status: 'pending', dueDate: new Date('2026-03-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Final form under review' },
  { id: 'solar-cond-2', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(a)(ii)', category: 'credit_agreement', title: 'Depositary Agreement', description: 'Executed Depositary Agreement establishing project revenue and reserve accounts', responsiblePartyId: 'solar-cp-2', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Coordinating with depositary bank' },
  { id: 'solar-cond-3', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(a)(iii)', category: 'credit_agreement', title: 'Collateral Agency Agreement', description: 'Executed Collateral Agency Agreement appointing collateral agent for secured parties', responsiblePartyId: 'solar-cp-5', status: 'pending', dueDate: new Date('2026-03-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-4', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(a)(iv)', category: 'credit_agreement', title: 'Intercreditor Agreement', description: 'Executed Intercreditor Agreement among Senior Lenders and Tax Equity Investor', responsiblePartyId: 'solar-cp-5', status: 'pending', dueDate: new Date('2026-03-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Tax equity counsel reviewing' },
  // ── Security Documents (5) ──
  { id: 'solar-cond-5', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(b)(i)', category: 'security_documents', title: 'Security Agreement', description: 'Security Agreement granting first-priority security interest in all project assets', responsiblePartyId: 'solar-cp-4', status: 'satisfied', dueDate: new Date('2026-02-20'), satisfiedAt: new Date('2026-02-10'), satisfiedByDocumentIds: ['solar-doc-5'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-6', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(b)(ii)', category: 'security_documents', title: 'Pledge Agreement', description: 'Pledge of 100% of membership interests in Borrower by Sponsor', responsiblePartyId: 'solar-cp-4', status: 'satisfied', dueDate: new Date('2026-02-20'), satisfiedAt: new Date('2026-02-10'), satisfiedByDocumentIds: ['solar-doc-6'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-7', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(b)(iii)', category: 'security_documents', title: 'Mortgage/Deed of Trust', description: 'Mortgage over project site real property (640 acres, Maricopa County)', responsiblePartyId: 'solar-cp-4', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Local counsel preparing' },
  { id: 'solar-cond-8', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(b)(iv)', category: 'security_documents', title: 'Assignment of Project Contracts', description: 'Collateral assignment of EPC Contract, O&M Agreement, PPA, and Interconnection Agreement', responsiblePartyId: 'solar-cp-4', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Counterparty consents required' },
  { id: 'solar-cond-9', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(b)(v)', category: 'security_documents', title: 'Account Control Agreement', description: 'Deposit account control agreements for all project accounts with depositary bank', responsiblePartyId: 'solar-cp-2', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Corporate Documents (4) ──
  { id: 'solar-cond-10', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(c)(i)', category: 'corporate_documents', title: 'Certificate of Formation', description: 'Certified copy of the Certificate of Formation of Desert Sun Project Co LLC from Delaware', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-11', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(c)(ii)', category: 'corporate_documents', title: 'LLC Agreement', description: 'Certified copy of the Amended and Restated LLC Agreement of the Borrower', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-12', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(c)(iii)', category: 'corporate_documents', title: "Officer's Certificate", description: 'Certificate of authorized officer certifying incumbency, resolutions, and no default', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-20'), satisfiedAt: new Date('2026-02-08'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-13', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(c)(iv)', category: 'corporate_documents', title: 'Good Standing Certificate (DE)', description: 'Certificate of Good Standing from Delaware Secretary of State', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-20'), satisfiedAt: new Date('2026-02-05'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Legal Opinions (3) ──
  { id: 'solar-cond-14', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(d)(i)', category: 'legal_opinions', title: 'Borrower Counsel Opinion', description: 'Legal opinion of Latham & Watkins covering enforceability, authorization, and no conflicts', responsiblePartyId: 'solar-cp-4', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Draft in preparation' },
  { id: 'solar-cond-15', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(d)(ii)', category: 'legal_opinions', title: 'Agent Counsel Opinion', description: 'Legal opinion of Milbank covering perfection and priority of security interests', responsiblePartyId: 'solar-cp-5', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-16', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(d)(iii)', category: 'legal_opinions', title: 'Regulatory Counsel Opinion', description: 'Opinion of regulatory counsel confirming compliance with Arizona utility and energy regulations', responsiblePartyId: 'solar-cp-4', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Engaging local Arizona counsel' },
  // ── Certificates (4) ──
  { id: 'solar-cond-17', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(e)(i)', category: 'certificates', title: 'Closing Certificate', description: 'Borrower closing certificate certifying representations, no default, and satisfaction of conditions', responsiblePartyId: 'solar-cp-1', status: 'pending', dueDate: new Date('2026-03-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'To be delivered at closing' },
  { id: 'solar-cond-18', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(e)(ii)', category: 'certificates', title: 'Solvency Certificate', description: 'Certificate from CFO as to solvency of the Borrower', responsiblePartyId: 'solar-cp-1', status: 'pending', dueDate: new Date('2026-03-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-19', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(e)(iii)', category: 'certificates', title: 'Independent Engineer Certificate', description: "Independent Engineer's certificate confirming feasibility and technical design adequacy", responsiblePartyId: 'solar-cp-7', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-05'), satisfiedByDocumentIds: ['solar-doc-9'], waivedAt: null, waiverApprovedBy: null, notes: 'Leidos IE report delivered' },
  { id: 'solar-cond-20', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(e)(iv)', category: 'certificates', title: 'Insurance Consultant Report', description: 'Insurance consultant report confirming adequacy of insurance program', responsiblePartyId: 'solar-cp-2', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-03'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Financial (3) ──
  { id: 'solar-cond-21', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(f)(i)', category: 'financial', title: 'Financial Model (Base Case)', description: 'Board-approved base case financial model with Agent-agreed assumptions', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: ['solar-doc-10'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-22', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(f)(ii)', category: 'financial', title: 'Construction Budget', description: 'Detailed construction budget approved by Independent Engineer', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-02'), satisfiedByDocumentIds: ['solar-doc-11'], waivedAt: null, waiverApprovedBy: null, notes: '$268M hard costs + $12M soft costs' },
  { id: 'solar-cond-23', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(f)(iii)', category: 'financial', title: 'Drawdown Schedule', description: 'Initial drawdown schedule consistent with construction schedule', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-02'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Insurance (3) ──
  { id: 'solar-cond-24', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(g)(i)', category: 'insurance', title: "Builder's Risk Policy", description: "Builder's all-risk insurance covering project during construction for full replacement value", responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-25', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(g)(ii)', category: 'insurance', title: 'Commercial General Liability', description: 'CGL insurance with $5M per occurrence / $10M aggregate, Agent as additional insured', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-26', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(g)(iii)', category: 'insurance', title: "Contractor's All-Risk", description: "EPC contractor's all-risk policy with Borrower and Agent named as additional insured", responsiblePartyId: 'solar-cp-6', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-03'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Permits (5) ──
  { id: 'solar-cond-27', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(h)(i)', category: 'permits', title: 'Conditional Use Permit', description: 'Conditional Use Permit from Maricopa County for utility-scale solar development', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-10'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Approved by County Board' },
  { id: 'solar-cond-28', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(h)(ii)', category: 'permits', title: 'NEPA/Environmental Clearance', description: 'National Environmental Policy Act clearance or categorical exclusion', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-10'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Categorical exclusion granted' },
  { id: 'solar-cond-29', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(h)(iii)', category: 'permits', title: 'Interconnection Approval', description: 'FERC-approved Large Generator Interconnection Agreement', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-20'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: ['solar-doc-12'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-30', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(h)(iv)', category: 'permits', title: 'State Utility Commission Approval', description: 'Arizona Corporation Commission approval of the PPA', responsiblePartyId: 'solar-cp-1', status: 'pending', dueDate: new Date('2026-02-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'OVERDUE — hearing rescheduled to Feb 10' },
  { id: 'solar-cond-31', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(h)(v)', category: 'permits', title: 'County Building Permits', description: 'Building permits for racking, inverter pads, and substation from Maricopa County', responsiblePartyId: 'solar-cp-1', status: 'pending', dueDate: new Date('2026-02-25'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Application submitted, review in progress' },
  // ── Technical (4) ──
  { id: 'solar-cond-32', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(i)(i)', category: 'technical', title: 'EPC Contract (Executed)', description: 'Fully executed EPC Contract with First Solar EPC LLC for turnkey construction', responsiblePartyId: 'solar-cp-6', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-01-15'), satisfiedByDocumentIds: ['solar-doc-13'], waivedAt: null, waiverApprovedBy: null, notes: 'Fixed-price $245M, 18-month schedule' },
  { id: 'solar-cond-33', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(i)(ii)', category: 'technical', title: 'Independent Engineer Report', description: 'Independent Engineer feasibility report covering design, technology, and construction risk', responsiblePartyId: 'solar-cp-7', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-02-05'), satisfiedByDocumentIds: ['solar-doc-9'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-34', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(i)(iii)', category: 'technical', title: 'Geotechnical Study', description: 'Geotechnical study confirming soil conditions suitable for pile-driven racking', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-01-31'), satisfiedAt: new Date('2026-01-15'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-35', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(i)(iv)', category: 'technical', title: 'Electrical Design Package', description: '100% electrical design package reviewed and approved by Independent Engineer', responsiblePartyId: 'solar-cp-6', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '90% design submitted, final comments outstanding' },
  // ── Tax Equity (4) ──
  { id: 'solar-cond-36', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(j)(i)', category: 'tax_equity', title: 'Tax Equity Partnership Agreement', description: 'Executed Amended and Restated LLC Agreement establishing partnership flip structure', responsiblePartyId: 'solar-cp-3', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Final diligence ongoing — ITC qualification review' },
  { id: 'solar-cond-37', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(j)(ii)', category: 'tax_equity', title: 'Tax Opinion (ITC Qualification)', description: 'Tax opinion from nationally recognized tax counsel confirming ITC eligibility', responsiblePartyId: 'solar-cp-4', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Draft under review by tax equity counsel' },
  { id: 'solar-cond-38', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(j)(iii)', category: 'tax_equity', title: 'ITC Qualification Letter', description: 'Engineer letter confirming project qualifies for Investment Tax Credit under IRC Section 48', responsiblePartyId: 'solar-cp-7', status: 'pending', dueDate: new Date('2026-02-25'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Leidos preparing based on 100% design' },
  { id: 'solar-cond-39', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(j)(iv)', category: 'tax_equity', title: 'Allocation Schedule', description: 'Tax credit and cash allocation schedule agreed between Sponsor and Tax Equity Investor', responsiblePartyId: 'solar-cp-3', status: 'pending', dueDate: new Date('2026-02-28'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '99/1 pre-flip, 5/95 post-flip proposed' },
  // ── Offtake (3) ──
  { id: 'solar-cond-40', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(k)(i)', category: 'offtake', title: 'Power Purchase Agreement (PPA)', description: 'Executed 25-year PPA with Arizona Public Service at $42/MWh escalating 1.5% annually', responsiblePartyId: 'solar-cp-8', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: ['solar-doc-14'], waivedAt: null, waiverApprovedBy: null, notes: '25-year term with investment-grade offtaker' },
  { id: 'solar-cond-41', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(k)(ii)', category: 'offtake', title: 'Interconnection Agreement', description: 'Executed Large Generator Interconnection Agreement with transmission provider', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-20'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: ['solar-doc-12'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'solar-cond-42', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(k)(iii)', category: 'offtake', title: 'REC Purchase Agreement', description: 'Executed Renewable Energy Certificate purchase agreement', responsiblePartyId: 'solar-cp-1', status: 'satisfied', dueDate: new Date('2026-02-15'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Consents (3) ──
  { id: 'solar-cond-43', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(l)(i)', category: 'consents', title: 'Offtaker Consent (Utility)', description: 'Consent of Arizona Public Service to collateral assignment of PPA to Collateral Agent', responsiblePartyId: 'solar-cp-8', status: 'pending', dueDate: new Date('2026-02-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'OVERDUE — utility legal department reviewing' },
  { id: 'solar-cond-44', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(l)(ii)', category: 'consents', title: 'EPC Contractor Consent', description: 'Consent of First Solar EPC to collateral assignment of EPC Contract to Collateral Agent', responsiblePartyId: 'solar-cp-6', status: 'pending', dueDate: new Date('2026-02-25'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'First Solar legal reviewing form' },
  { id: 'solar-cond-45', dealId: 'solar-demo', versionId: 'solar-version-3', sectionReference: '4.01(l)(iii)', category: 'consents', title: 'O&M Provider Consent', description: 'Consent of NextEra Energy Services to collateral assignment of O&M Agreement', responsiblePartyId: 'solar-cp-9', status: 'pending', dueDate: new Date('2026-02-25'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
];

const solarClosingDocuments: ClosingDocument[] = [
  // ── Credit Agreement Documents ──
  { id: 'solar-doc-1', dealId: 'solar-demo', documentType: 'credit_agreement', title: 'Credit Agreement', fileName: 'DesertSun_Credit_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-1.pdf', status: 'pending', responsiblePartyId: 'solar-cp-4', uploadedAt: new Date('2026-02-10'), uploadedBy: 'david.kim@lw.com', dueDate: new Date('2026-03-01'), signatures: [
    { id: 'solar-sig-1', documentId: 'solar-doc-1', partyId: 'solar-cp-1', signatoryName: 'Robert Martinez', signatoryTitle: 'Project Director', status: 'pending', signedAt: null },
    { id: 'solar-sig-2', documentId: 'solar-doc-1', partyId: 'solar-cp-2', signatoryName: 'Thomas White', signatoryTitle: 'Managing Director', status: 'pending', signedAt: null },
  ], satisfiesConditionIds: ['solar-cond-1'] },
  { id: 'solar-doc-2', dealId: 'solar-demo', documentType: 'credit_agreement', title: 'Depositary Agreement', fileName: 'DesertSun_Depositary_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-2.pdf', status: 'pending', responsiblePartyId: 'solar-cp-2', uploadedAt: new Date('2026-02-08'), uploadedBy: 'twhite@cobank.com', dueDate: new Date('2026-02-28'), signatures: [], satisfiesConditionIds: ['solar-cond-2'] },
  { id: 'solar-doc-3', dealId: 'solar-demo', documentType: 'credit_agreement', title: 'Collateral Agency Agreement', fileName: 'DesertSun_Collateral_Agency.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-3.pdf', status: 'pending', responsiblePartyId: 'solar-cp-5', uploadedAt: new Date('2026-02-08'), uploadedBy: 'jwalsh@milbank.com', dueDate: new Date('2026-03-01'), signatures: [], satisfiesConditionIds: ['solar-cond-3'] },
  { id: 'solar-doc-4', dealId: 'solar-demo', documentType: 'credit_agreement', title: 'Intercreditor Agreement', fileName: 'DesertSun_Intercreditor.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-4.pdf', status: 'pending', responsiblePartyId: 'solar-cp-5', uploadedAt: new Date('2026-02-10'), uploadedBy: 'jwalsh@milbank.com', dueDate: new Date('2026-03-01'), signatures: [], satisfiesConditionIds: ['solar-cond-4'] },
  // ── Security Documents ──
  { id: 'solar-doc-5', dealId: 'solar-demo', documentType: 'security', title: 'Security Agreement', fileName: 'DesertSun_Security_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-5.pdf', status: 'executed', responsiblePartyId: 'solar-cp-4', uploadedAt: new Date('2026-02-10'), uploadedBy: 'david.kim@lw.com', dueDate: new Date('2026-02-20'), signatures: [
    { id: 'solar-sig-3', documentId: 'solar-doc-5', partyId: 'solar-cp-1', signatoryName: 'Robert Martinez', signatoryTitle: 'Project Director', status: 'signed', signedAt: new Date('2026-02-10') },
    { id: 'solar-sig-4', documentId: 'solar-doc-5', partyId: 'solar-cp-2', signatoryName: 'Thomas White', signatoryTitle: 'Managing Director', status: 'signed', signedAt: new Date('2026-02-10') },
  ], satisfiesConditionIds: ['solar-cond-5'] },
  { id: 'solar-doc-6', dealId: 'solar-demo', documentType: 'security', title: 'Pledge Agreement', fileName: 'DesertSun_Pledge_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-6.pdf', status: 'executed', responsiblePartyId: 'solar-cp-4', uploadedAt: new Date('2026-02-10'), uploadedBy: 'david.kim@lw.com', dueDate: new Date('2026-02-20'), signatures: [
    { id: 'solar-sig-5', documentId: 'solar-doc-6', partyId: 'solar-cp-1', signatoryName: 'Amanda Lee', signatoryTitle: 'CFO, Sponsor', status: 'signed', signedAt: new Date('2026-02-10') },
  ], satisfiesConditionIds: ['solar-cond-6'] },
  { id: 'solar-doc-7', dealId: 'solar-demo', documentType: 'security', title: 'Mortgage/Deed of Trust', fileName: 'DesertSun_Mortgage.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-7.pdf', status: 'pending', responsiblePartyId: 'solar-cp-4', uploadedAt: new Date('2026-02-12'), uploadedBy: 'david.kim@lw.com', dueDate: new Date('2026-02-28'), signatures: [], satisfiesConditionIds: ['solar-cond-7'] },
  { id: 'solar-doc-8', dealId: 'solar-demo', documentType: 'security', title: 'Assignment of Project Contracts', fileName: 'DesertSun_Contract_Assignment.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-8.pdf', status: 'pending', responsiblePartyId: 'solar-cp-4', uploadedAt: new Date('2026-02-12'), uploadedBy: 'david.kim@lw.com', dueDate: new Date('2026-02-28'), signatures: [], satisfiesConditionIds: ['solar-cond-8'] },
  // ── Technical / IE ──
  { id: 'solar-doc-9', dealId: 'solar-demo', documentType: 'technical', title: 'Independent Engineer Report', fileName: 'DesertSun_IE_Report_Leidos.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-9.pdf', status: 'uploaded', responsiblePartyId: 'solar-cp-7', uploadedAt: new Date('2026-02-05'), uploadedBy: 'engineer@leidos.com', dueDate: new Date('2026-02-15'), signatures: [], satisfiesConditionIds: ['solar-cond-19', 'solar-cond-33'] },
  // ── Financial Documents ──
  { id: 'solar-doc-10', dealId: 'solar-demo', documentType: 'financial', title: 'Financial Model (Base Case)', fileName: 'DesertSun_Financial_Model.xlsx', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', storagePath: '/documents/solar-doc-10.xlsx', status: 'uploaded', responsiblePartyId: 'solar-cp-1', uploadedAt: new Date('2026-02-01'), uploadedBy: 'rmartinez@desertsun.com', dueDate: new Date('2026-02-15'), signatures: [], satisfiesConditionIds: ['solar-cond-21'] },
  { id: 'solar-doc-11', dealId: 'solar-demo', documentType: 'financial', title: 'Construction Budget', fileName: 'DesertSun_Construction_Budget.xlsx', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', storagePath: '/documents/solar-doc-11.xlsx', status: 'uploaded', responsiblePartyId: 'solar-cp-1', uploadedAt: new Date('2026-02-02'), uploadedBy: 'rmartinez@desertsun.com', dueDate: new Date('2026-02-15'), signatures: [], satisfiesConditionIds: ['solar-cond-22'] },
  // ── Offtake / Interconnection ──
  { id: 'solar-doc-12', dealId: 'solar-demo', documentType: 'offtake', title: 'Interconnection Agreement', fileName: 'DesertSun_LGIA.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-12.pdf', status: 'executed', responsiblePartyId: 'solar-cp-1', uploadedAt: new Date('2026-01-25'), uploadedBy: 'rmartinez@desertsun.com', dueDate: new Date('2026-02-20'), signatures: [
    { id: 'solar-sig-6', documentId: 'solar-doc-12', partyId: 'solar-cp-1', signatoryName: 'Robert Martinez', signatoryTitle: 'Project Director', status: 'signed', signedAt: new Date('2026-01-25') },
  ], satisfiesConditionIds: ['solar-cond-29', 'solar-cond-41'] },
  // ── EPC Contract ──
  { id: 'solar-doc-13', dealId: 'solar-demo', documentType: 'technical', title: 'EPC Contract', fileName: 'DesertSun_EPC_Contract.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-13.pdf', status: 'executed', responsiblePartyId: 'solar-cp-6', uploadedAt: new Date('2026-01-15'), uploadedBy: 'contracts@firstsolar.com', dueDate: new Date('2026-02-15'), signatures: [
    { id: 'solar-sig-7', documentId: 'solar-doc-13', partyId: 'solar-cp-1', signatoryName: 'Robert Martinez', signatoryTitle: 'Project Director', status: 'signed', signedAt: new Date('2026-01-15') },
    { id: 'solar-sig-8', documentId: 'solar-doc-13', partyId: 'solar-cp-6', signatoryName: 'Mark Torres', signatoryTitle: 'VP, EPC Projects', status: 'signed', signedAt: new Date('2026-01-15') },
  ], satisfiesConditionIds: ['solar-cond-32'] },
  // ── PPA ──
  { id: 'solar-doc-14', dealId: 'solar-demo', documentType: 'offtake', title: 'Power Purchase Agreement (PPA)', fileName: 'DesertSun_PPA.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-14.pdf', status: 'executed', responsiblePartyId: 'solar-cp-8', uploadedAt: new Date('2026-01-20'), uploadedBy: 'rmartinez@desertsun.com', dueDate: new Date('2026-02-15'), signatures: [
    { id: 'solar-sig-9', documentId: 'solar-doc-14', partyId: 'solar-cp-1', signatoryName: 'Robert Martinez', signatoryTitle: 'Project Director', status: 'signed', signedAt: new Date('2026-01-20') },
    { id: 'solar-sig-10', documentId: 'solar-doc-14', partyId: 'solar-cp-8', signatoryName: 'Patricia Nguyen', signatoryTitle: 'VP, Power Supply', status: 'signed', signedAt: new Date('2026-01-20') },
  ], satisfiesConditionIds: ['solar-cond-40'] },
  // ── Tax Equity Partnership ──
  { id: 'solar-doc-15', dealId: 'solar-demo', documentType: 'tax_equity', title: 'Tax Equity Partnership Agreement (Draft)', fileName: 'DesertSun_TEPA_Draft.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-15.pdf', status: 'pending', responsiblePartyId: 'solar-cp-3', uploadedAt: new Date('2026-02-08'), uploadedBy: 'kchen@taxequityfund.com', dueDate: new Date('2026-02-28'), signatures: [
    { id: 'solar-sig-11', documentId: 'solar-doc-15', partyId: 'solar-cp-1', signatoryName: 'Amanda Lee', signatoryTitle: 'CFO, Sponsor', status: 'pending', signedAt: null },
    { id: 'solar-sig-12', documentId: 'solar-doc-15', partyId: 'solar-cp-3', signatoryName: 'Katherine Chen', signatoryTitle: 'Partner', status: 'pending', signedAt: null },
  ], satisfiesConditionIds: ['solar-cond-36'] },
  // ── Geotechnical ──
  { id: 'solar-doc-16', dealId: 'solar-demo', documentType: 'technical', title: 'Geotechnical Study', fileName: 'DesertSun_Geotech_Report.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-16.pdf', status: 'uploaded', responsiblePartyId: 'solar-cp-1', uploadedAt: new Date('2026-01-15'), uploadedBy: 'rmartinez@desertsun.com', dueDate: new Date('2026-01-31'), signatures: [], satisfiesConditionIds: ['solar-cond-34'] },
  // ── Corporate ──
  { id: 'solar-doc-17', dealId: 'solar-demo', documentType: 'corporate', title: "Officer's Certificate", fileName: 'DesertSun_Officers_Certificate.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-17.pdf', status: 'uploaded', responsiblePartyId: 'solar-cp-1', uploadedAt: new Date('2026-02-08'), uploadedBy: 'rmartinez@desertsun.com', dueDate: new Date('2026-02-20'), signatures: [], satisfiesConditionIds: ['solar-cond-12'] },
  // ── Insurance ──
  { id: 'solar-doc-18', dealId: 'solar-demo', documentType: 'insurance', title: "Builder's Risk Insurance Certificate", fileName: 'DesertSun_Builders_Risk.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-18.pdf', status: 'uploaded', responsiblePartyId: 'solar-cp-1', uploadedAt: new Date('2026-02-01'), uploadedBy: 'admin@desertsun.com', dueDate: new Date('2026-02-15'), signatures: [], satisfiesConditionIds: ['solar-cond-24'] },
  // ── REC Agreement ──
  { id: 'solar-doc-19', dealId: 'solar-demo', documentType: 'offtake', title: 'REC Purchase Agreement', fileName: 'DesertSun_REC_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/solar-doc-19.pdf', status: 'uploaded', responsiblePartyId: 'solar-cp-1', uploadedAt: new Date('2026-01-28'), uploadedBy: 'rmartinez@desertsun.com', dueDate: new Date('2026-02-15'), signatures: [], satisfiesConditionIds: ['solar-cond-42'] },
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
  id: 'wind-demo', name: 'Prairie Wind Farm', dealType: 'project_finance', facilityAmount: 320_000_000, currency: 'USD', status: 'negotiation', currentVersionId: 'wind-version-3', parties: windNegotiationParties, targetClosingDate: new Date('2026-02-20'), actualClosingDate: null, maturityDate: new Date('2041-03-31'), createdAt: new Date('2025-09-15'), updatedAt: new Date('2025-11-15'), createdBy: 'lyamamoto@mufg.com',
};

const windClosingParties: ClosingParty[] = [
  { id: 'wind-cp-1', dealId: 'wind-demo', name: 'Prairie Wind Holdings LLC', shortName: 'Borrower', role: 'borrower', partyType: 'borrower' },
  { id: 'wind-cp-2', dealId: 'wind-demo', name: 'MUFG', shortName: 'Agent', role: 'administrative_agent', partyType: 'agent' },
  { id: 'wind-cp-3', dealId: 'wind-demo', name: 'Kirkland & Ellis', shortName: 'Borrower Counsel', role: 'counsel', partyType: 'law_firm' },
  { id: 'wind-cp-4', dealId: 'wind-demo', name: 'Paul, Weiss', shortName: 'Agent Counsel', role: 'counsel', partyType: 'law_firm' },
  { id: 'wind-cp-5', dealId: 'wind-demo', name: 'Vestas Wind Systems', shortName: 'Turbine OEM', role: 'contractor', partyType: 'consultant' },
  { id: 'wind-cp-6', dealId: 'wind-demo', name: 'DNV Energy', shortName: 'Indep. Engineer', role: 'consultant', partyType: 'consultant' },
  { id: 'wind-cp-7', dealId: 'wind-demo', name: 'Great Plains Electric Cooperative', shortName: 'Offtaker', role: 'offtaker', partyType: 'offtaker' },
];

const windClosingConditions: ConditionPrecedent[] = [
  // ── Credit Agreement (3) ──
  { id: 'wind-cond-1', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(a)(i)', category: 'credit_agreement', title: 'Credit Agreement Execution', description: 'Fully executed Credit Agreement among Borrower, Lenders, and Administrative Agent', responsiblePartyId: 'wind-cp-3', status: 'pending', dueDate: new Date('2026-02-20'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Final form circulated' },
  { id: 'wind-cond-2', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(a)(ii)', category: 'credit_agreement', title: 'Depositary Agreement', description: 'Executed Depositary Agreement establishing project revenue and reserve accounts', responsiblePartyId: 'wind-cp-2', status: 'pending', dueDate: new Date('2026-02-18'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Depositary bank engaged' },
  { id: 'wind-cond-3', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(a)(iii)', category: 'credit_agreement', title: 'Collateral Agency Agreement', description: 'Executed Collateral Agency Agreement appointing collateral agent', responsiblePartyId: 'wind-cp-4', status: 'pending', dueDate: new Date('2026-02-20'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Security Documents (4) ──
  { id: 'wind-cond-4', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(b)(i)', category: 'security_documents', title: 'Security Agreement', description: 'Security Agreement granting first-priority security interest in all project assets', responsiblePartyId: 'wind-cp-3', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-05'), satisfiedByDocumentIds: ['wind-doc-4'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-5', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(b)(ii)', category: 'security_documents', title: 'Pledge Agreement', description: 'Pledge of 100% of membership interests in Borrower by Sponsor', responsiblePartyId: 'wind-cp-3', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-05'), satisfiedByDocumentIds: ['wind-doc-5'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-6', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(b)(iii)', category: 'security_documents', title: 'Mortgage/Deed of Trust', description: 'Mortgage over project site real property (12,000 acres, multiple parcels, Oklahoma)', responsiblePartyId: 'wind-cp-3', status: 'pending', dueDate: new Date('2026-02-18'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Local counsel finalizing legal descriptions' },
  { id: 'wind-cond-7', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(b)(iv)', category: 'security_documents', title: 'Assignment of Project Contracts', description: 'Collateral assignment of TSA, PPA, O&M Agreement, and Interconnection Agreement', responsiblePartyId: 'wind-cp-3', status: 'pending', dueDate: new Date('2026-02-18'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Counterparty consents required' },
  // ── Corporate Documents (4) ──
  { id: 'wind-cond-8', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(c)(i)', category: 'corporate_documents', title: 'Certificate of Formation', description: 'Certified copy of the Certificate of Formation of Prairie Wind Holdings LLC from Delaware', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-9', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(c)(ii)', category: 'corporate_documents', title: 'LLC Agreement', description: 'Certified copy of the Amended and Restated LLC Agreement of the Borrower', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-20'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-10', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(c)(iii)', category: 'corporate_documents', title: "Officer's Certificate", description: 'Certificate of authorized officer certifying incumbency, resolutions, and no default', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-03'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-11', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(c)(iv)', category: 'corporate_documents', title: 'Good Standing Certificate (DE)', description: 'Certificate of Good Standing from Delaware Secretary of State', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Legal Opinions (3) ──
  { id: 'wind-cond-12', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(d)(i)', category: 'legal_opinions', title: 'Borrower Counsel Opinion', description: 'Legal opinion of Kirkland & Ellis covering enforceability, authorization, and no conflicts', responsiblePartyId: 'wind-cp-3', status: 'pending', dueDate: new Date('2026-02-18'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Draft in preparation' },
  { id: 'wind-cond-13', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(d)(ii)', category: 'legal_opinions', title: 'Agent Counsel Opinion', description: 'Legal opinion of Paul, Weiss covering perfection and priority of security interests', responsiblePartyId: 'wind-cp-4', status: 'pending', dueDate: new Date('2026-02-18'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-14', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(d)(iii)', category: 'legal_opinions', title: 'Regulatory Counsel Opinion', description: 'Opinion of Oklahoma regulatory counsel on utility and energy regulatory compliance', responsiblePartyId: 'wind-cp-3', status: 'pending', dueDate: new Date('2026-02-18'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Engaging local Oklahoma counsel' },
  // ── Certificates (3) ──
  { id: 'wind-cond-15', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(e)(i)', category: 'certificates', title: 'Closing Certificate', description: 'Borrower closing certificate certifying representations, no default, and satisfaction of conditions', responsiblePartyId: 'wind-cp-1', status: 'pending', dueDate: new Date('2026-02-20'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'To be delivered at closing' },
  { id: 'wind-cond-16', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(e)(ii)', category: 'certificates', title: 'Solvency Certificate', description: 'Certificate from CFO as to solvency of the Borrower', responsiblePartyId: 'wind-cp-1', status: 'pending', dueDate: new Date('2026-02-20'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-17', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(e)(iii)', category: 'certificates', title: 'Independent Engineer Certificate', description: "Independent Engineer's certificate confirming feasibility and technical design adequacy", responsiblePartyId: 'wind-cp-6', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: ['wind-doc-7'], waivedAt: null, waiverApprovedBy: null, notes: 'DNV IE report delivered' },
  // ── Financial (3) ──
  { id: 'wind-cond-18', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(f)(i)', category: 'financial', title: 'Financial Model (Base Case)', description: 'Board-approved base case financial model with Agent-agreed assumptions', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: ['wind-doc-8'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-19', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(f)(ii)', category: 'financial', title: 'Construction Budget', description: 'Detailed construction budget approved by Independent Engineer', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '$290M total project cost' },
  { id: 'wind-cond-20', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(f)(iii)', category: 'financial', title: 'Drawdown Schedule', description: 'Initial drawdown schedule consistent with construction schedule and turbine delivery dates', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-05'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Insurance (3) ──
  { id: 'wind-cond-21', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(g)(i)', category: 'insurance', title: "Builder's Risk Insurance", description: "Builder's all-risk insurance covering project during construction for full replacement value", responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-22', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(g)(ii)', category: 'insurance', title: 'Equipment Breakdown Insurance', description: 'Equipment breakdown coverage for turbines and electrical equipment during testing', responsiblePartyId: 'wind-cp-1', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Awaiting binder from broker' },
  { id: 'wind-cond-23', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(g)(iii)', category: 'insurance', title: 'Commercial General Liability', description: 'CGL insurance with $5M per occurrence / $10M aggregate, Agent as additional insured', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-02-01'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Permits (5) ──
  { id: 'wind-cond-24', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(h)(i)', category: 'permits', title: 'FAA Determination of No Hazard', description: 'FAA Determination of No Hazard to Air Navigation for all 36 turbine locations', responsiblePartyId: 'wind-cp-1', status: 'pending', dueDate: new Date('2026-02-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'OVERDUE — 32 of 36 determinations received, 4 pending re-study due to flight path revision' },
  { id: 'wind-cond-25', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(h)(ii)', category: 'permits', title: 'CUP/Zoning Approval', description: 'Conditional Use Permit from Garfield County, Oklahoma for wind energy development', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-01-15'), satisfiedAt: new Date('2026-01-05'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Approved unanimously by County Commission' },
  { id: 'wind-cond-26', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(h)(iii)', category: 'permits', title: 'NEPA Clearance', description: 'National Environmental Policy Act environmental assessment or categorical exclusion', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-01-31'), satisfiedAt: new Date('2026-01-15'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'EA with FONSI issued' },
  { id: 'wind-cond-27', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(h)(iv)', category: 'permits', title: 'State Utility Commission Approval', description: 'Oklahoma Corporation Commission approval of power purchase structure', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-18'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-28', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(h)(v)', category: 'permits', title: 'Tribal Consultation Clearance', description: 'Completed Section 106 tribal consultation and clearance from relevant tribal nations', responsiblePartyId: 'wind-cp-1', status: 'pending', dueDate: new Date('2026-02-01'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'OVERDUE — final meeting with Osage Nation scheduled Feb 12' },
  // ── Technical (4) ──
  { id: 'wind-cond-29', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(i)(i)', category: 'technical', title: 'Turbine Supply Agreement', description: 'Fully executed Turbine Supply Agreement with Vestas for 36x V150-4.2 MW turbines', responsiblePartyId: 'wind-cp-5', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-15'), satisfiedByDocumentIds: ['wind-doc-9'], waivedAt: null, waiverApprovedBy: null, notes: 'V150-4.2 MW, hub height 105m' },
  { id: 'wind-cond-30', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(i)(ii)', category: 'technical', title: 'Wind Resource Assessment (P50/P75/P90)', description: 'Independent wind resource assessment with at least 2 years of on-site met tower data', responsiblePartyId: 'wind-cp-6', status: 'satisfied', dueDate: new Date('2026-01-15'), satisfiedAt: new Date('2025-12-20'), satisfiedByDocumentIds: ['wind-doc-10'], waivedAt: null, waiverApprovedBy: null, notes: 'DNV completed — P50: 525 GWh/yr, P90: 468 GWh/yr' },
  { id: 'wind-cond-31', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(i)(iii)', category: 'technical', title: 'Geotechnical Report', description: 'Geotechnical study confirming soil conditions suitable for turbine foundations', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-01-15'), satisfiedAt: new Date('2025-12-15'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-32', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(i)(iv)', category: 'technical', title: 'Foundation Design Package', description: 'Final foundation design approved by Independent Engineer for all 36 turbine locations', responsiblePartyId: 'wind-cp-1', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '32 of 36 locations approved, 4 pending revised geotech' },
  // ── Offtake (3) ──
  { id: 'wind-cond-33', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(j)(i)', category: 'offtake', title: 'PPA / Hedge Agreement', description: '15-year fixed-price hedge with investment-grade counterparty', responsiblePartyId: 'wind-cp-7', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-25'), satisfiedByDocumentIds: ['wind-doc-11'], waivedAt: null, waiverApprovedBy: null, notes: '15-year term at $38/MWh escalating 2%/yr' },
  { id: 'wind-cond-34', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(j)(ii)', category: 'offtake', title: 'Interconnection Agreement', description: 'Executed Large Generator Interconnection Agreement with SPP', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-01'), satisfiedAt: new Date('2026-01-10'), satisfiedByDocumentIds: ['wind-doc-12'], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-35', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(j)(iii)', category: 'offtake', title: 'REC Purchase Agreement', description: 'Executed Renewable Energy Certificate purchase agreement', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-02-10'), satisfiedAt: new Date('2026-01-28'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Consents (2) ──
  { id: 'wind-cond-36', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(k)(i)', category: 'consents', title: 'Turbine OEM Consent', description: 'Consent of Vestas to collateral assignment of Turbine Supply Agreement to Collateral Agent', responsiblePartyId: 'wind-cp-5', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Vestas legal reviewing form of consent' },
  { id: 'wind-cond-37', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(k)(ii)', category: 'consents', title: 'O&M Provider Consent', description: 'Consent of Vestas Service to collateral assignment of O&M Agreement', responsiblePartyId: 'wind-cp-5', status: 'pending', dueDate: new Date('2026-02-15'), satisfiedAt: null, satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  // ── Due Diligence (3) ──
  { id: 'wind-cond-38', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(l)(i)', category: 'due_diligence', title: 'Avian & Wildlife Study', description: 'Avian and bat mortality study conducted per USFWS guidelines covering at least 2 years of data', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-01-31'), satisfiedAt: new Date('2026-01-10'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'No significant impacts identified; eagle take permit not required' },
  { id: 'wind-cond-39', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(l)(ii)', category: 'due_diligence', title: 'Noise Impact Assessment', description: 'Noise propagation study confirming compliance with Oklahoma noise standards at all receptor locations', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-01-31'), satisfiedAt: new Date('2026-01-08'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: '' },
  { id: 'wind-cond-40', dealId: 'wind-demo', versionId: 'wind-version-3', sectionReference: '4.01(l)(iii)', category: 'due_diligence', title: 'Shadow Flicker Analysis', description: 'Shadow flicker analysis confirming less than 30 hours per year at all residential receptors', responsiblePartyId: 'wind-cp-1', status: 'satisfied', dueDate: new Date('2026-01-31'), satisfiedAt: new Date('2026-01-08'), satisfiedByDocumentIds: [], waivedAt: null, waiverApprovedBy: null, notes: 'Max 18 hrs/yr at nearest receptor' },
];

const windClosingDocuments: ClosingDocument[] = [
  // ── Credit Agreement Documents ──
  { id: 'wind-doc-1', dealId: 'wind-demo', documentType: 'credit_agreement', title: 'Credit Agreement', fileName: 'PrairieWind_Credit_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-1.pdf', status: 'pending', responsiblePartyId: 'wind-cp-3', uploadedAt: new Date('2026-02-05'), uploadedBy: 'mstevens@kirkland.com', dueDate: new Date('2026-02-20'), signatures: [
    { id: 'wind-sig-1', documentId: 'wind-doc-1', partyId: 'wind-cp-1', signatoryName: 'James Cooper', signatoryTitle: 'CEO', status: 'pending', signedAt: null },
    { id: 'wind-sig-2', documentId: 'wind-doc-1', partyId: 'wind-cp-2', signatoryName: 'Lisa Yamamoto', signatoryTitle: 'Director', status: 'pending', signedAt: null },
  ], satisfiesConditionIds: ['wind-cond-1'] },
  { id: 'wind-doc-2', dealId: 'wind-demo', documentType: 'credit_agreement', title: 'Depositary Agreement', fileName: 'PrairieWind_Depositary.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-2.pdf', status: 'pending', responsiblePartyId: 'wind-cp-2', uploadedAt: new Date('2026-02-05'), uploadedBy: 'lyamamoto@mufg.com', dueDate: new Date('2026-02-18'), signatures: [], satisfiesConditionIds: ['wind-cond-2'] },
  { id: 'wind-doc-3', dealId: 'wind-demo', documentType: 'credit_agreement', title: 'Collateral Agency Agreement', fileName: 'PrairieWind_Collateral_Agency.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-3.pdf', status: 'pending', responsiblePartyId: 'wind-cp-4', uploadedAt: new Date('2026-02-05'), uploadedBy: 'rgreen@paulweiss.com', dueDate: new Date('2026-02-20'), signatures: [], satisfiesConditionIds: ['wind-cond-3'] },
  // ── Security Documents ──
  { id: 'wind-doc-4', dealId: 'wind-demo', documentType: 'security', title: 'Security Agreement', fileName: 'PrairieWind_Security_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-4.pdf', status: 'executed', responsiblePartyId: 'wind-cp-3', uploadedAt: new Date('2026-02-05'), uploadedBy: 'mstevens@kirkland.com', dueDate: new Date('2026-02-10'), signatures: [
    { id: 'wind-sig-3', documentId: 'wind-doc-4', partyId: 'wind-cp-1', signatoryName: 'James Cooper', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-02-05') },
    { id: 'wind-sig-4', documentId: 'wind-doc-4', partyId: 'wind-cp-2', signatoryName: 'Lisa Yamamoto', signatoryTitle: 'Director', status: 'signed', signedAt: new Date('2026-02-05') },
  ], satisfiesConditionIds: ['wind-cond-4'] },
  { id: 'wind-doc-5', dealId: 'wind-demo', documentType: 'security', title: 'Pledge Agreement', fileName: 'PrairieWind_Pledge_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-5.pdf', status: 'executed', responsiblePartyId: 'wind-cp-3', uploadedAt: new Date('2026-02-05'), uploadedBy: 'mstevens@kirkland.com', dueDate: new Date('2026-02-10'), signatures: [
    { id: 'wind-sig-5', documentId: 'wind-doc-5', partyId: 'wind-cp-1', signatoryName: 'James Cooper', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-02-05') },
  ], satisfiesConditionIds: ['wind-cond-5'] },
  { id: 'wind-doc-6', dealId: 'wind-demo', documentType: 'security', title: 'Mortgage/Deed of Trust', fileName: 'PrairieWind_Mortgage.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-6.pdf', status: 'pending', responsiblePartyId: 'wind-cp-3', uploadedAt: new Date('2026-02-08'), uploadedBy: 'mstevens@kirkland.com', dueDate: new Date('2026-02-18'), signatures: [], satisfiesConditionIds: ['wind-cond-6'] },
  // ── Independent Engineer ──
  { id: 'wind-doc-7', dealId: 'wind-demo', documentType: 'technical', title: 'Independent Engineer Report', fileName: 'PrairieWind_IE_Report_DNV.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-7.pdf', status: 'uploaded', responsiblePartyId: 'wind-cp-6', uploadedAt: new Date('2026-01-28'), uploadedBy: 'engineer@dnv.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['wind-cond-17'] },
  // ── Financial Model ──
  { id: 'wind-doc-8', dealId: 'wind-demo', documentType: 'financial', title: 'Financial Model (Base Case)', fileName: 'PrairieWind_Financial_Model.xlsx', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', storagePath: '/documents/wind-doc-8.xlsx', status: 'uploaded', responsiblePartyId: 'wind-cp-1', uploadedAt: new Date('2026-01-25'), uploadedBy: 'jcooper@prairiewind.com', dueDate: new Date('2026-02-05'), signatures: [], satisfiesConditionIds: ['wind-cond-18'] },
  // ── Turbine Supply Agreement ──
  { id: 'wind-doc-9', dealId: 'wind-demo', documentType: 'technical', title: 'Turbine Supply Agreement', fileName: 'PrairieWind_TSA_Vestas.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-9.pdf', status: 'executed', responsiblePartyId: 'wind-cp-5', uploadedAt: new Date('2026-01-15'), uploadedBy: 'jcooper@prairiewind.com', dueDate: new Date('2026-02-01'), signatures: [
    { id: 'wind-sig-6', documentId: 'wind-doc-9', partyId: 'wind-cp-1', signatoryName: 'James Cooper', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-15') },
    { id: 'wind-sig-7', documentId: 'wind-doc-9', partyId: 'wind-cp-5', signatoryName: 'Henrik Jensen', signatoryTitle: 'VP, Americas', status: 'signed', signedAt: new Date('2026-01-15') },
  ], satisfiesConditionIds: ['wind-cond-29'] },
  // ── Wind Resource Assessment ──
  { id: 'wind-doc-10', dealId: 'wind-demo', documentType: 'technical', title: 'Wind Resource Assessment (P50/P75/P90)', fileName: 'PrairieWind_Wind_Study_DNV.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-10.pdf', status: 'uploaded', responsiblePartyId: 'wind-cp-6', uploadedAt: new Date('2025-12-20'), uploadedBy: 'engineer@dnv.com', dueDate: new Date('2026-01-15'), signatures: [], satisfiesConditionIds: ['wind-cond-30'] },
  // ── PPA / Hedge ──
  { id: 'wind-doc-11', dealId: 'wind-demo', documentType: 'offtake', title: 'PPA / Hedge Agreement', fileName: 'PrairieWind_Hedge_Agreement.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-11.pdf', status: 'executed', responsiblePartyId: 'wind-cp-7', uploadedAt: new Date('2026-01-25'), uploadedBy: 'jcooper@prairiewind.com', dueDate: new Date('2026-02-10'), signatures: [
    { id: 'wind-sig-8', documentId: 'wind-doc-11', partyId: 'wind-cp-1', signatoryName: 'James Cooper', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-25') },
    { id: 'wind-sig-9', documentId: 'wind-doc-11', partyId: 'wind-cp-7', signatoryName: 'Robert Hall', signatoryTitle: 'VP, Power Supply', status: 'signed', signedAt: new Date('2026-01-25') },
  ], satisfiesConditionIds: ['wind-cond-33'] },
  // ── Interconnection Agreement ──
  { id: 'wind-doc-12', dealId: 'wind-demo', documentType: 'offtake', title: 'Interconnection Agreement', fileName: 'PrairieWind_LGIA_SPP.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-12.pdf', status: 'executed', responsiblePartyId: 'wind-cp-1', uploadedAt: new Date('2026-01-10'), uploadedBy: 'jcooper@prairiewind.com', dueDate: new Date('2026-02-01'), signatures: [
    { id: 'wind-sig-10', documentId: 'wind-doc-12', partyId: 'wind-cp-1', signatoryName: 'James Cooper', signatoryTitle: 'CEO', status: 'signed', signedAt: new Date('2026-01-10') },
  ], satisfiesConditionIds: ['wind-cond-34'] },
  // ── Insurance ──
  { id: 'wind-doc-13', dealId: 'wind-demo', documentType: 'insurance', title: "Builder's Risk Insurance Certificate", fileName: 'PrairieWind_Builders_Risk.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-13.pdf', status: 'uploaded', responsiblePartyId: 'wind-cp-1', uploadedAt: new Date('2026-02-01'), uploadedBy: 'admin@prairiewind.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['wind-cond-21'] },
  // ── Corporate ──
  { id: 'wind-doc-14', dealId: 'wind-demo', documentType: 'corporate', title: "Officer's Certificate", fileName: 'PrairieWind_Officers_Certificate.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-14.pdf', status: 'uploaded', responsiblePartyId: 'wind-cp-1', uploadedAt: new Date('2026-02-03'), uploadedBy: 'jcooper@prairiewind.com', dueDate: new Date('2026-02-10'), signatures: [], satisfiesConditionIds: ['wind-cond-10'] },
  // ── Avian Study ──
  { id: 'wind-doc-15', dealId: 'wind-demo', documentType: 'due_diligence', title: 'Avian & Wildlife Study', fileName: 'PrairieWind_Avian_Study.pdf', fileType: 'application/pdf', storagePath: '/documents/wind-doc-15.pdf', status: 'uploaded', responsiblePartyId: 'wind-cp-1', uploadedAt: new Date('2026-01-10'), uploadedBy: 'jcooper@prairiewind.com', dueDate: new Date('2026-01-31'), signatures: [], satisfiesConditionIds: ['wind-cond-38'] },
];

const windClosingDeal: ClosingDeal = { id: 'wind-demo', name: 'Prairie Wind Farm', facilityAmount: 320_000_000, currency: 'USD', targetClosingDate: new Date('2026-02-20'), status: 'closing' };

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
  facility: '$320M Construction + Term Loan',
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
